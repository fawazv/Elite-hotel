"use server";

import { api, privateApi } from "@/services/instances/axiosConfig";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const signInRequest = async (
  email: string,
  password: string,
  role: string
) => {
  const response = await api.post("/signin", { email, password, role });
  return response.data;
};

export const signUpRequest = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const data = Object.fromEntries(formData.entries());
    console.log("data:", data);
    console.log("email:", email);

    // await api.post("/signup", { email });
    // revalidatePath("/signup");
    // redirect("/otp-signup");
  } catch (error) {
    console.error("Sign-up error:", error);
    return { error: "Error during signup" };
  }
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
  role: string,
  phoneNumber: string
) => {
  const response = await api.post("/google-signin", {
    email,
    name,
    role,
    phoneNumber,
  });
  return response.data;
};

export const sendMail = async (email: string) => {
  const response = await api.post("/forget-password", { email });
  return response.data;
};

export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  const response = await api.post("/reset-password", {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};

export const passwordUpdate = async (data: object) => {
  const response = await privateApi.patch("/user/change-password", data);
  return response.data;
};
