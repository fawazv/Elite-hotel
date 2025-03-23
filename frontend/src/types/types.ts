export type UserRole = "receptionist" | "housekeeper" | "admin";

export interface SignUpSchemaType {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface AuthProviderProps {
  provider: "google" | "email";
  userData?: SignUpSchemaType;
}
