export interface SignUpDataType {
  emailAddress: string;
  password: string | undefined;
  name: string;
  universityOrInstitution: string;
  degreeOrField: string;
  degreeOrFieldSpecific?: string;
  country: string;
  age: string | number;
  gender: string;
  specialization: string;
  role?: "student" | "admin" | "teacher" | "developer" | "visitor";
  available?: boolean;
  avatar?: string;
  id?: string | undefined;
  phoneNumber?: string;
  learningObjectives?: string[];
  communicationPreferences?: string[];
  acceptTerms: boolean;
}