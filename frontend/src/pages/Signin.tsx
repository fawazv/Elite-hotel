import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FcGoogle } from 'react-icons/fc'
import { HiOutlineMail } from 'react-icons/hi'
import { RiLockPasswordLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { UserRole } from '@/types/index'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type signInSchemaType } from '@/validators/authValidator'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux/store/store'
import { login } from '@/redux/slices/authSlice'
import { signInRequest } from '@/services/authApi'
import type { ServerErrorResponse } from '@/utils/serverErrorResponse'
import { toast } from 'sonner'

export default function Signin() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const [role, setRole] = useState<UserRole>('receptionist')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole)
  }

  const clearError = () => {
    if (error) setError('')
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInSchemaType>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit: SubmitHandler<signInSchemaType> = async (data) => {
    setError('') // Clear any previous errors
    setIsLoading(true)
    try {
      const { email, password } = data
      const response = await signInRequest(email, password, role)

      if (response.success) {
        const { user, accessToken } = response.data
        const { fullName, phoneNumber, role } = user
        const reduxData = { fullName, email, role, phoneNumber }
        localStorage.setItem('accessToken', accessToken)
        const id = user._id

        // Assuming the response contains user data
        dispatch(
          login({
            token: accessToken,
            user: { ...reduxData, id },
          })
        )
        toast.success(response.message || 'Signed in successfully')
        navigate('/')
      } else {
        setError(response.message || 'Failed to sign in')
      }
    } catch (error) {
      console.error('Error during sign in:', error)

      // Assert the type of the error object
      const serverError = error as ServerErrorResponse

      if (
        serverError &&
        serverError.response &&
        serverError.response.data &&
        serverError.response.data.message
      ) {
        setError(serverError.response.data.message)
      } else {
        // Fallback for other error types
        setError('An unknown error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

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
              Welcome Back to Hotel Management
            </h1>
            <p className="text-white/90 mb-6 text-lg">
              Sign in to access your dashboard and continue managing hotel
              operations seamlessly.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">Secure access</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">Real-time data</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 px-4">
                <span className="text-white">Mobile ready</span>
              </div>
            </div>
          </motion.div>
        </div>
        <img
          src="/images/signin.jpeg"
          alt="Luxury Hotel"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
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
            Welcome back
          </h2>
          <p className="text-gray-500 mb-6">
            Sign in to your account to continue
          </p>

          <Tabs
            defaultValue="receptionist"
            className="mb-6"
            onValueChange={(value: string) =>
              handleRoleChange(value as UserRole)
            }
          >
            <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="receptionist" className="rounded-md">
                Receptionist
              </TabsTrigger>
              <TabsTrigger value="housekeeper" className="rounded-md">
                Housekeeper
              </TabsTrigger>
              <TabsTrigger value="admin" className="rounded-md">
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receptionist">
              <p className="text-sm text-gray-500 mb-4">
                Access your receptionist dashboard to manage front desk
                operations and guest services.
              </p>
            </TabsContent>

            <TabsContent value="housekeeper">
              <p className="text-sm text-gray-500 mb-4">
                Access your housekeeper dashboard to manage room assignments and
                maintenance tasks.
              </p>
            </TabsContent>

            <TabsContent value="admin">
              <p className="text-sm text-gray-500 mb-4">
                Access your admin dashboard to manage hotel operations, staff,
                and system configurations.
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

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register('email', { onChange: clearError })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
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
                  placeholder="Enter your password"
                  className="pl-10 py-6 rounded-xl bg-gray-50 border-gray-200 focus:border-[#8b4513] focus:ring-[#8b4513]/10"
                  required
                  {...register('password', { onChange: clearError })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#8b4513] focus:ring-[#8b4513] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="text-[#8b4513] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-[#8b4513] to-[#6d3510] hover:opacity-90 text-white rounded-xl transition-all text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/auth/signup"
              className="text-[#8b4513] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
