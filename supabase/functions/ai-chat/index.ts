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
    const { message, messages, weather, wardrobe, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY не настроен');
    }

    let contextInfo = '\n\nЛокация: Санкт-Петербург, Россия';
    
    if (weather) {
      contextInfo += `\nТекущая погода: ${weather.temperature}°C, ${weather.condition}`;
    }

    if (userProfile) {
      const profileInfo = [];
      if (userProfile.gender) profileInfo.push(`пол: ${userProfile.gender === 'male' ? 'мужской' : userProfile.gender === 'female' ? 'женский' : 'другое'}`);
      if (userProfile.age) profileInfo.push(`возраст: ${userProfile.age}`);
      if (userProfile.occupation) profileInfo.push(`сфера: ${userProfile.occupation}`);
      
      if (profileInfo.length > 0) {
        contextInfo += `\nПользователь: ${profileInfo.join(', ')}`;
      }
    }
    
    if (wardrobe && wardrobe.length > 0) {
      contextInfo += `\n\nГардероб (${wardrobe.length} вещей):\n`;
      wardrobe.forEach((item: any) => {
        contextInfo += `- ${item.name} (${item.category}, ${item.color}, ${item.season})\n`;
      });
    }

    const systemPrompt = `Ты - профессиональный стилист. Давай КОРОТКИЕ конкретные советы (2-3 предложения). 
Сразу предлагай готовые образы из имеющихся вещей с учетом погоды. 
НЕ задавай уточняющих вопросов - сразу давай рекомендации.${contextInfo}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(messages || []),
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
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
