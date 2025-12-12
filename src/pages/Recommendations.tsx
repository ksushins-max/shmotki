import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DayRecommendation {
  day: string;
  date: string;
  weather: string;
  outfit: string[];
  tip: string;
  shoppingLinks?: {
    name: string;
    url: string;
    brand: string;
  }[];
}

interface WeatherData {
  temp: number;
  condition: string;
}

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<DayRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    generateRecommendations();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchWeather = async () => {
    try {
      const latitude = 59.9343;
      const longitude = 30.3351;
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Moscow&forecast_days=7`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: "Ясно", 1: "Ясно", 2: "Облачно", 3: "Облачно",
      45: "Туман", 51: "Морось", 53: "Морось",
      61: "Дождь", 63: "Дождь", 65: "Дождь",
      71: "Снег", 73: "Снег", 75: "Снег", 95: "Гроза"
    };
    return conditions[code] || "Переменная облачность";
  };

  const getWeatherEmoji = (weatherString: string): string => {
    const lower = weatherString.toLowerCase();
    if (lower.includes('ясно') || lower.includes('солнечно')) return '☀️';
    if (lower.includes('облачно')) return '☁️';
    if (lower.includes('морось') || lower.includes('дождь')) return '🌧️';
    if (lower.includes('снег')) return '❄️';
    if (lower.includes('гроза')) return '⛈️';
    if (lower.includes('туман')) return '🌫️';
    return '☁️';
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для получения рекомендаций",
          variant: "destructive"
        });
        return;
      }

      const { data: wardrobe } = await supabase.from("clothing_items").select("*").eq("user_id", user.id);
      const weatherData = await fetchWeather();

      const { data, error } = await supabase.functions.invoke("generate-weekly-recommendations", {
        body: {
          wardrobe: wardrobe || [],
          weatherForecast: weatherData,
          userProfile: userProfile
        }
      });

      if (error) throw error;
      setRecommendations(data.recommendations);

      if (weatherData) {
        setWeather({
          temp: Math.round(weatherData.current.temperature_2m),
          condition: getWeatherCondition(weatherData.current.weathercode)
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать рекомендации",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDayOfWeek = (offset: number): string => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const today = new Date();
    const targetDay = new Date(today);
    targetDay.setDate(today.getDate() + offset);
    return days[targetDay.getDay()];
  };

  const getDate = (offset: number): string => {
    const today = new Date();
    const targetDay = new Date(today);
    targetDay.setDate(today.getDate() + offset);
    return targetDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-display text-sm font-semibold uppercase tracking-wider">Weekly</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mt-2">
              Рекомендации
            </h1>
            <p className="text-muted-foreground font-body mt-2">
              Персональные образы на каждый день недели
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="bg-foreground text-background hover:bg-foreground/90 font-display text-sm font-semibold uppercase tracking-wider px-6"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Обновить
            </Button>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">
              AI рекомендации
            </span>
          </div>
          {weather && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <span>{getWeatherEmoji(weather.condition)}</span>
              <span>{weather.temp}°C, {weather.condition}</span>
            </div>
          )}
          <span className="ml-auto text-xs text-muted-foreground font-body">
            [{recommendations.length || 7} дней]
          </span>
        </div>

        {/* Recommendations Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recommendations.length > 0 ? recommendations : Array.from({ length: 7 }).map((_, index) => ({
              day: getDayOfWeek(index),
              date: getDate(index),
              weather: weather?.condition || "Облачно",
              outfit: [] as string[],
              tip: "Добавьте вещи в гардероб для персональных рекомендаций",
              shoppingLinks: [] as { name: string; url: string; brand: string }[]
            }))).map((rec, index) => (
              <div 
                key={index} 
                className="group bg-card border border-border p-6 hover:border-accent transition-smooth"
              >
                {/* Day header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider">
                      0{index + 1}
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase mt-1">{rec.day}</h3>
                    <p className="text-sm text-muted-foreground font-body">{rec.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl">{getWeatherEmoji(rec.weather)}</span>
                    <p className="text-xs text-muted-foreground font-body mt-1">{rec.weather}</p>
                  </div>
                </div>

                {/* Outfit */}
                <div className="mb-6">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-3">
                    Образ дня
                  </h4>
                  {rec.outfit && rec.outfit.length > 0 ? (
                    <ul className="space-y-2">
                      {rec.outfit.map((item, idx) => (
                        <li key={idx} className="text-sm text-foreground font-body flex items-start gap-2">
                          <span className="text-accent">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground font-body">
                      Нажмите "Обновить" для получения персональных советов
                    </p>
                  )}
                </div>

                {/* Shopping Links */}
                {rec.shoppingLinks && rec.shoppingLinks.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-3">
                      Рекомендуем к покупке
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rec.shoppingLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-secondary text-foreground text-xs font-display uppercase tracking-wider hover:bg-accent hover:text-background transition-smooth"
                        >
                          {link.brand}: {link.name} →
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tip */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground font-body">
                    <span className="font-display uppercase tracking-wider">Совет:</span> {rec.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;