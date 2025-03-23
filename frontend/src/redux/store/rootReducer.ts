//redux//storer/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import signupReducer from "../slices/signupSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  signup: signupReducer,
});

export default rootReducer;
