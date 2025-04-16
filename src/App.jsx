import { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import axios from "axios";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_KEY =
    import.meta.env.VITE_OPENWEATHER_API_KEY ||
    "bd3b85402c2ec35dd3fc90a46c70966c";
  const API_URL = "https://api.openweathermap.org/data/2.5/weather";
  const GEOCODING_API_URL = "http://api.openweathermap.org/geo/1.0/direct";

  useEffect(() => {
    const getCitySuggestions = async () => {
      if (city.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        console.log("Şehir önerileri için istek gönderiliyor...");
        const response = await axios.get(GEOCODING_API_URL, {
          params: {
            q: city,
            limit: 5,
            appid: API_KEY,
          },
        });
        console.log("Öneriler alındı:", response.data);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Şehir önerileri alınamadı:", error);
        setError("Şehir önerileri alınamadı. Lütfen tekrar deneyin.");
      }
    };

    const timer = setTimeout(() => {
      getCitySuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [city]);

  const getWeather = async (selectedCity = city) => {
    if (!selectedCity) {
      setError("Lütfen bir şehir adı girin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Hava durumu için istek gönderiliyor...");
      const response = await axios.get(API_URL, {
        params: {
          q: selectedCity,
          appid: API_KEY,
          units: "metric",
          lang: "tr",
        },
      });
      console.log("Hava durumu verisi alındı:", response.data);
      setWeather(response.data);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Hava durumu alınamadı:", error);
      setError("Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    getWeather(suggestion.name);
  };

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case "Clear":
        return <WiDaySunny className="weather-icon" />;
      case "Rain":
        return <WiRain className="weather-icon" />;
      case "Clouds":
        return <WiCloudy className="weather-icon" />;
      case "Snow":
        return <WiSnow className="weather-icon" />;
      case "Thunderstorm":
        return <WiThunderstorm className="weather-icon" />;
      default:
        return <WiDaySunny className="weather-icon" />;
    }
  };

  return (
    <div className="container">
      <div className="app">
        <h1>Hava Durumu Uygulaması</h1>

        <div className="search-container">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Şehir Adı"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={(e) => e.key === "Enter" && getWeather()}
              className="search-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item">
                    {suggestion.name}, {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => getWeather()}
            className="search-button"
            disabled={loading}>
            {loading ? "Yükleniyor..." : "Ara"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {weather && (
          <div className="weather-card">
            <div className="weather-info">
              <div className="weather-main">
                {getWeatherIcon(weather.weather[0].main)}
                <h2>{weather.main.temp.toFixed(1)}°C</h2>
                <p className="weather-description">
                  {weather.weather[0].description}
                </p>
              </div>
              <div className="weather-details">
                <p>
                  <span>Hissedilen:</span> {weather.main.feels_like.toFixed(1)}
                  °C
                </p>
                <p>
                  <span>Nem:</span> {weather.main.humidity}%
                </p>
                <p>
                  <span>Rüzgar:</span> {weather.wind.speed} m/s
                </p>
                <p>
                  <span>Basınç:</span> {weather.main.pressure} hPa
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
