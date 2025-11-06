import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export async function fetchRecommendations() {
  const { data } = await apiClient.get("/students/recommendations", {
    params: { user_id: 1 },
  });
  return data as { items: Array<{ internship_id: number; title: string; match_score: number }> };
}

export async function chatbotQuery(message: string) {
  const { data } = await apiClient.post("/ai/chatbot/query", { message });
  return data as { answer: string };
}


