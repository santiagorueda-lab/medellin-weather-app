// Apple Weather Clone - VaultGhost ☢️

const MEDELLIN_LAT = 6.2442;
const MEDELLIN_LON = -75.5812;

const weatherIcons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌧️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
    80: '🌦️', 81: '🌦️', 82: '⛈️',
    85: '🌨️', 86: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const weatherConditions = {
    0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Cloudy',
    45: 'Foggy', 48: 'Foggy',
    51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
    80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Storm'
};

const weatherTypes = {
    0: 'sunny', 1: 'sunny', 2: 'sunny', 3: 'cloudy',
    45: 'cloudy', 48: 'cloudy',
    51: 'rainy', 53: 'rainy', 55: 'rainy',
    61: 'rainy', 63: 'rainy', 65: 'rainy',
    80: 'rainy', 81: 'rainy', 82: 'rainy',
    95: 'rainy', 96: 'rainy', 99: 'rainy'
};

// Check if night (6PM - 6AM Bogota time)
function isNight() {
    const now = new Date();
    const hour = (now.getUTCHours() - 5 + 24) % 24;
    return hour >= 18 || hour < 6;
}

// Create rain effect
function createRain(intensity = 50) {
    const container = document.getElementById('rain-container');
    container.innerHTML = '';
    
    for (let i = 0; i < intensity; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.height = `${15 + Math.random() * 25}px`;
        drop.style.animationDuration = `${0.4 + Math.random() * 0.4}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(drop);
    }
}

// Create clouds
function createClouds() {
    const container = document.getElementById('clouds');
    container.innerHTML = '';
    
    const cloudData = [
        { w: 200, h: 80, x: '10%', y: '5%' },
        { w: 300, h: 100, x: '50%', y: '2%' },
        { w: 250, h: 90, x: '80%', y: '8%' },
        { w: 180, h: 70, x: '30%', y: '15%' },
        { w: 220, h: 80, x: '70%', y: '12%' },
    ];
    
    cloudData.forEach(c => {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.width = `${c.w}px`;
        cloud.style.height = `${c.h}px`;
        cloud.style.left = c.x;
        cloud.style.top = c.y;
        container.appendChild(cloud);
    });
}

// Set background based on weather
function setBackground(weatherCode) {
    const bg = document.getElementById('weather-bg');
    const type = weatherTypes[weatherCode] || 'cloudy';
    
    bg.classList.remove('sunny', 'rainy', 'cloudy', 'night');
    
    if (isNight()) {
        bg.classList.add('night');
    } else {
        bg.classList.add(type);
    }
    
    // Rain effect
    const rainContainer = document.getElementById('rain-container');
    if (type === 'rainy') {
        createRain(weatherCode >= 63 ? 80 : 40);
    } else {
        rainContainer.innerHTML = '';
    }
    
    createClouds();
}

// Fetch weather with hourly data
async function fetchWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${MEDELLIN_LAT}&longitude=${MEDELLIN_LON}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=America/Bogota&forecast_days=10`;
    
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error('Weather error:', e);
        return null;
    }
}

// Fetch news
async function fetchNews() {
    try {
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.elcolombiano.com/rss/medellin.xml');
        const data = await res.json();
        if (data.status === 'ok') {
            return data.items.slice(0, 4).map(item => ({
                title: item.title,
                link: item.link,
                time: timeAgo(new Date(item.pubDate)),
                source: 'El Colombiano'
            }));
        }
    } catch (e) {
        console.error('News error:', e);
    }
    return [];
}

