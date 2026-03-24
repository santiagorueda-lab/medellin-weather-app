// Apple Weather Clone - Desktop + Mobile - VaultGhost ☢️

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

function isNight() {
    const hour = (new Date().getUTCHours() - 5 + 24) % 24;
    return hour >= 18 || hour < 6;
}

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

function createClouds() {
    const container = document.getElementById('clouds');
    container.innerHTML = '';
    const clouds = [
        { w: 250, h: 100, x: '5%', y: '3%' },
        { w: 350, h: 120, x: '40%', y: '0%' },
        { w: 300, h: 100, x: '75%', y: '5%' },
        { w: 200, h: 80, x: '20%', y: '12%' },
        { w: 280, h: 90, x: '60%', y: '10%' },
    ];
    clouds.forEach(c => {
        const el = document.createElement('div');
        el.className = 'cloud';
        el.style.cssText = `width:${c.w}px;height:${c.h}px;left:${c.x};top:${c.y}`;
        container.appendChild(el);
    });
}

function setBackground(code) {
    const bg = document.getElementById('weather-bg');
    const type = weatherTypes[code] || 'cloudy';
    bg.classList.remove('sunny', 'rainy', 'cloudy', 'night');
    bg.classList.add(isNight() ? 'night' : type);
    
    if (type === 'rainy') {
        createRain(code >= 63 ? 80 : 45);
    } else {
        document.getElementById('rain-container').innerHTML = '';
    }
    createClouds();
}

async function fetchWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${MEDELLIN_LAT}&longitude=${MEDELLIN_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=America/Bogota&forecast_days=10`;
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error('Weather error:', e);
        return null;
    }
}

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
    } catch (e) { console.error('News error:', e); }
    return [];
}

function timeAgo(date) {
    const mins = Math.floor((Date.now() - date) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
}

function formatTime(date) {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')}${ampm}`;
}

function renderHeader(data) {
    if (!data?.current) return;
    const { temperature_2m, weather_code } = data.current;
    const { temperature_2m_max, temperature_2m_min } = data.daily;
    
    document.getElementById('temp-main').textContent = `${Math.round(temperature_2m)}°`;
    document.getElementById('condition').textContent = weatherConditions[weather_code] || 'Cloudy';
    document.getElementById('temp-range').textContent = `H:${Math.round(temperature_2m_max[0])}° L:${Math.round(temperature_2m_min[0])}°`;
    setBackground(weather_code);
}

function renderHourly(data) {
    if (!data?.hourly) return;
    const { time, temperature_2m, weather_code, precipitation_probability } = data.hourly;
    const now = new Date();
    let startIdx = time.findIndex(t => new Date(t) >= now);
    if (startIdx < 0) startIdx = 0;
    
    const sunset = new Date(data.daily.sunset[0]);
    const wind = Math.round(data.current.wind_speed_10m);
    const nextCode = weather_code[startIdx + 2] || weather_code[startIdx];
    
    document.getElementById('hourly-summary').textContent = 
        `${weatherConditions[nextCode] || 'Cloudy'} conditions expected. Wind gusts are up to ${wind} km/h.`;
    
    let html = '';
    let sunsetShown = false;
    
    for (let i = 0; i < 12; i++) {
        const idx = startIdx + i;
        if (idx >= time.length) break;
        
        const t = new Date(time[idx]);
        const hour = t.getHours();
        const temp = Math.round(temperature_2m[idx]);
        const icon = weatherIcons[weather_code[idx]] || '☁️';
        const rain = precipitation_probability[idx];
        
        // Insert sunset
        if (!sunsetShown && t > sunset) {
            sunsetShown = true;
            html += `<div class="hourly-item"><div class="hourly-time">${formatTime(sunset)}</div><div class="hourly-icon">🌅</div><div class="hourly-rain"></div><div class="hourly-temp">Sunset</div></div>`;
        }
        
        const timeStr = i === 0 ? 'Now' : `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`;
        html += `<div class="hourly-item"><div class="hourly-time">${timeStr}</div><div class="hourly-icon">${icon}</div><div class="hourly-rain">${rain > 0 ? rain + '%' : ''}</div><div class="hourly-temp">${temp}°</div></div>`;
    }
    
    document.getElementById('hourly-scroll').innerHTML = html;
}

