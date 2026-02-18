import IOtp from "../../interfaces/IOtp";

interface IOtpRepository {
  findOtpByEmail(email: string): Promise<IOtp[] | null>;
  findLatestByEmail(email: string): Promise<IOtp | null>;
  create(data: any): Promise<IOtp>; // Expose create from BaseRepository if needed by AuthService via interface
  deleteOtp(email: string): Promise<void>;
}
export default IOtpRepository;
