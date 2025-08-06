// services/authApi.ts
import { api, privateApi } from '@/services/instances/axiosConfig'

export const signInRequest = async (
  email: string,
  password: string,
  role: string
) => {
  const response = await api.post('/signin', { email, password, role })
  return response
}

export const signUpRequest = async (
  fullName: string,
  email: string,
  password: string,
  role: string,
  phoneNumber: string
) => {
  const response = await api.post('/signup', {
    email,
    password,
    role,
    fullName,
    phoneNumber,
  })
  return response.data
}

export const otpVerify = async (email: string, otp: string, type: string) => {
  const response = await api.post('/otp-signup', {
    email,
    otp,
    type,
  })
  return response.data
}

export const resendOtp = async (email: string) => {
  const response = await api.post('/otp-resend', { email })
  return response
}

export const googleSignIn = async (
  email: string,
  name: string,
  role: string
) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api.post('/google-signin', { email, name, role })
    return response
  } catch (error) {
    throw error
  }
}

export const sendMail = async (email: string) => {
  try {
    const response = await api.post('/forget-password', { email })
    return response
  } catch (error) {
    return error
  }
}

export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post('/reset-password', {
      email,
      password,
      confirmPassword,
    })
    return response
  } catch (error) {
    return error
  }
}

export const passwordUpdate = async (data: object) => {
  try {
    const response = await privateApi.patch('/user/change-password', data)
    return response
  } catch (error) {
    return error
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/logout')
    return response
  } catch (error) {
    return error
  }
}
