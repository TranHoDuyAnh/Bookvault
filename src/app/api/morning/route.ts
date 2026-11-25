import { NextRequest, NextResponse } from 'next/server';
import { getHcmcPeriodMeta, type DayPeriod } from '@/lib/lunar';

export interface MorningWeatherHourly {
  time: string;
  hourLabel: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface MorningWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherLabel: string;
  uvIndexMax: number | null;
  tempMax: number | null;
  tempMin: number | null;
  precipitationProbMax: number | null;
  sunrise: string | null;
  sunset: string | null;
  aqi: number | null;
  aqiLabel: string;
  pm25: number | null;
  hourly: MorningWeatherHourly[];
  advice: string;
}

export interface MorningGoldData {
  name: string;
  buy: number; // VND per chi
  sell: number; // VND per chi
  source: string;
  sjcBuy?: number | null;
  sjcSell?: number | null;
}

export interface MorningFuelItem {
  name: string;
  zone1Price: number; // VND per liter (TP.HCM)
}

export interface MorningPhotoItem {
  url: string;
  title: string;
  copyright: string;
}

export interface MorningBriefResponse {
  updatedAt: string;
  weather: MorningWeatherData | null;
  gold: MorningGoldData | null;
  fuel: MorningFuelItem[];
  photos: MorningPhotoItem[];
}

const WMO_WEATHER_LABELS: Record<number, string> = {
  0: 'Trời quang đãng',
  1: 'Ít mây',
  2: 'Có mây rải rác',
  3: 'Nhiều mây',
  45: 'Sương mù nhẹ',
  48: 'Sương mù',
  51: 'Mưa phùn nhẹ',
  53: 'Mưa phùn',
  55: 'Mưa phùn dày',
  61: 'Mưa nhỏ',
  63: 'Mưa vừa',
  65: 'Mưa to',
  80: 'Mưa rào nhẹ',
  81: 'Mưa rào',
  82: 'Mưa rào lớn',
  95: 'Dông sét',
  96: 'Dông kèm mưa đá',
  99: 'Dông mạnh',
};

function getWeatherLabel(code: number): string {
  return WMO_WEATHER_LABELS[code] || 'Thời tiết thay đổi';
}

function getAqiLabel(aqi: number | null): string {
  if (aqi === null) return 'Chưa có dữ liệu';
  if (aqi <= 50) return 'Tốt';
  if (aqi <= 100) return 'Trung bình';
  if (aqi <= 150) return 'Kém (nhạy cảm)';
  return 'Ô nhiễm';
}

function buildWeatherAdvice(
  temp: number,
  hourly: MorningWeatherHourly[],
  aqi: number | null
): string {
  const rainyHour = hourly.find((h) => h.precipitationProbability >= 50);
  if (rainyHour) {
    return `Có khả năng mưa lúc ${rainyHour.hourLabel} (${rainyHour.precipitationProbability}%), nhớ mang áo mưa khi ra đường.`;
  }
  if (temp >= 34) {
    return 'Trời nắng nóng, nhớ uống đủ nước và che chắn khi di chuyển ngoài trời.';
  }
  if (aqi !== null && aqi > 100) {
    return 'Chất lượng không khí ở mức kém, nên đeo khẩu trang khi ra đường.';
  }
  return 'Thời tiết TP.HCM khá dễ chịu, thích hợp cho các hoạt động ngoài trời.';
}

