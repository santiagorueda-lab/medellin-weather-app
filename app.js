// Medellín Weather App - Apple Weather Style
// Built by VaultGhost ☢️

const MEDELLIN_LAT = 6.2442;
const MEDELLIN_LON = -75.5812;

// Weather code mappings
const weatherData = {
    0: { icon: '☀️', condition: 'Clear Sky', type: 'clear' },
    1: { icon: '🌤️', condition: 'Mainly Clear', type: 'clear' },
    2: { icon: '⛅', condition: 'Partly Cloudy', type: 'clear' },
    3: { icon: '☁️', condition: 'Overcast', type: 'cloudy' },
    45: { icon: '🌫️', condition: 'Foggy', type: 'cloudy' },
    48: { icon: '🌫️', condition: 'Rime Fog', type: 'cloudy' },
    51: { icon: '🌧️', condition: 'Light Drizzle', type: 'rain' },
    53: { icon: '🌧️', condition: 'Drizzle', type: 'rain' },
    55: { icon: '🌧️', condition: 'Dense Drizzle', type: 'rain' },
    61: { icon: '🌧️', condition: 'Light Rain', type: 'rain' },
    63: { icon: '🌧️', condition: 'Rain', type: 'rain' },
    65: { icon: '🌧️', condition: 'Heavy Rain', type: 'rain' },
    71: { icon: '🌨️', condition: 'Light Snow', type: 'cloudy' },
    73: { icon: '🌨️', condition: 'Snow', type: 'cloudy' },
    75: { icon: '🌨️', condition: 'Heavy Snow', type: 'cloudy' },
    77: { icon: '🌨️', condition: 'Snow Grains', type: 'cloudy' },
    80: { icon: '🌦️', condition: 'Light Showers', type: 'rain' },
    81: { icon: '🌦️', condition: 'Showers', type: 'rain' },
    82: { icon: '⛈️', condition: 'Heavy Showers', type: 'rain' },
    85: { icon: '🌨️', condition: 'Snow Showers', type: 'cloudy' },
    86: { icon: '🌨️', condition: 'Heavy Snow Showers', type: 'cloudy' },
    95: { icon: '⛈️', condition: 'Thunderstorm', type: 'rain' },
    96: { icon: '⛈️', condition: 'Thunderstorm', type: 'rain' },
    99: { icon: '⛈️', condition: 'Severe Storm', type: 'rain' },
};

// Check if it's night time (6 PM - 6 AM in Bogota timezone)
function isNightTime() {
    const now = new Date();
    const bogotaOffset = -5;
    const utcHours = now.getUTCHours();
    const bogotaHours = (utcHours + bogotaOffset + 24) % 24;
    return bogotaHours >= 18 || bogotaHours < 6;
}

// Set dynamic background based on weather
function setWeatherBackground(weatherCode) {
    const body = document.body;
    const data = weatherData[weatherCode] || weatherData[0];
    
    // Remove all weather classes
    body.classList.remove('weather-clear', 'weather-cloudy', 'weather-rain', 'weather-night');
    
    if (isNightTime()) {
        body.classList.add('weather-night');
    } else {
        body.classList.add(`weather-${data.type}`);
    }
    
    // Add rain particles if raining
    const particles = document.getElementById('particles');
    particles.innerHTML = '';
    
    if (data.type === 'rain') {
        createRaindrops(particles);
    }
}

// Create animated raindrops
function createRaindrops(container) {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        container.appendChild(drop);
    }
}

// Fetch weather data
async function fetchWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${MEDELLIN_LAT}&longitude=${MEDELLIN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Bogota&forecast_days=5`;
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// Fetch news
async function fetchNews() {
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.elcolombiano.com/rss/medellin.xml';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'ok' && data.items) {
            return data.items.slice(0, 4).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: formatTimeAgo(new Date(item.pubDate)),
                source: 'El Colombiano'
            }));
        }
    } catch (error) {
        console.error('News fetch error:', error);
    }
    
    return [
        { title: 'Bienvenidos a Medellín Weather', link: '#', pubDate: 'Now', source: 'VaultGhost' },
        { title: 'La ciudad de la eterna primavera', link: '#', pubDate: 'Now', source: 'VaultGhost' }
    ];
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
}

// Render weather
function renderWeather(data) {
    if (!data || !data.current) return;
    
    const current = data.current;
    const daily = data.daily;
    const weather = weatherData[current.weather_code] || weatherData[0];
    
    // Set background
    setWeatherBackground(current.weather_code);
    
    // Main card
    document.getElementById('temp').textContent = Math.round(current.temperature_2m);
    document.getElementById('condition').textContent = weather.condition;
    document.getElementById('high').textContent = Math.round(daily.temperature_2m_max[0]);
    document.getElementById('low').textContent = Math.round(daily.temperature_2m_min[0]);
    
    // Details
    document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    
    // UV Index
    const uvValue = current.uv_index || 0;
    let uvText = 'Low';
    if (uvValue >= 3 && uvValue < 6) uvText = 'Moderate';
    else if (uvValue >= 6 && uvValue < 8) uvText = 'High';
    else if (uvValue >= 8 && uvValue < 11) uvText = 'Very High';
    else if (uvValue >= 11) uvText = 'Extreme';
    document.getElementById('uv').textContent = uvText;
}

// Render forecast
function renderForecast(data) {
    if (!data || !data.daily) return;
    
    const forecast = document.getElementById('forecast');
    const daily = data.daily;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate temp range for the bar
    const allTemps = [...daily.temperature_2m_max, ...daily.temperature_2m_min];
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    const range = maxTemp - minTemp;
    
    let html = '';
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[date.getDay()];
        const weather = weatherData[daily.weather_code[i]] || weatherData[0];
        const high = Math.round(daily.temperature_2m_max[i]);
        const low = Math.round(daily.temperature_2m_min[i]);
        
        // Calculate bar positions
        const lowPos = ((low - minTemp) / range) * 100;
        const highPos = ((high - minTemp) / range) * 100;
        const barWidth = highPos - lowPos;
        
        html += `
            <div class="forecast-item">
                <span class="forecast-day">${dayName}</span>
                <span class="forecast-icon">${weather.icon}</span>
                <div class="forecast-bar">
                    <div class="bar-track">
                        <div class="bar-fill" style="left: ${lowPos}%; width: ${barWidth}%"></div>
                    </div>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${high}°</span>
                    <span class="forecast-low">${low}°</span>
                </div>
            </div>
        `;
    }
    
    forecast.innerHTML = html;
}

// Render news
function renderNews(news) {
    const newsEl = document.getElementById('news');
    
    if (!news || news.length === 0) {
        newsEl.innerHTML = '<div class="news-item"><p>No news available</p></div>';
        return;
    }
    
    let html = '';
    for (const item of news) {
        html += `
            <div class="news-item">
                <a href="${item.link}" target="_blank" rel="noopener">
                    <div class="news-source">${item.source}</div>
                    <div class="news-title">${item.title}</div>
                    <div class="news-time">${item.pubDate}</div>
                </a>
            </div>
        `;
    }
    
    newsEl.innerHTML = html;
}

// Initialize
async function init() {
    const [weatherData, newsData] = await Promise.all([
        fetchWeather(),
        fetchNews()
    ]);
    
    renderWeather(weatherData);
    renderForecast(weatherData);
    renderNews(newsData);
    
    // Refresh weather every 10 minutes
    setInterval(async () => {
        const data = await fetchWeather();
        renderWeather(data);
        renderForecast(data);
    }, 600000);
}

// Start
init();
