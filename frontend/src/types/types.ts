export type UserRole = "receptionist" | "housekeeper" | "admin";

export interface SignUpSchemaType {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface AuthProviderProps {
  provider: "google" | "email";
  userData?: SignUpSchemaType;
}
