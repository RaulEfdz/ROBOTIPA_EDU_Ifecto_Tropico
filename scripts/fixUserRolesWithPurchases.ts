// scripts/fixUserRolesWithPurchases.ts
// One-time script to fix users who have purchases but don't have the correct student role

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Environment variables for role IDs
const STUDENT_ID = process.env.STUDENT_ID; // "ed201ae2-87f7-4bc4-803c-fc9e8c1cc3ef"
const VISITOR_ID = process.env.VISITOR_ID; // "90a4f59c-b458-4d01-9df1-5cc2fdcb9cb8"

interface UserToFix {
  id: string;
  fullName: string;
  email: string;
  customRole: string;
  purchaseCount: number;
}

async function findUsersWithPurchasesAndWrongRole(): Promise<UserToFix[]> {
  console.log("🔍 Finding users with purchases but incorrect roles...");
  
  // Find users who have purchases but don't have the student role
  const usersWithPurchases = await db.user.findMany({
    where: {
      purchases: {
        some: {} // Has at least one purchase
      },
      customRole: {
        not: STUDENT_ID // Role is NOT student
      }
    },
    include: {
      purchases: {
        select: {
          id: true,
          courseId: true,
          createdAt: true
        }
      }
    }
  });

  const usersToFix: UserToFix[] = usersWithPurchases.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    customRole: user.customRole,
    purchaseCount: user.purchases.length
  }));

  console.log(`📊 Found ${usersToFix.length} users with purchases but incorrect roles:`);
  usersToFix.forEach(user => {
    console.log(`  - ${user.fullName} (${user.email})`);
    console.log(`    Current role: ${user.customRole}`);
    console.log(`    Purchases: ${user.purchaseCount}`);
    console.log("    ---");
  });

  return usersToFix;
}

async function fixUserRole(userId: string, userEmail: string): Promise<boolean> {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { customRole: STUDENT_ID }
    });

    console.log(`✅ Fixed role for user ${userEmail} (${userId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix role for user ${userEmail} (${userId}):`, error);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting user role fix script...");
  console.log(`📝 Student Role ID: ${STUDENT_ID}`);
  console.log(`📝 Visitor Role ID: ${VISITOR_ID}`);
  
  if (!STUDENT_ID) {
    console.error("❌ FATAL ERROR: STUDENT_ID not defined in environment variables.");
    process.exit(1);
  }

  try {
    // Find users that need fixing
    const usersToFix = await findUsersWithPurchasesAndWrongRole();
    
    if (usersToFix.length === 0) {
      console.log("🎉 No users found that need role fixing!");
      return;
    }

    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      console.log("\n⚠️  WARNING: This will modify user roles in production!");
      console.log("Please make sure you have a database backup before proceeding.");
      console.log("To proceed, set the environment variable CONFIRM_ROLE_FIX=true");
      
      if (process.env.CONFIRM_ROLE_FIX !== 'true') {
        console.log("❌ Script cancelled. Set CONFIRM_ROLE_FIX=true to proceed.");
        return;
      }
    }

    console.log(`\n🔧 Starting to fix ${usersToFix.length} users...`);
    
    let successCount = 0;
    let failureCount = 0;

    // Fix each user's role
    for (const user of usersToFix) {
      const success = await fixUserRole(user.id, user.email);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log("\n📊 SUMMARY:");
    console.log(`✅ Successfully fixed: ${successCount} users`);
    console.log(`❌ Failed to fix: ${failureCount} users`);
    
    if (successCount > 0) {
      console.log("\n✨ User roles have been updated successfully!");
      console.log("Users with purchases now have the correct student role.");
    }

  } catch (error) {
    console.error("❌ Script failed with error:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
    console.log("🔌 Database connection closed.");
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}

export { main as fixUserRolesWithPurchases };