async function fetchHcmcWeather(): Promise<MorningWeatherData | null> {
  const [forecastRes, aqiRes] = await Promise.allSettled([
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=precipitation_probability,weather_code,temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=Asia%2FHo_Chi_Minh&forecast_days=2',
      { next: { revalidate: 1800 } }
    ),
    fetch(
      'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=10.8231&longitude=106.6297&current=us_aqi,pm2_5&timezone=Asia%2FHo_Chi_Minh',
      { next: { revalidate: 1800 } }
    ),
  ]);

  if (forecastRes.status !== 'fulfilled' || !forecastRes.value.ok) {
    return null;
  }

  const forecast = await forecastRes.value.json();
  const current = forecast.current;
  const daily = forecast.daily;
  const hourlyRaw = forecast.hourly;

  let aqi: number | null = null;
  let pm25: number | null = null;
  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    const aqiJson = await aqiRes.value.json();
    aqi = typeof aqiJson.current?.us_aqi === 'number' ? Math.round(aqiJson.current.us_aqi) : null;
    pm25 = typeof aqiJson.current?.pm2_5 === 'number' ? Math.round(aqiJson.current.pm2_5) : null;
  }

  // Pick next 8 hours from current HCMC time
  const nowHourIso = String(current?.time || '').slice(0, 13);
  const times: string[] = hourlyRaw?.time || [];
  let startIdx = times.findIndex((t) => t.slice(0, 13) >= nowHourIso);
  if (startIdx < 0) startIdx = 0;

  const hourly: MorningWeatherHourly[] = times
    .slice(startIdx, startIdx + 8)
    .map((t, offset) => {
      const idx = startIdx + offset;
      return {
        time: t,
        hourLabel: t.slice(11, 16),
        temperature: Math.round(hourlyRaw.temperature_2m?.[idx] ?? current.temperature_2m),
        precipitationProbability: Math.round(hourlyRaw.precipitation_probability?.[idx] ?? 0),
        weatherCode: hourlyRaw.weather_code?.[idx] ?? 0,
      };
    });

  const temp = Math.round(current.temperature_2m);

  return {
    temperature: temp,
    apparentTemperature: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    weatherCode: current.weather_code,
    weatherLabel: getWeatherLabel(current.weather_code),
    uvIndexMax: typeof daily?.uv_index_max?.[0] === 'number' ? Math.round(daily.uv_index_max[0]) : null,
    tempMax: typeof daily?.temperature_2m_max?.[0] === 'number' ? Math.round(daily.temperature_2m_max[0]) : null,
    tempMin: typeof daily?.temperature_2m_min?.[0] === 'number' ? Math.round(daily.temperature_2m_min[0]) : null,
    precipitationProbMax:
      typeof daily?.precipitation_probability_max?.[0] === 'number'
        ? Math.round(daily.precipitation_probability_max[0])
        : null,
    sunrise: daily?.sunrise?.[0] ? String(daily.sunrise[0]).slice(11, 16) : null,
    sunset: daily?.sunset?.[0] ? String(daily.sunset[0]).slice(11, 16) : null,
    aqi,
    aqiLabel: getAqiLabel(aqi),
    pm25,
    hourly,
    advice: buildWeatherAdvice(temp, hourly, aqi),
  };
}

