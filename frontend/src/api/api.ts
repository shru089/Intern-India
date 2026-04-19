import { apiClient } from "../services/api";
import type { User, Internship, Application, SuccessResponse } from "../types";

/**
 * Centralised API layer — all calls to the Python backend go through here.
 * Falls back to sensible sample data when the backend is unavailable so the
 * UI can be demoed without a running server.
 */
export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────

  getUserProfile: async (email: string): Promise<User> => {
    try {
      const { data } = await apiClient.get<User>("/auth/me");
      return data;
    } catch {
      // Fallback sample for offline development / demo
      return {
        fullName: "Intern User",
        email,
        phoneNumber: "+91 9876543210",
        bio: "Passionate AI/ML enthusiast looking for government internship opportunities.",
        skills: "Python, TensorFlow, React, FastAPI",
        linkedin: "https://linkedin.com/in/intern-user",
        portfolio: "https://intern-user.dev",
        profileCompletion: 85,
        profileImage: null,
      };
    }
  },

  updateUserProfile: async (email: string, details: Partial<User>): Promise<SuccessResponse> => {
    try {
      await apiClient.put("/students/profile", details);
      return { success: true };
    } catch (error) {
      console.error("API Error - updateUserProfile:", error);
      throw error;
    }
  },

  // ── Internships ───────────────────────────────────────────────────────────

  findInternships: async (preferences?: any): Promise<Internship[]> => {
    try {
      const { data } = await apiClient.get<{ items: Record<string, unknown>[] }>(
        "/students/recommendations",
        { params: { page: 1, page_size: 20, ...preferences } }
      );

      return data.items.map((item) => ({
        id: item.internship_id as number,
        title: item.title as string,
        company: (item.organization as string) ?? "Unknown",
        location: (item.location as string) ?? "Not Specified",
        score: ((item.match_score as number) ?? 0) / 100,
        source: (item.source as string) ?? "internal",
        sourceUrl: (item.source_url as string) ?? "",
      }));
    } catch {
      // Sample results for offline / demo mode
      return [
        { id: 1, title: "AI Research Intern", company: "NITI Aayog", location: "New Delhi", score: 0.95, source: "internal" },
        { id: 2, title: "Data Analyst", company: "Digital India", location: "Remote", score: 0.88, source: "internal" },
        { id: 3, title: "Full-Stack Developer Intern", company: "MeitY", location: "Bengaluru", score: 0.81, source: "internal" },
      ];
    }
  },

  getAppliedInternships: async (_email: string): Promise<Application[]> => {
    try {
      const { data } = await apiClient.get<{ items: Record<string, unknown>[] }>("/students/applications");
      return data.items.map((app) => ({
        id: app.internship_id as number,
        title: ((app.internship as Record<string, unknown>)?.title as string) ?? "Unknown",
        company: ((app.internship as Record<string, unknown>)?.company_name as string) ?? "Unknown",
        status: app.status as Application["status"],
        appliedDate: app.applied_at as string,
      }));
    } catch {
      return [];
    }
  },

  applyForInternship: async (internshipId: number): Promise<SuccessResponse> => {
    try {
      await apiClient.post(`/students/apply/${internshipId}`);
      return { success: true };
    } catch (error) {
      console.error("API Error - applyForInternship:", error);
      throw error;
    }
  },

  // ── AI Engine ──────────────────────────────────────────────────────────────
  getCareerInsights: async (userId: number): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/ai-engine/insights?user_id=${userId}`);
      return data;
    } catch (error) {
      console.error("API Error - getCareerInsights:", error);
      return {
        summary: "Keep building your profile to unlock personalized AI career insights.",
        recommendations: ["Complete your skills section", "Upload a fresh resume"],
      };
    }
  },

  sendMessageToChatbot: async (message: string): Promise<string> => {
    try {
      const { data } = await apiClient.post("/ai-engine/chatbot/query", { message });
      return data.answer;
    } catch (error) {
      console.error("API Error - sendMessageToChatbot:", error);
      return "I'm having trouble connecting to the AI brain right now. Please try again later.";
    }
  },
};
