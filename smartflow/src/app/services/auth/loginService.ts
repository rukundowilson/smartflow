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
    roles?: string[]; // Add roles to the user object
    roleNames?: string[]; // Add roleNames to the user object
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

    // Extract role names from the roles array if available
    if (response.data.user.roles && Array.isArray(response.data.user.roles)) {
      const roleNames = response.data.user.roles.map((role: any) => role.role_name);
      response.data.user.roleNames = roleNames;
    } else {
      response.data.user.roleNames = [];
    }

    return response.data;
  } catch (error: any) {
    // Extract the actual server error message
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    const status = error.response?.status;
    
    if (serverMessage) {
      throw new Error(serverMessage);
    } else if (status === 404) {
      throw new Error("User not found. Please check your email address.");
    } else if (status === 401) {
      throw new Error("Invalid password. Please try again.");
    } else if (status === 400) {
      throw new Error("Invalid credentials. Please check your email and password.");
    } else if (status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error("Login failed. Please check your connection and try again.");
    }
  }
}