function timeAgo(date) {
    const mins = Math.floor((Date.now() - date) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
}

// Render main header
function renderHeader(data) {
    if (!data?.current) return;
    
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const high = Math.round(data.daily.temperature_2m_max[0]);
    const low = Math.round(data.daily.temperature_2m_min[0]);
    
    document.getElementById('temp-main').textContent = `${temp}°`;
    document.getElementById('condition').textContent = weatherConditions[code] || 'Cloudy';
    document.getElementById('temp-range').textContent = `H:${high}° L:${low}°`;
    
    setBackground(code);
}

// Render hourly forecast
function renderHourly(data) {
    if (!data?.hourly) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const hourly = data.hourly;
    
    // Find current hour index
    let startIdx = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        const h = new Date(hourly.time[i]).getHours();
        if (new Date(hourly.time[i]) >= now) {
            startIdx = i;
            break;
        }
    }
    
    // Get sunset time
    const sunset = new Date(data.daily.sunset[0]);
    const sunsetHour = sunset.getHours();
    const sunsetMin = sunset.getMinutes();
    
    // Summary
    const nextCode = hourly.weather_code[startIdx + 2] || hourly.weather_code[startIdx];
    const wind = Math.round(data.current.wind_speed_10m);
    const condition = weatherConditions[nextCode] || 'Cloudy';
    document.getElementById('hourly-summary').textContent = 
        `${condition} conditions expected. Wind gusts are up to ${wind} km/h.`;
    
    // Hourly items
    let html = '';
    for (let i = 0; i < 8; i++) {
        const idx = startIdx + i;
        if (idx >= hourly.time.length) break;
        
        const time = new Date(hourly.time[idx]);
        const hour = time.getHours();
        const temp = Math.round(hourly.temperature_2m[idx]);
        const icon = weatherIcons[hourly.weather_code[idx]] || '☁️';
        const rain = hourly.precipitation_probability[idx];
        
        // Check if this is sunset hour
        const isSunset = hour === sunsetHour && i > 0;
        
        let timeStr = i === 0 ? 'Now' : `${hour > 12 ? hour - 12 : hour || 12}${hour >= 12 ? 'PM' : 'AM'}`;
        
        if (isSunset) {
            html += `
                <div class="hourly-item">
                    <div class="hourly-time">${sunsetHour > 12 ? sunsetHour - 12 : sunsetHour}:${String(sunsetMin).padStart(2, '0')}PM</div>
                    <div class="hourly-icon">🌅</div>
                    <div class="hourly-rain"></div>
                    <div class="hourly-temp">Sunset</div>
                </div>
            `;
        }
        
        html += `
            <div class="hourly-item">
                <div class="hourly-time">${timeStr}</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-rain">${rain > 0 ? rain + '%' : ''}</div>
                <div class="hourly-temp">${temp}°</div>
            </div>
        `;
    }
    
    document.getElementById('hourly-scroll').innerHTML = html;
}

// Render 10-day forecast
function renderForecast(data) {
    if (!data?.daily) return;
    
    const daily = data.daily;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get temp range for bars
    const allLows = daily.temperature_2m_min;
    const allHighs = daily.temperature_2m_max;
    const minTemp = Math.min(...allLows);
    const maxTemp = Math.max(...allHighs);
    const range = maxTemp - minTemp;
    
    // Current temp for dot position
    const currentTemp = data.current.temperature_2m;
    
    let html = '';
    for (let i = 0; i < Math.min(daily.time.length, 10); i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[date.getDay()];
        const icon = weatherIcons[daily.weather_code[i]] || '☁️';
        const low = Math.round(daily.temperature_2m_min[i]);
        const high = Math.round(daily.temperature_2m_max[i]);
        const rain = daily.precipitation_probability_max[i];
        
        // Bar calculations
        const lowPos = ((low - minTemp) / range) * 100;
        const highPos = ((high - minTemp) / range) * 100;
        const barWidth = highPos - lowPos;
        
        // Dot position (only for today)
        let dotHtml = '';
        if (i === 0) {
            const dotPos = ((currentTemp - minTemp) / range) * 100;
            const dotRelative = ((dotPos - lowPos) / barWidth) * 100;
            dotHtml = `<div class="forecast-bar-dot" style="left: ${Math.min(Math.max(dotRelative, 0), 100)}%"></div>`;
        }
        
        html += `
            <div class="forecast-row">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon-wrap">
                    <div class="forecast-icon">${icon}</div>
                    ${rain > 20 ? `<div class="forecast-rain">${rain}%</div>` : '<div class="forecast-rain"></div>'}
                </div>
                <div class="forecast-low">${low}°</div>
                <div class="forecast-bar">
                    <div class="forecast-bar-fill" style="left: ${lowPos}%; width: ${barWidth}%">
                        ${dotHtml}
                    </div>
                </div>
                <div class="forecast-high">${high}°</div>
            </div>
        `;
    }
    
    document.getElementById('forecast-list').innerHTML = html;
}

// Render news
function renderNews(news) {
    if (!news.length) {
        document.getElementById('news-list').innerHTML = '<div class="loading">No news available</div>';
        return;
    }
    
    let html = '';
    news.forEach(item => {
        html += `
            <div class="news-item">
                <a href="${item.link}" target="_blank" rel="noopener">
                    <div class="news-source">${item.source}</div>
                    <div class="news-title">${item.title}</div>
                    <div class="news-time">${item.time}</div>
                </a>
            </div>
        `;
    });
    
    document.getElementById('news-list').innerHTML = html;
}

// Init
async function init() {
    const [weather, news] = await Promise.all([fetchWeather(), fetchNews()]);
    
    if (weather) {
        renderHeader(weather);
        renderHourly(weather);
        renderForecast(weather);
    }
    
    renderNews(news);
    
    // Refresh every 10 min
    setInterval(async () => {
        const w = await fetchWeather();
        if (w) {
            renderHeader(w);
            renderHourly(w);
            renderForecast(w);
        }
    }, 600000);
}

init();
