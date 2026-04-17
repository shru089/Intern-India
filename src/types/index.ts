export interface User {
  id?: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  skills?: string;
  linkedin?: string;
  portfolio?: string;
  profileCompletion?: number;
  profileImage?: string | null;
  role?: "student" | "admin" | "org";
}

export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  score?: number;
  source?: string;
  sourceUrl?: string;
  description?: string;
  stipend?: string;
  duration?: string;
  postedAt?: string;
}

export interface Application {
  id: number;
  title: string;
  company: string;
  status: "applied" | "review" | "accepted" | "rejected";
  appliedDate: string;
  internship?: Internship;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}