async function fetchPnjGold9999(): Promise<MorningGoldData | null> {
  try {
    // zone=11 is TP.HCM on PNJ Edge API
    const res = await fetch('https://edge-api.pnj.io/ecom-frontend/v1/get-gold-price?zone=11', {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const list: Array<{ masp?: string; tensp?: string; giaban?: number; giamua?: number }> =
      json?.data || [];

    const ring9999 =
      list.find((item) => item.masp === 'N24K') ||
      list.find((item) => item.tensp?.toLowerCase().includes('nhẫn trơn'));

    const sjc = list.find((item) => item.masp === 'SJC');

    if (!ring9999 || !ring9999.giaban || !ring9999.giamua) return null;

    return {
      name: ring9999.tensp || 'Nhẫn Trơn PNJ 999.9',
      buy: ring9999.giamua * 1000,
      sell: ring9999.giaban * 1000,
      source: 'PNJ TP.HCM',
      sjcBuy: sjc?.giamua ? sjc.giamua * 1000 : null,
      sjcSell: sjc?.giaban ? sjc.giaban * 1000 : null,
    };
  } catch {
    return null;
  }
}

async function fetchFuelPrices(): Promise<MorningFuelItem[]> {
  try {
    const res = await fetch('https://webgia.com/gia-xang-dau/petrolimex/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HomeBase/1.0)',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const rowRegex =
      /<tr><th><a[^>]*>([^<]+)<\/a><\/th><td[^>]*>([\d.,]+)<\/td><td[^>]*>([\d.,]+)<\/td><\/tr>/gi;

    const results: MorningFuelItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const zone1Raw = match[2].replace(/\./g, '').replace(',', '.');
      const zone1Price = parseInt(zone1Raw, 10);

      if (!name || isNaN(zone1Price)) continue;

      // Keep the most relevant fuel types for daily commuters
      const lower = name.toLowerCase();
      if (
        lower.includes('ron 95') ||
        lower.includes('e5 ron 92') ||
        lower.includes('dầu do 0,05s') ||
        lower.includes('dầu do 0,001s')
      ) {
        results.push({ name, zone1Price });
      }
    }

    return results.slice(0, 4);
  } catch {
    return [];
  }
}

const UNSPLASH_PERIOD_QUERIES: Record<DayPeriod, string> = {
  morning: 'sunrise morning coffee nature',
  afternoon: 'sunny tropical city architecture',
  evening: 'sunset golden hour skyline',
  night: 'night city lights calm',
};

async function fetchDailyPhotos(period: DayPeriod): Promise<MorningPhotoItem[]> {
  const fallbackPhotos: MorningPhotoItem[] = [
    {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80',
      title: 'Sài Gòn bình minh',
      copyright: 'Unsplash — Ho Chi Minh City',
    },
    {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80',
      title: 'Nhịp sống thành phố',
      copyright: 'Unsplash — Vietnam',
    },
    {
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
      title: 'Buổi chiều yên bình',
      copyright: 'Unsplash — Nature',
    },
    {
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
      title: 'Cà phê sáng Sài Gòn',
      copyright: 'Unsplash — Morning Coffee',
    },
  ];

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return fallbackPhotos;
  }

  try {
    const query = UNSPLASH_PERIOD_QUERIES[period] || UNSPLASH_PERIOD_QUERIES.morning;
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&orientation=landscape&count=8&content_filter=high`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return fallbackPhotos;

    const json = await res.json();
    const list: Array<{
      urls?: { regular?: string; full?: string };
      alt_description?: string | null;
      description?: string | null;
      user?: { name?: string };
      location?: { name?: string | null };
    }> = Array.isArray(json) ? json : [json];

    const mapped = list
      .filter((img) => Boolean(img.urls?.regular || img.urls?.full))
      .map((img) => {
        const photoUrl = img.urls?.regular || img.urls?.full || '';
        const author = img.user?.name ? `Photo by ${img.user.name} on Unsplash` : 'Unsplash';
        const location = img.location?.name ? `${img.location.name} • ` : '';
        return {
          url: photoUrl,
          title: img.alt_description || img.description || 'Unsplash Daily Photo',
          copyright: `${location}${author}`,
        };
      });

    return mapped.length > 0 ? mapped : fallbackPhotos;
  } catch {
    return fallbackPhotos;
  }
}

function resolveCurrentHcmcPeriod(param: string | null): DayPeriod {
  if (param === 'morning' || param === 'afternoon' || param === 'evening' || param === 'night') {
    return param;
  }
  const hourNum = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );
  return getHcmcPeriodMeta(isNaN(hourNum) ? 8 : hourNum).period;
}

export async function GET(request: NextRequest) {
  const period = resolveCurrentHcmcPeriod(request.nextUrl.searchParams.get('period'));

  const [weatherRes, goldRes, fuelRes, photosRes] = await Promise.allSettled([
    fetchHcmcWeather(),
    fetchPnjGold9999(),
    fetchFuelPrices(),
    fetchDailyPhotos(period),
  ]);

  const payload: MorningBriefResponse = {
    updatedAt: new Date().toISOString(),
    weather: weatherRes.status === 'fulfilled' ? weatherRes.value : null,
    gold: goldRes.status === 'fulfilled' ? goldRes.value : null,
    fuel: fuelRes.status === 'fulfilled' ? fuelRes.value : [],
    photos: photosRes.status === 'fulfilled' ? photosRes.value : [],
  };

  return NextResponse.json(payload);
}
