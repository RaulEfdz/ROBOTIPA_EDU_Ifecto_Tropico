export interface User {
  id: string;
  emailAddress: string;
  fullName: string;
  phoneNumber: string;
  countryOfResidence: string;
  age?: number;
  gender: string;
  university: string;
  educationLevel: string;
  major: string;
  otherMajor: string;
  specializationArea: string;
  learningObjectives: string[];
  otherObjective: string;
  communicationPreferences: string[];
  acceptsTerms: boolean;
  role: "student" | "admin" | "teacher" | "developer" | "visitor";
  available: boolean;
  avatar: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceType: string;
  courses?: string[];
  purchases?: string[];
  userProgresses?: string[];
}

export interface TableUsersProps {
  users: User[];
}