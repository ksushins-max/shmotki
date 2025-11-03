import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ClothingItem {
  name: string;
  category: string;
  color: string;
  season: string;
}

interface WeatherData {
  temp: number;
  condition: string;
}

interface DayRecommendation {
  day: string;
  date: string;
  weather: string;
  outfit: string[];
  tip: string;
}

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<DayRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWeather();
    fetchUserProfile();
    generateRecommendations();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchWeather = async () => {
    try {
      // Санкт-Петербург, Россия
      const latitude = 59.9343;
      const longitude = 30.3351;
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Moscow&forecast_days=7`
      );
      const data = await response.json();
      
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: getWeatherCondition(data.current.weathercode)
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather({
        temp: 15,
        condition: "Переменная облачность"
      });
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: "Ясно", 1: "Ясно", 2: "Облачно", 3: "Облачно",
      45: "Туман", 51: "Морось", 61: "Дождь", 71: "Снег", 95: "Гроза"
    };
    return conditions[code] || "Переменная облачность";
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для получения рекомендаций",
          variant: "destructive",
        });
        return;
      }

      const { data: wardrobe } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", user.id);

      const { data, error } = await supabase.functions.invoke("generate-weekly-recommendations", {
        body: { 
          wardrobe: wardrobe || [],
          weather: weather || { temp: 15, condition: "Переменная облачность" },
          userProfile: userProfile
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать рекомендации",
        variant: "destructive",
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
    <div className="min-h-screen gradient-soft">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Рекомендации
            </h1>
            <p className="text-muted-foreground mt-2">
              Персональные образы на каждый день недели
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isLoading}
            className="gradient-accent shadow-elegant hover:scale-105 transition-smooth"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Обновить рекомендации
          </Button>
        </div>

        <Card className="p-8 mb-8 shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">На основе вашего гардероба</h2>
              <p className="text-muted-foreground">
                Рекомендации учитывают погоду и модные тренды
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Card key={index} className="p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{rec.day}</h3>
                    <p className="text-sm text-muted-foreground">{rec.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{rec.weather}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3">
                    AI рекомендация
                  </div>
                  <h4 className="font-semibold mb-2">Образ дня:</h4>
                  <ul className="space-y-1">
                    {rec.outfit.map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">💡 Совет стилиста:</p>
                  <p className="text-sm text-muted-foreground">{rec.tip}</p>
                </div>
              </Card>
            ))
          ) : (
            Array.from({ length: 7 }).map((_, index) => (
              <Card key={index} className="p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{getDayOfWeek(index)}</h3>
                    <p className="text-sm text-muted-foreground">{getDate(index)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">☁️ {weather?.temp || 20}°C</p>
                    <p className="text-sm text-muted-foreground">{weather?.condition || "Облачно"}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3">
                    AI рекомендация
                  </div>
                  <h4 className="font-semibold mb-2">Образ дня:</h4>
                  <p className="text-muted-foreground">
                    Нажмите "Обновить рекомендации" для получения персональных советов
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">💡 Совет стилиста:</p>
                  <p className="text-sm text-muted-foreground">
                    Добавьте вещи в гардероб для персональных рекомендаций
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
