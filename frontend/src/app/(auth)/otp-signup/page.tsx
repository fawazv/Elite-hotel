"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "./_components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner"; // Assuming usage of sonner for toasts
import { otpVerify } from "@/services/authApi";
import { RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

// Constants
const OTP_LENGTH = 6;
const INITIAL_COUNTDOWN = 60;

export default function OTPVerificationPage() {
  const router = useRouter();
  // State management
  const dispatch = useDispatch();
  const { fullName, email, password, phoneNumber, role, type } = useSelector(
    (state: RootState) => state.signup
  );
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeRemaining, setTimeRemaining] = useState<number>(INITIAL_COUNTDOWN);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const isOtpComplete = useMemo(
    () => !otp.some((digit) => digit === ""),
    [otp]
  );
  const canResend = timeRemaining <= 0 && !isResending;

  // Format time remaining as MM:SS
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [timeRemaining]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle input change
  const handleChange = useCallback((index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value.substring(0, 1);
      return newOtp;
    });

    setError("");

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  // Handle backspace key
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (!otp[index] && index > 0) {
          // Move to previous input when current is empty
          inputRefs.current[index - 1]?.focus();
        } else if (otp[index]) {
          // Clear current input
          const newOtp = [...otp];
          newOtp[index] = "";
          setOtp(newOtp);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text/plain").trim();

      if (!/^\d+$/.test(pastedData)) return;

      const digits = pastedData.split("").slice(0, OTP_LENGTH);
      const newOtp = Array(OTP_LENGTH).fill("");

      digits.forEach((digit, index) => {
        if (index < OTP_LENGTH) newOtp[index] = digit;
      });

      setOtp(newOtp);
      setError("");

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      }
    },
    []
  );

  // Handle OTP verification
  const handleVerify = useCallback(async () => {
    if (!isOtpComplete) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const otpCode = otp.join("");
      console.log("OTP verified:", otpCode);

      const response = await otpVerify(
        fullName,
        email,
        password,
        role,
        phoneNumber,
        otpCode,
        type
      );

      console.log(response.data);

      if (response.data.success === true) {
        if (type === "signup") {
          const reduxData = { fullName, email, role, phoneNumber };

          localStorage.setItem("accessToken", response.data.accessToken);
          const id = response.data.user._id;
          dispatch(
            login({
              token: response.data.accessToken,
              user: { ...reduxData, id },
            })
          );
          // Success notification
          toast.success("Verification successful! Redirecting...");

          // Redirect to Home
          router.push("/");

          // Refresh dashboard to get updated user data
          router.refresh();
        } else if (type === "forgetPassword") {
          toast.success("Verification successful! Redirecting...");
          router.push("/new-password");
        } else {
          setError(response.data.message);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Invalid verification code. Please try again.");
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [otp, isOtpComplete]);

  // Handle resend OTP
  const handleResend = useCallback(async () => {
    if (timeRemaining > 0) return;

    setIsResending(true);
    setError("");

    try {
      // Mock resend - would connect to your API in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTimeRemaining(INITIAL_COUNTDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();

      toast.success("New verification code sent to your email");
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
      toast.error("Failed to resend. Please try again later.");
    } finally {
      setIsResending(false);
    }
  }, [timeRemaining]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Left Section - Image with overlay text */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#8b4513]/80 to-[#6d3510]/70 z-10 flex flex-col justify-center items-start p-12"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Verify Your Account
            </h1>
            <p className="text-white/90 mb-6 text-lg">
              We've sent a verification code to your email. Please enter it to
              complete your registration.
            </p>
            <motion.div
              className="flex flex-wrap gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {["Secure verification", "Quick & easy", "Enhanced security"].map(
                (text, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4"
                  >
                    <span className="text-white">{text}</span>
                  </motion.div>
                )
              )}
            </motion.div>
          </motion.div>
        </div>
        <Image
          src="/signup.jpg"
          alt="Luxury Hotel"
          fill
          sizes="(max-width: 768px) 0vw, 50vw"
          className="object-cover h-full w-full"
          quality={90}
          priority
        />
      </div>

      {/* Right Section - OTP Verification */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Verify Your Account
          </h2>
          <p className="text-gray-500 mb-6">
            We've sent a 6-digit code to your email
          </p>

          <div className="mb-8">
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-6"
              role="group"
              aria-labelledby="otp-label"
            >
              <span id="otp-label" className="sr-only">
                Enter your 6-digit verification code
              </span>

              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <div key={index} className="w-12 h-16 relative">
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    aria-label={`Digit ${index + 1}`}
                    className="w-full h-full text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8b4513] focus:ring-2 focus:ring-[#8b4513]/20 focus:outline-none transition-all peer"
                  />
                  <AnimatePresence>
                    {otp[index] && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-sm text-center mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="text-center text-gray-500 text-sm mb-6">
              Time remaining: {formatTimeRemaining()}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || !isOtpComplete}
              className="w-full py-6 bg-gradient-to-r from-[#8b4513] to-[#6d3510] hover:opacity-90 text-white rounded-xl transition-all text-base font-medium relative overflow-hidden group"
            >
              <span
                className={`transition-all duration-300 ${
                  isVerifying ? "opacity-0" : "opacity-100"
                }`}
              >
                Verify Code
              </span>

              {isVerifying && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}

              <span className="absolute inset-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Button>

            <div className="text-center mt-6">
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-medium transition-colors ${
                  canResend
                    ? "text-[#8b4513]"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                aria-live="polite"
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resending...
                  </span>
                ) : timeRemaining > 0 ? (
                  `Resend code in ${formatTimeRemaining()}`
                ) : (
                  <span className="text-gray-500">
                    Didn't receive a code?{" "}
                    {canResend ? (
                      <span className="text-primary font-medium hover:underline bg-transparent border-none p-0 inline cursor-pointer">
                        Resend
                      </span>
                    ) : (
                      <span className="text-gray-400 cursor-not-allowed">
                        Resend
                      </span>
                    )}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              Need help?{" "}
              <Link
                href="/support"
                className="text-[#8b4513] font-medium hover:underline transition-colors"
              >
                Contact support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
