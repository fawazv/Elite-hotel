import { Document, ObjectId } from "mongoose";

interface IUser extends Document {
  _id: ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  role: "receptionist" | "housekeeper" | "admin";
  isApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default IUser;
