import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shirt, Sparkles, TrendingUp, ArrowRight, MessageCircle } from "lucide-react";
import wardrobeHero from "@/assets/wardrobe-hero.jpg";
import styleAnalysis from "@/assets/style-analysis.jpg";

const Index = () => {
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
          <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
              <Shirt className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Оцифруйте гардероб</h3>
            <p className="text-muted-foreground">
              Добавьте свои вещи в приложение и получите полный контроль над вашим гардеробом
            </p>
          </Card>

          <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI рекомендации</h3>
            <p className="text-muted-foreground">
              Получайте персональные образы на каждый день с учетом погоды и актуальных трендов
            </p>
          </Card>

          <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Чат с AI</h3>
            <p className="text-muted-foreground">
              Общайтесь с AI ассистентом и получайте индивидуальные советы по стилю
            </p>
          </Card>
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
