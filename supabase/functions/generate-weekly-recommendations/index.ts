import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wardrobe, weatherForecast, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY не настроен');
    }

    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const today = new Date();
    
    const getDayInfo = (offset: number) => {
      const targetDay = new Date(today);
      targetDay.setDate(today.getDate() + offset);
      return {
        day: days[targetDay.getDay()],
        date: targetDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      };
    };

    const getWeatherCondition = (code: number): string => {
      const conditions: { [key: number]: string } = {
        0: "Ясно", 1: "Ясно", 2: "Облачно", 3: "Облачно",
        45: "Туман", 51: "Морось", 61: "Дождь", 71: "Снег", 95: "Гроза"
      };
      return conditions[code] || "Переменная облачность";
    };

    // Формируем прогноз погоды на неделю
    let weatherInfo = '\n\nПрогноз погоды на неделю для Санкт-Петербурга:\n';
    if (weatherForecast?.daily) {
      for (let i = 0; i < 7; i++) {
        const dayInfo = getDayInfo(i);
        const tempMax = Math.round(weatherForecast.daily.temperature_2m_max[i]);
        const tempMin = Math.round(weatherForecast.daily.temperature_2m_min[i]);
        const condition = getWeatherCondition(weatherForecast.daily.weathercode[i]);
        weatherInfo += `${dayInfo.day} (${dayInfo.date}): ${tempMin}°C...${tempMax}°C, ${condition}\n`;
      }
    } else {
      weatherInfo = '\n\nПрогноз погоды недоступен. Создай универсальные рекомендации для осенней погоды.';
    }

    let wardrobeInfo = '';
    if (wardrobe && wardrobe.length > 0) {
      wardrobeInfo = `\n\nГардероб пользователя:\n`;
      wardrobe.forEach((item: any) => {
        wardrobeInfo += `- ${item.name} (${item.category}, ${item.color}, ${item.season})\n`;
      });
    } else {
      wardrobeInfo = '\n\nГардероб пользователя пуст. Создайте общие рекомендации по стилю.';
    }

    let profileInfo = '';
    if (userProfile) {
      const details = [];
      if (userProfile.gender) details.push(`пол: ${userProfile.gender === 'male' ? 'мужской' : userProfile.gender === 'female' ? 'женский' : 'другое'}`);
      if (userProfile.age) details.push(`возраст: ${userProfile.age}`);
      if (userProfile.occupation) details.push(`сфера: ${userProfile.occupation}`);
      
      if (details.length > 0) {
        profileInfo = `\n\nПрофиль: ${details.join(', ')}`;
      }
    }

    const prompt = `Создай 7 персональных образов на каждый день недели, начиная с сегодняшнего дня (${getDayInfo(0).day}, ${getDayInfo(0).date}).
    
Локация: Санкт-Петербург, Россия${weatherInfo}${profileInfo}${wardrobeInfo}

Для каждого дня создай уникальный образ с учетом прогноза погоды на этот конкретный день. Верни ответ СТРОГО в формате JSON массива:
[
  {
    "day": "День недели",
    "date": "Дата",
    "weather": "☀️ Температура°C, условие",
    "outfit": ["вещь 1", "вещь 2", "вещь 3"],
    "tip": "Совет стилиста"
  }
]

Важно:
- Используй ТОЛЬКО вещи из гардероба пользователя (если гардероб не пуст)
- Учитывай КОНКРЕТНУЮ погоду для каждого дня из прогноза выше
- Создай разнообразные образы
- Каждый совет должен быть уникальным и полезным
- Дни начинаются с ${getDayInfo(0).day}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Ты профессиональный стилист. Отвечай ТОЛЬКО валидным JSON без дополнительного текста.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    // Clean up the response to extract JSON
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const recommendations = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-weekly-recommendations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
