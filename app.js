// Medellín Weather & News App
// Built by VaultGhost ☢️

const MEDELLIN_LAT = 6.2442;
const MEDELLIN_LON = -75.5812;

// Weather code to emoji mapping
const weatherIcons = {
    0: '☀️',   // Clear sky
    1: '🌤️',  // Mainly clear
    2: '⛅',   // Partly cloudy
    3: '☁️',   // Overcast
    45: '🌫️', // Foggy
    48: '🌫️', // Depositing rime fog
    51: '🌧️', // Light drizzle
    53: '🌧️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    71: '🌨️', // Slight snow
    73: '🌨️', // Moderate snow
    75: '🌨️', // Heavy snow
    77: '🌨️', // Snow grains
    80: '🌦️', // Slight rain showers
    81: '🌦️', // Moderate rain showers
    82: '⛈️',  // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️',  // Thunderstorm
    96: '⛈️',  // Thunderstorm with hail
    99: '⛈️',  // Thunderstorm with heavy hail
};

const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Severe thunderstorm',
};

// Fetch current weather and forecast from Open-Meteo
async function fetchWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${MEDELLIN_LAT}&longitude=${MEDELLIN_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Bogota&forecast_days=5`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// Fetch news from Colombian sources via RSS
async function fetchNews() {
    // Using rss2json API to convert RSS feeds
    const sources = [
        {
            name: 'El Colombiano',
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.elcolombiano.com/rss/medellin.xml'
        },
        {
            name: 'Caracol Radio',
            url: 'https://api.rss2json.com/v1/api.json?rss_url=https://caracol.com.co/rss/medellin.xml'
        }
    ];
    
    let allNews = [];
    
    for (const source of sources) {
        try {
            const response = await fetch(source.url);
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
                const items = data.items.slice(0, 3).map(item => ({
                    title: item.title,
                    description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                    link: item.link,
                    pubDate: new Date(item.pubDate).toLocaleDateString('es-CO'),
                    source: source.name
                }));
                allNews = [...allNews, ...items];
            }
        } catch (error) {
            console.error(`Error fetching ${source.name}:`, error);
        }
    }
    
    // If RSS fails, show placeholder news
    if (allNews.length === 0) {
        allNews = [
            {
                title: 'Bienvenidos a Medellín Weather & News',
                description: 'Esta aplicación muestra el clima actual y las últimas noticias de Medellín, la ciudad de la eterna primavera.',
                link: '#',
                pubDate: new Date().toLocaleDateString('es-CO'),
                source: 'VaultGhost'
            },
            {
                title: 'El clima en Medellín',
                description: 'Medellín disfruta de un clima templado durante todo el año, con temperaturas promedio entre 18°C y 28°C.',
                link: '#',
                pubDate: new Date().toLocaleDateString('es-CO'),
                source: 'VaultGhost'
            },
            {
                title: 'Conecta con las noticias locales',
                description: 'Próximamente más fuentes de noticias locales serán agregadas para mantenerte informado.',
                link: '#',
                pubDate: new Date().toLocaleDateString('es-CO'),
                source: 'VaultGhost'
            }
        ];
    }
    
    return allNews;
}

// Render weather data
function renderWeather(data) {
    const weatherEl = document.getElementById('weather');
    
    if (!data || !data.current) {
        weatherEl.innerHTML = '<div class="error">Unable to load weather data</div>';
        return;
    }
    
    const current = data.current;
    const icon = weatherIcons[current.weather_code] || '🌡️';
    const description = weatherDescriptions[current.weather_code] || 'Unknown';
    
    weatherEl.innerHTML = `
        <div class="weather-main">
            <div class="weather-temp">
                <span class="weather-icon">${icon}</span>
                <span class="temp-value">${Math.round(current.temperature_2m)}°</span>
            </div>
            <div class="weather-info">
                <div class="weather-description">${description}</div>
                <div class="weather-feels">Feels like ${Math.round(current.apparent_temperature)}°C</div>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <div class="detail-label">💧 Humidity</div>
                <div class="detail-value">${current.relative_humidity_2m}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">💨 Wind</div>
                <div class="detail-value">${Math.round(current.wind_speed_10m)} km/h</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">🌡️ High</div>
                <div class="detail-value">${Math.round(data.daily.temperature_2m_max[0])}°</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">🌡️ Low</div>
                <div class="detail-value">${Math.round(data.daily.temperature_2m_min[0])}°</div>
            </div>
        </div>
    `;
}

// Render forecast
function renderForecast(data) {
    const forecastEl = document.getElementById('forecast');
    
    if (!data || !data.daily) {
        forecastEl.innerHTML = '<div class="error">Unable to load forecast</div>';
        return;
    }
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily = data.daily;
    
    let html = '';
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[date.getDay()];
        const icon = weatherIcons[daily.weather_code[i]] || '🌡️';
        
        html += `
            <div class="forecast-day">
                <div class="forecast-day-name">${dayName}</div>
                <div class="forecast-icon">${icon}</div>
                <div class="forecast-temps">
                    <span class="temp-high">${Math.round(daily.temperature_2m_max[i])}°</span>
                    <span class="temp-low">${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            </div>
        `;
    }
    
    forecastEl.innerHTML = html;
}

// Render news
function renderNews(news) {
    const newsEl = document.getElementById('news');
    
    if (!news || news.length === 0) {
        newsEl.innerHTML = '<div class="error">Unable to load news</div>';
        return;
    }
    
    let html = '';
    for (const item of news) {
        html += `
            <div class="news-card">
                <a href="${item.link}" target="_blank" rel="noopener">
                    <div class="news-source">${item.source}</div>
                    <div class="news-title">${item.title}</div>
                    <div class="news-description">${item.description}</div>
                    <div class="news-date">${item.pubDate}</div>
                </a>
            </div>
        `;
    }
    
    newsEl.innerHTML = html;
}

// Update timestamp
function updateTime() {
    const timeEl = document.getElementById('update-time');
    const now = new Date().toLocaleString('es-CO', { 
        timeZone: 'America/Bogota',
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    timeEl.textContent = `Last updated: ${now}`;
}

// Initialize app
async function init() {
    updateTime();
    
    // Fetch weather and news in parallel
    const [weatherData, newsData] = await Promise.all([
        fetchWeather(),
        fetchNews()
    ]);
    
    renderWeather(weatherData);
    renderForecast(weatherData);
    renderNews(newsData);
    
    // Refresh every 10 minutes
    setInterval(async () => {
        const data = await fetchWeather();
        renderWeather(data);
        renderForecast(data);
        updateTime();
    }, 600000);
}

// Start the app
init();
