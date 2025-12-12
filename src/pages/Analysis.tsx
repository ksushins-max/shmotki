import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Loader2, ShoppingBag, RefreshCw } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchWardrobeAndAnalyze();
  }, []);

  const fetchWardrobeAndAnalyze = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему для анализа гардероба",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const { data: wardrobe, error } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;

      const stats = {
        total: wardrobe?.length || 0,
        byCategory: {} as { [key: string]: number },
        byColor: {} as { [key: string]: number },
        bySeason: {} as { [key: string]: number }
      };

      wardrobe?.forEach(item => {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
        stats.byColor[item.color] = (stats.byColor[item.color] || 0) + 1;
        stats.bySeason[item.season] = (stats.bySeason[item.season] || 0) + 1;
      });

      setWardrobeStats(stats);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data, error: aiError } = await supabase.functions.invoke("ai-chat", {
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
        const jsonMatch = data.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setRecommendations(parsed);
        }
      } catch (parseError) {
        console.error("Error parsing recommendations:", parseError);
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

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive bg-destructive/5";
      case "medium":
        return "border-l-accent bg-accent/5";
      case "low":
        return "border-l-muted-foreground bg-muted/30";
      default:
        return "border-l-border";
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-display text-sm font-semibold uppercase tracking-wider">Analysis</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mt-2">
              Анализ
            </h1>
            <p className="text-muted-foreground font-body mt-2">
              AI анализ вашего стиля и рекомендации по улучшению
            </p>
          </div>
          
          <Button
            onClick={fetchWardrobeAndAnalyze}
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

        {/* Stats */}
        {wardrobeStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border border-border p-6">
              <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider uppercase">Всего</span>
              <p className="font-display text-4xl font-bold mt-2">{wardrobeStats.total}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">вещей</p>
            </div>
            <div className="bg-card border border-border p-6">
              <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider uppercase">Категорий</span>
              <p className="font-display text-4xl font-bold mt-2">{Object.keys(wardrobeStats.byCategory).length}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">типов одежды</p>
            </div>
            <div className="bg-card border border-border p-6">
              <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider uppercase">Цветов</span>
              <p className="font-display text-4xl font-bold mt-2">{Object.keys(wardrobeStats.byColor).length}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">в палитре</p>
            </div>
            <div className="bg-card border border-border p-6">
              <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider uppercase">Сезонов</span>
              <p className="font-display text-4xl font-bold mt-2">{Object.keys(wardrobeStats.bySeason).length}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">покрыто</p>
            </div>
          </div>
        )}

        {/* Info bar */}
        <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">
              Персональные рекомендации
            </span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground font-body">
            [{recommendations.length} советов]
          </span>
        </div>

        {/* Recommendations */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[2/1] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`border border-border border-l-4 p-6 transition-smooth hover:border-accent ${getPriorityStyles(rec.priority)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-display font-semibold tracking-wider">
                      0{index + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold uppercase mt-1">{rec.title}</h3>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className="text-[10px] px-2 py-1 bg-secondary text-foreground font-display uppercase tracking-wider">
                      {getPriorityLabel(rec.priority)}
                    </span>
                    <span className="text-[10px] px-2 py-1 bg-foreground text-background font-display uppercase tracking-wider">
                      {rec.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-body mb-4">
                  {rec.description}
                </p>

                {/* Shopping list */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="h-4 w-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">Что купить</span>
                  </div>
                  <ul className="space-y-2">
                    {rec.itemsToBuy.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground font-body flex items-start gap-2">
                        <span className="text-accent">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && !isLoading && (
              <div className="col-span-2 text-center py-16 border border-dashed border-border">
                <Sparkles className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground font-body">
                  Добавьте вещи в гардероб для получения персональных рекомендаций
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;