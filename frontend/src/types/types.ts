export type UserRole =
  | "receptionist"
  | "housekeeper"
  | "manager"
  | "maintenance";

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface AuthProviderProps {
  provider: "google" | "email";
  userData?: UserFormData;
}
