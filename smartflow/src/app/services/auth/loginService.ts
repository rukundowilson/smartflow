// src/services/auth.ts
import API from "@/app/utils/axios";

interface LoginResponse {
  status: number;
  message: string;
  token: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    department: string;
    status: string;
  };
}
interface LoginFormData {
  personalEmail: string;
  employeeId: string;
  password: string;
}

export async function login(formData : LoginFormData): Promise<LoginResponse> {
  const email = formData.personalEmail;
  const password = formData.password;
  try {
    const response = await API.post<LoginResponse>("/api/auth/signin", {
      email,
      password,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Login failed";
    throw new Error(message);
  }
}