function renderForecast(data) {
    if (!data?.daily) return;
    const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = data.daily;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const minT = Math.min(...temperature_2m_min);
    const maxT = Math.max(...temperature_2m_max);
    const range = maxT - minT;
    const currentTemp = data.current.temperature_2m;
    
    let html = '';
    for (let i = 0; i < Math.min(time.length, 10); i++) {
        const d = new Date(time[i]);
        const day = i === 0 ? 'Today' : days[d.getDay()];
        const icon = weatherIcons[weather_code[i]] || '☁️';
        const low = Math.round(temperature_2m_min[i]);
        const high = Math.round(temperature_2m_max[i]);
        const rain = precipitation_probability_max[i];
        
        const lowPos = ((low - minT) / range) * 100;
        const highPos = ((high - minT) / range) * 100;
        const width = highPos - lowPos;
        
        let dot = '';
        if (i === 0) {
            const dotPos = Math.min(Math.max(((currentTemp - minT) / range) * 100, lowPos), highPos);
            const rel = ((dotPos - lowPos) / width) * 100;
            dot = `<div class="forecast-bar-dot" style="left:${rel}%"></div>`;
        }
        
        html += `<div class="forecast-row"><div class="forecast-day">${day}</div><div class="forecast-icon-wrap"><div class="forecast-icon">${icon}</div>${rain > 20 ? `<div class="forecast-rain">${rain}%</div>` : '<div class="forecast-rain"></div>'}</div><div class="forecast-low">${low}°</div><div class="forecast-bar"><div class="forecast-bar-fill" style="left:${lowPos}%;width:${width}%">${dot}</div></div><div class="forecast-high">${high}°</div></div>`;
    }
    
    document.getElementById('forecast-list').innerHTML = html;
}

function renderDetails(data) {
    if (!data?.current || !data?.daily) return;
    
    const { apparent_temperature, relative_humidity_2m, wind_speed_10m, surface_pressure } = data.current;
    const { sunrise, sunset, uv_index_max } = data.daily;
    const dewPoint = data.hourly?.dew_point_2m?.[0] || '--';
    
    // UV
    const uv = Math.round(uv_index_max[0]);
    const uvLabels = ['Low', 'Low', 'Low', 'Moderate', 'Moderate', 'Moderate', 'High', 'High', 'Very High', 'Very High', 'Very High', 'Extreme'];
    const uvDescs = ['No protection needed.', 'No protection needed.', 'No protection needed.', 'Use sun protection.', 'Use sun protection.', 'Use sun protection.', 'Protection essential.', 'Protection essential.', 'Extra protection needed.', 'Extra protection needed.', 'Extra protection needed.', 'Avoid sun exposure.'];
    
    document.getElementById('uv-value').textContent = uv;
    document.getElementById('uv-label').textContent = uvLabels[Math.min(uv, 11)];
    document.getElementById('uv-desc').textContent = uvDescs[Math.min(uv, 11)];
    document.getElementById('uv-dot').style.left = `${Math.min(uv / 11 * 100, 100)}%`;
    
    // Sunset
    const sunsetDate = new Date(sunset[0]);
    const sunriseDate = new Date(sunrise[0]);
    document.getElementById('sunset-time').textContent = formatTime(sunsetDate);
    document.getElementById('sunrise-time').textContent = `Sunrise: ${formatTime(sunriseDate)}`;
    
    // Sun position (simplified)
    const now = new Date();
    const dayLength = sunsetDate - sunriseDate;
    const elapsed = now - sunriseDate;
    const sunPos = Math.min(Math.max(elapsed / dayLength, 0), 1);
    const angle = sunPos * 180;
    const sunDot = document.getElementById('sun-dot');
    const radius = 40;
    sunDot.style.left = `calc(10% + ${sunPos * 80}%)`;
    sunDot.style.bottom = `${Math.sin(angle * Math.PI / 180) * 45}px`;
    
    // Wind
    document.getElementById('wind-speed').textContent = Math.round(wind_speed_10m);
    
    // Feels Like
    const feels = Math.round(apparent_temperature);
    const actual = Math.round(data.current.temperature_2m);
    document.getElementById('feels-value').textContent = `${feels}°`;
    document.getElementById('feels-desc').textContent = feels === actual ? 'Similar to the actual temperature.' : feels > actual ? 'Humidity is making it feel warmer.' : 'Wind is making it feel cooler.';
    
    // Humidity
    document.getElementById('humidity-value').textContent = `${relative_humidity_2m}%`;
    document.getElementById('humidity-desc').textContent = `The dew point is ${Math.round(dewPoint)}° right now.`;
    
    // Pressure
    document.getElementById('pressure-value').textContent = Math.round(surface_pressure);
}

function renderNews(news) {
    const html = news.length ? news.map(n => `<div class="news-item"><a href="${n.link}" target="_blank" rel="noopener"><div class="news-source">${n.source}</div><div class="news-title">${n.title}</div><div class="news-time">${n.time}</div></a></div>`).join('') : '<div class="news-item"><p>No news available</p></div>';
    
    document.getElementById('news-list-desktop').innerHTML = html;
    document.getElementById('news-list-mobile').innerHTML = html;
}

async function init() {
    const [weather, news] = await Promise.all([fetchWeather(), fetchNews()]);
    
    if (weather) {
        renderHeader(weather);
        renderHourly(weather);
        renderForecast(weather);
        renderDetails(weather);
    }
    renderNews(news);
    
    setInterval(async () => {
        const w = await fetchWeather();
        if (w) {
            renderHeader(w);
            renderHourly(w);
            renderForecast(w);
            renderDetails(w);
        }
    }, 600000);
}

init();
