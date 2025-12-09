import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shirt, Sparkles, TrendingUp, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import wardrobeHero from "@/assets/wardrobe-hero.jpg";
import styleAnalysis from "@/assets/style-analysis.jpg";

const fashionTrends = [
  { title: "Оверсайз силуэты", description: "Свободные формы остаются в тренде" },
  { title: "Нейтральные тона", description: "Бежевый, серый и белый — база сезона" },
  { title: "Многослойность", description: "Комбинируйте разные текстуры" },
  { title: "Минимализм", description: "Чистые линии и простые формы" },
];

const Index = () => {
  const [trends, setTrends] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: "Кратко опиши 4-5 актуальных модных тренда на текущий сезон. Ответ дай в формате списка, каждый тренд одним предложением.",
          wardrobeItems: [],
          weatherInfo: null,
          userProfile: null
        }
      });

      if (error) throw error;
      setTrends(data.response);
    } catch (error) {
      console.error("Error fetching trends:", error);
      setTrends(null);
    } finally {
      setLoadingTrends(false);
    }
  };
  return (
    <div className="min-h-screen gradient-soft">
      <div className="container px-4 py-16 max-w-7xl mx-auto">
        <section className="text-center mb-16 pt-8">
          <div className="inline-block mb-6">
            <div className="h-20 w-20 mx-auto rounded-2xl gradient-accent flex items-center justify-center shadow-elegant">
              <Shirt className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Shmotki
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Умный стилист с AI, который создает идеальные образы на основе вашего гардероба, погоды и трендов
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/wardrobe">
              <Button size="lg" className="gradient-accent shadow-elegant hover:scale-105 transition-smooth">
                <Shirt className="mr-2 h-5 w-5" />
                Мой гардероб
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button size="lg" variant="outline" className="hover:border-primary transition-smooth">
                <Sparkles className="mr-2 h-5 w-5" />
                Получить рекомендации
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <Card className="p-8 shadow-elegant">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Модные тренды сезона</h2>
            </div>
            {loadingTrends ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : trends ? (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {trends}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {fashionTrends.map((trend, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-1">{trend.title}</h4>
                    <p className="text-sm text-muted-foreground">{trend.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={wardrobeHero} alt="Современный гардероб" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Ваш цифровой гардероб</h3>
                <p className="text-white/90">Все ваши вещи в одном месте</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={styleAnalysis} alt="Анализ стиля" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">AI стилист</h3>
                <p className="text-white/90">Персональные рекомендации каждый день</p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Link to="/wardrobe">
            <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth cursor-pointer hover:scale-105 flex flex-col min-h-[240px]">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Оцифруйте гардероб</h3>
              <p className="text-muted-foreground flex-1">
                Добавьте свои вещи в приложение и получите полный контроль над вашим гардеробом
              </p>
            </Card>
          </Link>

          <Link to="/recommendations">
            <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth cursor-pointer hover:scale-105 flex flex-col min-h-[240px]">
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI рекомендации</h3>
              <p className="text-muted-foreground flex-1">
                Получайте персональные образы на каждый день с учетом погоды и актуальных трендов
              </p>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth cursor-pointer hover:scale-105 flex flex-col min-h-[240px]">
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Чат с AI</h3>
              <p className="text-muted-foreground flex-1">
                Общайтесь с AI ассистентом и получайте индивидуальные советы по стилю
              </p>
            </Card>
          </Link>
        </section>

        <section className="text-center">
          <Card className="p-12 shadow-elegant gradient-soft border-2">
            <h2 className="text-3xl font-bold mb-4">Начните прямо сейчас</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Добавьте первые вещи в гардероб и получите AI рекомендации на всю неделю
            </p>
            <Link to="/wardrobe">
              <Button size="lg" className="gradient-accent shadow-elegant hover:scale-105 transition-smooth">
                Создать гардероб
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
