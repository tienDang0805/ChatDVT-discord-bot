import { Router } from 'express';
import axios from 'axios';

const router = Router();

const WEATHER_LAT = 10.8231;
const WEATHER_LON = 106.6297;

router.get('/weather/current', async (req, res) => {
    try {
        const apiKey = process.env.APIKEY_WEATHER || '';
        if (!apiKey) return res.status(500).json({ error: 'Weather API key not configured' });
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { lat: WEATHER_LAT, lon: WEATHER_LON, appid: apiKey, units: 'metric', lang: 'vi' }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Weather API Error:', error.message);
        res.status(502).json({ error: 'Failed to fetch weather data' });
    }
});

router.get('/weather/forecast', async (req, res) => {
    try {
        const apiKey = process.env.APIKEY_WEATHER || '';
        if (!apiKey) return res.status(500).json({ error: 'Weather API key not configured' });
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: { lat: WEATHER_LAT, lon: WEATHER_LON, appid: apiKey, units: 'metric', lang: 'vi' }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Forecast API Error:', error.message);
        res.status(502).json({ error: 'Failed to fetch forecast data' });
    }
});

export default router;
