import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
console.log("API Key:", API_KEY); // Debug log

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getWeatherByCity = async (city: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        lang: "tr",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Hava durumu verisi alınamadı:", error);
    throw error;
  }
};

export const getForecastByCity = async (city: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        lang: "tr",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Hava durumu tahmini alınamadı:", error);
    throw error;
  }
};
