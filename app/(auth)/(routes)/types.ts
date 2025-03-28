export interface ClerkErrorMeta {
    paramName: string;
  }
  
export interface ClerkErrorDetail {
    code: string;
    message: string;
    longMessage: string;
    meta: ClerkErrorMeta;
  }
  
 export interface ClerkErrorResponse {
    status: number;
    clerkError: boolean;
    errors: ClerkErrorDetail[];
  }