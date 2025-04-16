import { createContext, useContext, useReducer, useEffect } from "react";
import {
  getWeatherByCity,
  getForecastByCity,
} from "../services/WeatherService";

// Context oluşturma
const WeatherContext = createContext();

// localStorage'dan verileri yükleme yardımcı fonksiyonu
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Veri yüklenirken hata oluştu (${key}):`, error);
    return defaultValue;
  }
};

// Initial state
const initialState = {
  city: "",
  weather: null,
  forecast: null,
  error: "",
  suggestions: [],
  showSuggestions: false,
  loading: false,
  darkMode: loadFromLocalStorage("darkMode", false),
  favorites: loadFromLocalStorage("favorites", []),
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
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };
    case "ADD_FAVORITE":
      if (!state.favorites.some((fav) => fav.id === action.payload.id)) {
        const updatedFavorites = [...state.favorites, action.payload];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        return { ...state, favorites: updatedFavorites };
      }
      return state;
    case "REMOVE_FAVORITE":
      const filteredFavorites = state.favorites.filter(
        (city) => city.id !== action.payload
      );
      localStorage.setItem("favorites", JSON.stringify(filteredFavorites));
      return { ...state, favorites: filteredFavorites };
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

  // Tema değiştiğinde localStorage'a kaydetme
  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));

      if (state.darkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    } catch (error) {
      console.error("Dark mode kaydedilirken hata oluştu:", error);
    }
  }, [state.darkMode]);

  // Debug için - Favori değişikliklerini izleme
  useEffect(() => {
    console.log("Güncel favoriler:", state.favorites);
  }, [state.favorites]);

  // Loading state değişimini izleme (debug için)
  useEffect(() => {
    console.log("Loading state değişti:", state.loading);
  }, [state.loading]);

  // API çağrıları ve diğer fonksiyonlar
  const getCitySuggestions = async (cityQuery) => {
    if (!cityQuery || cityQuery.length < 2) {
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

    // Eğer zaten loading durumundaysa, çift istek önlemek için return
    if (state.loading) return;

    // Yükleniyor başlat
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: "" });

    try {
      console.log("Hava durumu için istek gönderiliyor...");
      const data = await getWeatherByCity(selectedCity);
      console.log("Hava durumu verisi alındı:", data);

      // Forecast verisi de alalım
      try {
        await fetchForecast(selectedCity);
      } catch (forecastError) {
        console.error("Forecast verisi alınamadı:", forecastError);
        // Forecast hatası ana işlemi engellemeyecek
      }

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
      // Yükleme bittiğinde hafif bir gecikme ekleyerek buğulama efektinin görünmesini sağla
      setTimeout(() => {
        dispatch({ type: "SET_LOADING", payload: false });
      }, 500);
    }
  };

  const fetchForecast = async (selectedCity = state.city) => {
    if (!selectedCity) {
      dispatch({ type: "SET_ERROR", payload: "Lütfen bir şehir adı girin." });
      return;
    }

    try {
      console.log("Tahmin verisi için istek gönderiliyor...");
      const data = await getForecastByCity(selectedCity);
      dispatch({ type: "SET_FORECAST", payload: data });
    } catch (error) {
      console.error("Hava durumu tahmini alınamadı:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Hava durumu tahmini alınamadı.",
      });
    }
    // fetchForecast için loading state'ini değiştirmiyoruz, çünkü
    // ana işlem fetchWeather'dan sonra yapılıyor
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

  // Favori ekleme fonksiyonu
  const addFavorite = () => {
    if (state.weather) {
      const favorite = {
        id: state.weather.id,
        name: state.weather.name,
        country: state.weather.sys.country,
      };
      dispatch({ type: "ADD_FAVORITE", payload: favorite });
    }
  };

  // Favori silme fonksiyonu
  const removeFavorite = (cityId) => {
    dispatch({ type: "REMOVE_FAVORITE", payload: cityId });
  };

  // Favorilerden şehir seçme
  const selectFavorite = (cityName) => {
    setCity(cityName);
    fetchWeather(cityName);
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
    addFavorite,
    removeFavorite,
    selectFavorite,
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
