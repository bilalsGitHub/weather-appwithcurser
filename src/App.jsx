import { useEffect, useCallback, useState } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import {
  FaMoon,
  FaSun,
  FaStar,
  FaRegStar,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import "./App.css";
import { useWeather } from "./context/WeatherContext";

function App() {
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const {
    city,
    weather,
    forecast,
    error,
    suggestions,
    showSuggestions,
    loading,
    darkMode,
    favorites,
    setCity,
    setShowSuggestions,
    getCitySuggestions,
    fetchWeather,
    fetchForecast,
    toggleDarkMode,
    addFavorite,
    removeFavorite,
    selectFavorite,
  } = useWeather();

  const fetchSuggestions = useCallback(
    (query) => {
      if (query.length >= 2) {
        getCitySuggestions(query);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [getCitySuggestions, setShowSuggestions]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (city) {
        fetchSuggestions(city);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [city, fetchSuggestions]);

  useEffect(() => {
    if (weather && weather.name) {
      try {
        fetchForecast(weather.name);
      } catch (error) {
        console.error("Forecast verisi çekilirken hata oluştu:", error);
      }
    }
  }, [weather, fetchForecast]);

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    fetchWeather(suggestion.name);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);

    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setShowSuggestions(false);
    }
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

  const isFavorite = () => {
    return weather && favorites.some((fav) => fav.id === weather.id);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("tr-TR", {
      weekday: "short",
      day: "numeric",
    });
  };

  const getDailyForecast = () => {
    if (!forecast) return [];

    const daily = {};

    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();

      if (!daily[date]) {
        daily[date] = {
          date: item.dt,
          temp: {
            min: item.main.temp,
            max: item.main.temp,
          },
          weather: item.weather[0],
        };
      } else {
        if (item.main.temp < daily[date].temp.min) {
          daily[date].temp.min = item.main.temp;
        }
        if (item.main.temp > daily[date].temp.max) {
          daily[date].temp.max = item.main.temp;
        }
      }
    });

    return Object.values(daily).slice(0, 5);
  };

  const toggleFavorites = () => {
    setFavoritesOpen(!favoritesOpen);
  };

  return (
    <div className="container">
      <div className="app">
        <button onClick={toggleDarkMode} className="theme-switch">
          {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
        </button>

        <h1>Hava Durumu Uygulaması</h1>

        {favorites.length > 0 && (
          <div className="favorites-container">
            <div className="favorites-header" onClick={toggleFavorites}>
              <h3 className="favorites-title">
                Favori Şehirler ({favorites.length})
              </h3>
              <button
                className={`favorites-toggle ${favoritesOpen ? "open" : ""}`}>
                <FaChevronDown />
              </button>
            </div>
            <div className={`favorites-body ${favoritesOpen ? "" : "closed"}`}>
              <ul className="favorites-list">
                {favorites.map((fav) => (
                  <li key={fav.id} className="favorite-item">
                    <span
                      className="favorite-name"
                      onClick={() => selectFavorite(fav.name)}>
                      {fav.name}, {fav.country}
                    </span>
                    <button
                      className="favorite-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(fav.id);
                      }}
                      title="Favorilerden çıkar">
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="search-container">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Şehir Adı"
              value={city}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
              onFocus={() => city.length >= 2 && setShowSuggestions(true)}
              className="search-input"
            />
            {showSuggestions && suggestions && suggestions.length > 0 && (
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
            disabled={loading === true}>
            {loading === true ? "Yükleniyor..." : "Ara"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {weather ? (
          <div className={`weather-card ${loading ? "loading" : ""}`}>
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            )}

            <div className="weather-city-header">
              <h2 className="weather-city-name">
                {weather.name}, {weather.sys.country}
              </h2>
              <button
                onClick={() =>
                  isFavorite() ? removeFavorite(weather.id) : addFavorite()
                }
                className={`favorite-button ${
                  isFavorite() ? "active" : "inactive"
                }`}
                title={isFavorite() ? "Favorilerden çıkar" : "Favorilere ekle"}>
                {isFavorite() ? <FaStar /> : <FaRegStar />}
              </button>
            </div>

            <div className={`weather-info ${loading ? "loading-blur" : ""}`}>
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

            {forecast && (
              <div
                className={`forecast-container ${
                  loading ? "loading-blur" : ""
                }`}>
                <h3 className="forecast-title">5 Günlük Tahmin</h3>
                <div className="forecast-list">
                  {getDailyForecast().map((day, index) => (
                    <div key={index} className="forecast-item">
                      <div className="forecast-date">
                        {formatDate(day.date)}
                      </div>
                      <div className="forecast-icon">
                        {getWeatherIcon(day.weather.main)}
                      </div>
                      <div className="forecast-temp">
                        <span className="max">{day.temp.max.toFixed(0)}°</span>
                        <span className="min">{day.temp.min.toFixed(0)}°</span>
                      </div>
                      <div className="forecast-desc">
                        {day.weather.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-message">
            <p>Hava durumu bilgisi görmek için bir şehir arayın</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
