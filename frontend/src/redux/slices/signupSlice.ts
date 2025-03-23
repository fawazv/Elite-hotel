import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SignupState {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  type: "signup" | "forgetPassword"; // Assuming 'type' can be either 'signup' or 'forgetPassword'
}

const initialState: SignupState = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "",
  type: "signup",
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    setSignupData: (state, action: PayloadAction<Partial<SignupState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setSignupData } = signupSlice.actions;
export default signupSlice.reducer;
