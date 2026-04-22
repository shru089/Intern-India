import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export async function fetchRecommendations(userId = 1) {
  const { data } = await apiClient.get("/students/recommendations", {
    params: { user_id: userId },
  });
  return data;
}

export async function chatbotQuery(message) {
  const { data } = await apiClient.post("/ai/chatbot/query", { message });
  return data;
}
