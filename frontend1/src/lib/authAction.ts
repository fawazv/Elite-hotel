"use server";

import {
  signUpRequest,
  signInRequest,
  googleSignIn,
  passwordUpdate,
  resetPassword,
  sendMail,
  resendOtp,
} from "@/services/authApi";
import { api } from "@/services/instances/axiosConfig";
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
    if (response.data.success) {
      console.log("success");
    }
  } catch (error) {
    console.error("Error during sign up:", error);
  }
}

// export async function otpVerifyAction(data: {
//   fullName: string;
//   email: string;
//   password: string;
//   role: string;
//   phoneNumber: string;
//   otp: string;
//   type: string;
// }) {
//   try {
//     const response = await api.post(
//       "/otp-signup",
//       (data.fullName,
//       data.email,
//       data.password,
//       data.role,
//       data.phoneNumber,
//       data.otp,
//       data.type)
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error during otp verification:", error);
//   }
// }

export async function otpVerifyAction(
  fullName: string,
  email: string,
  password: string,
  role: string,
  phoneNumber: string,
  otp: string,
  type: string
) {
  try {
    const response = await api.post("/otp-signup", {
      fullName,
      email,
      password,
      role,
      phoneNumber,
      otp,
      type,
    });
    return response.data;
  } catch (error) {
    console.error("Error during otp verification:", error);
  }
}

export async function resendOtpAction(email: string) {
  try {
    await resendOtp(email);
  } catch (error) {
    console.error("Error during otp verification:", error);
  }
}

export async function logoutAction() {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    return error;
  }
}
