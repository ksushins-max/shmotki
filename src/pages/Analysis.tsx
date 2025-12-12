import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Loader2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
interface Recommendation {
  title: string;
  description: string;
  itemsToBuy: string[];
  priority: "high" | "medium" | "low";
  category: string;
}
const Analysis = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wardrobeStats, setWardrobeStats] = useState<any>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchWardrobeAndAnalyze();
  }, []);
  const fetchWardrobeAndAnalyze = async () => {
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для анализа гардероба",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      const {
        data: wardrobe,
        error
      } = await supabase.from("clothing_items").select("*").eq("user_id", user.id);
      if (error) throw error;

      // Calculate wardrobe stats
      const stats = {
        total: wardrobe?.length || 0,
        byCategory: {} as {
          [key: string]: number;
        },
        byColor: {} as {
          [key: string]: number;
        },
        bySeason: {} as {
          [key: string]: number;
        }
      };
      wardrobe?.forEach(item => {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
        stats.byColor[item.color] = (stats.byColor[item.color] || 0) + 1;
        stats.bySeason[item.season] = (stats.bySeason[item.season] || 0) + 1;
      });
      setWardrobeStats(stats);

      // Fetch user profile
      const {
        data: profile
      } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

      // Generate AI recommendations
      const {
        data,
        error: aiError
      } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Проанализируй мой гардероб и дай детальные рекомендации по улучшению. 
          
Мой гардероб: ${JSON.stringify(wardrobe?.map(item => ({
            name: item.name,
            category: item.category,
            color: item.color,
            season: item.season
          })))}

Статистика: ${JSON.stringify(stats)}

Профиль: ${profile ? `${profile.gender || 'не указан'}, возраст ${profile.age || 'не указан'}, род занятий ${profile.occupation || 'не указан'}` : 'не заполнен'}

Ответь в формате JSON массива рекомендаций:
[
  {
    "title": "Название рекомендации",
    "description": "Подробное описание почему это нужно (2-3 предложения)",
    "itemsToBuy": ["Конкретная вещь 1 с описанием цвета и стиля", "Конкретная вещь 2"],
    "priority": "high/medium/low",
    "category": "Категория (Верх/Низ/Обувь/Аксессуары/Верхняя одежда)"
  }
]

Дай 4-6 рекомендаций. Для каждой укажи конкретные вещи для покупки с цветами и стилями.`,
          messages: [],
          isAnalysis: true
        }
      });
      if (aiError) throw aiError;
      try {
        // Extract JSON from response
        const jsonMatch = data.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setRecommendations(parsed);
        }
      } catch (parseError) {
        console.error("Error parsing recommendations:", parseError);
        // Fallback recommendations
        setRecommendations([{
          title: "Добавьте базовые вещи",
          description: "Базовый гардероб должен включать универсальные вещи, которые легко сочетаются между собой.",
          itemsToBuy: ["Белая хлопковая футболка", "Черные классические брюки", "Джинсы прямого кроя синего цвета"],
          priority: "high",
          category: "Базовый гардероб"
        }]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить анализ гардероба",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-muted";
    }
  };
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Важно";
      case "medium":
        return "Рекомендуется";
      case "low":
        return "По желанию";
      default:
        return priority;
    }
  };
  return <div className="min-h-screen gradient-soft">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-accent">
              Анализ гардероба
            </h1>
            <p className="text-muted-foreground mt-2">
              AI анализ вашего стиля и рекомендации по улучшению
            </p>
          </div>
          <Button onClick={fetchWardrobeAndAnalyze} disabled={isLoading} className="gradient-accent shadow-elegant hover:scale-105 transition-smooth" size="lg">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Обновить анализ
          </Button>
        </div>

        {wardrobeStats && <Card className="p-6 mb-8 shadow-soft">
            <h3 className="font-semibold mb-4">Статистика гардероба</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{wardrobeStats.total}</p>
                <p className="text-sm text-muted-foreground">Всего вещей</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{Object.keys(wardrobeStats.byCategory).length}</p>
                <p className="text-sm text-muted-foreground">Категорий</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{Object.keys(wardrobeStats.byColor).length}</p>
                <p className="text-sm text-muted-foreground">Цветов</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{Object.keys(wardrobeStats.bySeason).length}</p>
                <p className="text-sm text-muted-foreground">Сезонов</p>
              </div>
            </div>
          </Card>}

        <Card className="p-8 shadow-soft">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Персональные рекомендации</h2>
              <p className="text-muted-foreground">
                AI советы для улучшения вашего гардероба с конкретными покупками
              </p>
            </div>
          </div>

          {isLoading ? <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div> : <div className="space-y-6">
              {recommendations.map((rec, index) => <div key={index} className="p-6 border border-border rounded-xl hover:border-primary transition-smooth">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-lg">{rec.title}</h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {getPriorityLabel(rec.priority)}
                      </Badge>
                      <Badge variant="secondary">{rec.category}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">
                    {rec.description}
                  </p>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Что купить:</span>
                    </div>
                    <ul className="space-y-2">
                      {rec.itemsToBuy.map((item, idx) => <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>
                </div>)}

              {recommendations.length === 0 && !isLoading && <div className="text-center py-12 text-muted-foreground">
                  <p>Добавьте вещи в гардероб для получения персональных рекомендаций</p>
                </div>}
            </div>}
        </Card>
      </div>
    </div>;
};
export default Analysis;