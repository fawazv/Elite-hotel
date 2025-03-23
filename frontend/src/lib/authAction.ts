"use server";

import {
  signUpRequest,
  signInRequest,
  otpVerify,
  googleSignIn,
  passwordUpdate,
  logout,
  resetPassword,
  sendMail,
  resendOtp,
} from "@/services/authApi";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    const { email, password, role } = data;

    await signInRequest(email, password, role);
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Error during sign in:", error);
  }
}

export async function signUp(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    console.log(email);

    const response = await signUpRequest(email);
    if (response.success) {
      // redirect("/otp-signup");
      console.log("success");
    }
    console.log(email);
  } catch (error) {
    console.error("Error during sign up:", error);
  }
}
