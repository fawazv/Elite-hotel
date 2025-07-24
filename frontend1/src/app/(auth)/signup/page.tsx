"use client";

import { useState } from "react";
import { Button } from "./_components/ui/Button";
import { Input } from "./_components/ui/Input";
import { Label } from "./_components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./_components/ui/Tabs";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { BsTelephone, BsPerson } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserRole, SignUpSchemaType } from "@/types/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { signUpSchema } from "@/validators/authValidator";
import { signUp } from "@/lib/authAction";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { setSignupData } from "@/redux/slices/signupSlice";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
  const { setPassword } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [role, setRole] = useState<UserRole>("receptionist");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: joiResolver(signUpSchema),
  });

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const onSubmit: SubmitHandler<SignUpSchemaType> = async (data) => {
    setIsLoading(true);
    try {
      const { fullName, email, password, phoneNumber } = data;
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("phoneNumber", phoneNumber);
      formData.append("type", "signup");

      const response = await signUp(formData);
      dispatch(
        setSignupData({
          fullName,
          email,
          phoneNumber,
          role: role,
          type: "signup",
        })
      );

      setPassword(password);
      router.push("/otp-signup");
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Left Section - Image with overlay text */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8b4513]/80 to-[#6d3510]/70 z-10 flex flex-col justify-center items-start p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Join Our Hotel Management Platform
            </h1>
            <p className="text-white/90 mb-6 text-lg">
              Streamline your workflow and enhance guest experiences with our
              intuitive management system.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">Easy onboarding</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">24/7 support</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">Real-time updates</span>
              </div>
            </div>
          </motion.div>
        </div>
        <Image
          src="/signup.jpg"
          alt="Luxury Hotel"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          quality={100}
          priority
        />
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Create account
          </h2>
          <p className="text-gray-500 mb-6">
            Join as a team member to get started
          </p>

          <Tabs
            defaultValue="receptionist"
            className="mb-6"
            onValueChange={(value: string) =>
              handleRoleChange(value as UserRole)
            }
          >
            <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="receptionist" className="rounded-md">
                Receptionist
              </TabsTrigger>
              <TabsTrigger value="housekeeper" className="rounded-md">
                Housekeeper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receptionist">
              <p className="text-sm text-gray-500 mb-4">
                Sign up as a receptionist to manage front desk operations,
                check-ins, and customer service.
              </p>
            </TabsContent>

            <TabsContent value="housekeeper">
              <p className="text-sm text-gray-500 mb-4">
                Sign up as a housekeeper to manage room cleaning schedules,
                inventory, and maintenance requests.
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mb-6">
            <Button
              variant="outline"
              className="flex items-center justify-center w-full py-6 border rounded-xl hover:bg-gray-50 transition-all"
              // onClick={() => handleProviderAuth({ provider: "google" })}
              disabled={isLoading}
            >
              <FcGoogle className="mr-2 text-xl" /> Continue with Google
            </Button>
          </div>

          <div className="relative text-center my-6">
            <div className="absolute left-0 top-1/2 h-px w-full bg-gray-200"></div>
            <span className="relative bg-white px-4 text-gray-500 text-sm">
              OR CONTINUE WITH EMAIL
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <BsPerson />
                </div>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register("fullName")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <HiOutlineMail />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register("email")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <RiLockPasswordLine />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-gray-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <BsTelephone />
                </div>
                <Input
                  id="phone"
                  type="text"
                  placeholder="Enter your phone number"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register("phoneNumber")}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-[#8b4513] to-[#6d3510] hover:opacity-90 text-white rounded-xl transition-all text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-[#8b4513] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
