import { useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import { FaMoon, FaSun } from "react-icons/fa";
import "./App.css";
import { useWeather } from "./context/WeatherContext";

function App() {
  const {
    city,
    weather,
    error,
    suggestions,
    showSuggestions,
    loading,
    darkMode,
    setCity,
    setShowSuggestions,
    getCitySuggestions,
    fetchWeather,
    toggleDarkMode,
  } = useWeather();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (city) {
        getCitySuggestions(city);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [city, getCitySuggestions]);

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    fetchWeather(suggestion.name);
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
        <button onClick={toggleDarkMode} className="theme-switch">
          {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
        </button>

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
              onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
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
            onClick={() => fetchWeather()}
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
