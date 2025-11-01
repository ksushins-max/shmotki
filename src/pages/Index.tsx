import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shirt, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

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

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-8 shadow-soft hover:shadow-elegant transition-smooth">
            <div className="h-12 w-12 rounded-xl gradient-warm flex items-center justify-center mb-4">
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
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Анализ стиля</h3>
            <p className="text-muted-foreground">
              AI определит пробелы в гардеробе и подскажет, что добавить для идеального стиля
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
