import apiClient from "./client";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  workspaceName?: string;
  language?: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  requiresOtp: boolean;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  workspaceName?: string;
}

export interface VerifyOtpResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<{ data?: RegisterResponse } | RegisterResponse>(
      "/auth/register",
      data,
    );
    // NestJS response interceptor wraps in { data: ... }
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<{ data?: VerifyOtpResponse } | VerifyOtpResponse>(
      "/auth/verify-otp",
      data,
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    const response = await apiClient.post<{ data?: ResendOtpResponse } | ResendOtpResponse>(
      "/auth/resend-otp",
      data,
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ data?: LoginResponse } | LoginResponse>(
      "/auth/login",
      data,
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<{ data?: ForgotPasswordResponse } | ForgotPasswordResponse>(
      "/auth/forgot-password",
      data,
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<{ data?: ResetPasswordResponse } | ResetPasswordResponse>(
      "/auth/reset-password",
      data,
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ data?: { message: string } } | { message: string }>(
      "/auth/change-password",
      data,
    );
    return (response.data as any)?.data || response.data;
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get<{ data?: any } | any>("/users/profile");
    return (response.data as any)?.data || response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<any> {
    const response = await apiClient.patch<{ data?: any } | any>("/users/profile", data);
    return (response.data as any)?.data || response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ data?: { message: string } } | { message: string }>(
      "/auth/logout",
    );
    const resData = (response.data as any)?.data || response.data;
    return resData;
  },
};

export default authApi;
