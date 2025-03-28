// utils/authService.ts

import { SignUpDataType } from "@/utils/types";

const API_URL = '/app/api/auth';

export const sendSignUpData = async (signUpData: SignUpDataType) => {
  try {
    const response = await fetch(`${API_URL}/sign-up/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signUpData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending sign-up data:', error);
    throw error;
  }
};
