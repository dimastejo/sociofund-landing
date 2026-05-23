import axios from "axios";

export const API_BASE_URL = "https://sdvapp.cloud/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default apiClient;
