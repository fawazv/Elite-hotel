import mongoose, { Schema } from "mongoose";
import IUser from "../interfaces/IUser";

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /^[0-9]{10,15}$/.test(v); // Allows only numbers with 10 to 15 digits
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isApproved: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: null },
});

export const User = mongoose.model("User", userSchema);
