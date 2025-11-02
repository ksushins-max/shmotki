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
    const { message, messages, weather, wardrobe } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY не настроен');
    }

    let contextInfo = '';
    
    if (weather) {
      contextInfo += `\n\nТекущая погода: ${weather.temp}°C, ${weather.condition} (${weather.location})`;
    }
    
    if (wardrobe && wardrobe.length > 0) {
      contextInfo += `\n\nГардероб пользователя (${wardrobe.length} вещей):\n`;
      wardrobe.forEach((item: any) => {
        contextInfo += `- ${item.name} (${item.category}, ${item.color}, ${item.season})${item.description ? ': ' + item.description : ''}\n`;
      });
    }

    const systemPrompt = `Вы - профессиональный AI стилист и консультант по моде. 
    Вы помогаете пользователям с:
    - Подбором одежды и аксессуаров из их гардероба
    - Созданием стильных образов с учетом погоды и имеющихся вещей
    - Анализом их гардероба
    - Советами по модным трендам
    - Рекомендациями с учетом погоды, сезона и их вещей
    
    ВАЖНО: При составлении образов используйте ТОЛЬКО вещи из гардероба пользователя.
    Учитывайте текущую погоду при рекомендациях.
    ${contextInfo}
    
    Отвечайте на русском языке, будьте дружелюбны и профессиональны.`;

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
