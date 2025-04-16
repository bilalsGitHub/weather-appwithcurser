import { createContext, useContext, useReducer, useEffect } from "react";
import {
  getWeatherByCity,
  getForecastByCity,
} from "../services/WeatherService";

// Context oluşturma
const WeatherContext = createContext();

// Initial state
const initialState = {
  city: "",
  weather: null,
  forecast: null,
  error: "",
  suggestions: [],
  showSuggestions: false,
  loading: false,
  darkMode: false,
};

// Reducer fonksiyonu
function weatherReducer(state, action) {
  switch (action.type) {
    case "SET_CITY":
      return { ...state, city: action.payload };
    case "SET_WEATHER":
      return { ...state, weather: action.payload };
    case "SET_FORECAST":
      return { ...state, forecast: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload };
    case "SET_SHOW_SUGGESTIONS":
      return { ...state, showSuggestions: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };
    default:
      return state;
  }
}

// Provider component
export function WeatherProvider({ children }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const API_KEY =
    import.meta.env.VITE_OPENWEATHER_API_KEY ||
    "bd3b85402c2ec35dd3fc90a46c70966c";
  const GEOCODING_API_URL = "http://api.openweathermap.org/geo/1.0/direct";

  // LocalStorage'dan tema tercihini yükleme
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      dispatch({ type: "SET_DARK_MODE", payload: JSON.parse(savedTheme) });
    }
  }, []);

  // Tema değiştiğinde localStorage'a kaydetme
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(state.darkMode));

    // HTML body'sine dark/light class ekleme
    if (state.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [state.darkMode]);

  // API çağrıları ve diğer fonksiyonlar
  const getCitySuggestions = async (cityQuery) => {
    if (cityQuery.length < 2) {
      dispatch({ type: "SET_SUGGESTIONS", payload: [] });
      return;
    }

    try {
      console.log("Şehir önerileri için istek gönderiliyor...");
      const response = await fetch(
        `${GEOCODING_API_URL}?q=${cityQuery}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      console.log("Öneriler alındı:", data);
      dispatch({ type: "SET_SUGGESTIONS", payload: data });
    } catch (error) {
      console.error("Şehir önerileri alınamadı:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Şehir önerileri alınamadı. Lütfen tekrar deneyin.",
      });
    }
  };

  const fetchWeather = async (selectedCity = state.city) => {
    if (!selectedCity) {
      dispatch({ type: "SET_ERROR", payload: "Lütfen bir şehir adı girin." });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: "" });

    try {
      console.log("Hava durumu için istek gönderiliyor...");
      const data = await getWeatherByCity(selectedCity);
      console.log("Hava durumu verisi alındı:", data);
      dispatch({ type: "SET_WEATHER", payload: data });
      dispatch({ type: "SET_SHOW_SUGGESTIONS", payload: false });
    } catch (error) {
      console.error("Hava durumu alınamadı:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.",
      });
      dispatch({ type: "SET_WEATHER", payload: null });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchForecast = async (selectedCity = state.city) => {
    if (!selectedCity) {
      dispatch({ type: "SET_ERROR", payload: "Lütfen bir şehir adı girin." });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const data = await getForecastByCity(selectedCity);
      dispatch({ type: "SET_FORECAST", payload: data });
    } catch (error) {
      console.error("Hava durumu tahmini alınamadı:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Hava durumu tahmini alınamadı.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setCity = (city) => {
    dispatch({ type: "SET_CITY", payload: city });
  };

  const setShowSuggestions = (show) => {
    dispatch({ type: "SET_SHOW_SUGGESTIONS", payload: show });
  };

  // Tema değiştirme fonksiyonu
  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" });
  };

  // Context değeri
  const value = {
    ...state,
    setCity,
    setShowSuggestions,
    getCitySuggestions,
    fetchWeather,
    fetchForecast,
    toggleDarkMode,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

// Custom hook
export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
