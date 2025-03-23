import { api, privateApi } from "@/services/instances/axiosConfig";

export const signInRequest = async (
  email: string,
  password: string,
  role: string
) => {
  const response = await api.post("/signin", { email, password, role });
  return response;
};

export const signUpRequest = async (email: string) => {
  const response = await api.post("/signup", { email });
  return response.data;
};

export const otpVerify = async (
  fullName: string,
  email: string,
  password: string,
  role: string,
  phoneNumber: string,
  otp: string,
  type: string
) => {
  const response = await api.post("/otp-signup", {
    fullName,
    email,
    password,
    role,
    phoneNumber,
    otp,
    type,
  });
  return response;
};

export const resendOtp = async (email: string) => {
  const response = await api.post("/otp-resend", { email });
  return response;
};

export const googleSignIn = async (
  email: string,
  name: string,
  role: string
) => {
  try {
    const response = await api.post("/google-signin", { email, name, role });
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendMail = async (email: string) => {
  try {
    const response = await api.post("/forget-password", { email });
    return response;
  } catch (error) {
    return error;
  }
};

export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post("/reset-password", {
      email,
      password,
      confirmPassword,
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/logout");
    return response;
  } catch (error) {
    return error;
  }
};

export const passwordUpdate = async (data: object) => {
  try {
    const response = await privateApi.patch("/user/change-password", data);
    return response;
  } catch (error) {
    return error;
  }
};
