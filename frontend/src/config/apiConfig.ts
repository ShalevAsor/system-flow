export const getApiConfig = () => {
  return {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  };
};
