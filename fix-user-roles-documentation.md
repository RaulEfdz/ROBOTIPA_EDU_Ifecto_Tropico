# User Role Fix Documentation

## Problem Description

Some users in the system have purchases but don't have the correct student role. Specifically:
- Users with purchases should have `customRole: "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"` (STUDENT_ID)
- But some users have `customRole: "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"` (VISITOR_ID) despite having purchases

## Solution Overview

Two solutions have been implemented:

1. **One-time Script**: `/scripts/fixUserRolesWithPurchases.ts`
2. **Admin API Endpoint**: `/api/admin/users/fix-roles`

## 1. One-Time Script Usage

### File Location
```
/scripts/fixUserRolesWithPurchases.ts
```

### Prerequisites
- Ensure `STUDENT_ID` and `VISITOR_ID` are set in your environment variables
- Have database access configured

### Running the Script

#### Development Environment
```bash
# Navigate to project root
cd /Users/raulfernandez/Documents/RF/ROBOTIPA_EDU_Ifecto_Tropico

# Run the script
npx tsx scripts/fixUserRolesWithPurchases.ts
```

#### Production Environment
```bash
# Set confirmation flag for production
export CONFIRM_ROLE_FIX=true

# Run the script
npx tsx scripts/fixUserRolesWithPurchases.ts
```

### Script Features
- ✅ Identifies users with purchases but incorrect roles
- ✅ Shows detailed information about each user before fixing
- ✅ Provides summary statistics
- ✅ Production safety checks (requires confirmation)
- ✅ Proper error handling and logging
- ✅ Database connection cleanup

### Expected Output
```
🚀 Starting user role fix script...
📝 Student Role ID: ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef
📝 Visitor Role ID: 90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8
🔍 Finding users with purchases but incorrect roles...
📊 Found 1 users with purchases but incorrect roles:
  - Jorge Luis Bonilla (jorge@example.com)
    Current role: 90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8
    Purchases: 3
    ---
🔧 Starting to fix 1 users...
✅ Fixed role for user jorge@example.com (user-id-123)
📊 SUMMARY:
✅ Successfully fixed: 1 users
❌ Failed to fix: 0 users
✨ User roles have been updated successfully!
```

## 2. Admin API Endpoint Usage

### Endpoint
```
GET/POST /api/admin/users/fix-roles
```

### Authentication
- Only users with `admin` role can access this endpoint
- Requires valid authentication session

### GET Request - Find Users to Fix
```bash
curl -X GET \
  'http://localhost:3000/api/admin/users/fix-roles' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN'
```

**Response:**
```json
{
  "success": true,
  "message": "Se encontraron 1 usuarios con compras pero roles incorrectos.",
  "data": {
    "usersToFix": [
      {
        "id": "user-id-123",
        "fullName": "Jorge Luis Bonilla",
        "email": "jorge@example.com",
        "customRole": "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8",
        "purchaseCount": 3,
        "purchases": [...]
      }
    ],
    "totalCount": 1,
    "studentRoleId": "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef",
    "visitorRoleId": "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"
  }
}
```

### POST Request - Fix User Roles

#### Fix All Users
```bash
curl -X POST \
  'http://localhost:3000/api/admin/users/fix-roles' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -d '{
    "fixAll": true
  }'
```

#### Fix Specific Users
```bash
curl -X POST \
  'http://localhost:3000/api/admin/users/fix-roles' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -d '{
    "userIds": ["user-id-123", "user-id-456"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Proceso completado. 1 usuarios corregidos, 0 errores.",
  "data": {
    "fixed": [
      {
        "userId": "user-id-123",
        "userEmail": "jorge@example.com",
        "userFullName": "Jorge Luis Bonilla",
        "previousRole": "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8",
        "purchaseCount": 3,
        "success": true
      }
    ],
    "errors": [],
    "totalProcessed": 1,
    "successCount": 1,
    "errorCount": 0,
    "newRole": "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"
  }
}
```

## Environment Variables Required

Ensure these environment variables are set:

```bash
STUDENT_ID="ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"
VISITOR_ID="90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"
```

## Database Schema

The solution works with these database tables:
- `User` table with `customRole` field
- `Purchase` table with `userId` and `courseId` fields

## Safety Considerations

1. **Backup**: Always backup your database before running fixes in production
2. **Testing**: Test the script in development first
3. **Confirmation**: Production script requires `CONFIRM_ROLE_FIX=true`
4. **Permissions**: API endpoint requires admin authentication
5. **Logging**: All operations are logged for audit trails

## Integration with Existing Admin Panel

The API endpoint can be integrated into the existing admin panel at:
- `/app/(dashboard)/(routes)/admin/users/`

You can add a new component to call the fix-roles endpoint from the admin interface.

## Troubleshooting

### Common Issues
1. **Missing Environment Variables**: Ensure `STUDENT_ID` is set
2. **Permission Denied**: Verify admin authentication for API endpoint
3. **Database Connection**: Check database connection in script
4. **No Users Found**: Verify users actually have purchases and wrong roles

### Error Handling
Both solutions include comprehensive error handling:
- Database connection errors
- Permission errors
- Invalid input validation
- Individual user update failures

## Monitoring

After running the fix:
1. Check that users with purchases now have the correct student role
2. Verify users can still access their purchased courses
3. Monitor for any authentication or permission issues

---

## Quick Start

1. **For immediate fix**: Run the script
   ```bash
   npx tsx scripts/fixUserRolesWithPurchases.ts
   ```

2. **For ongoing management**: Use the API endpoint
   ```bash
   # Check for users to fix
   GET /api/admin/users/fix-roles
   
   # Fix all users
   POST /api/admin/users/fix-roles
   Body: { "fixAll": true }
   ```