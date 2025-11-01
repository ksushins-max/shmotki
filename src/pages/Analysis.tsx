import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Analysis = () => {
  return (
    <div className="min-h-screen gradient-soft">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Анализ гардероба
            </h1>
            <p className="text-muted-foreground mt-2">
              AI анализ вашего стиля и рекомендации по улучшению
            </p>
          </div>
          <Button
            className="gradient-accent shadow-elegant hover:scale-105 transition-smooth"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Обновить анализ
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Сильные стороны</h3>
                <p className="text-sm text-muted-foreground">Что у вас хорошо</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Отличная база из базовых вещей</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Сбалансированная цветовая палитра</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Возможности для роста</h3>
                <p className="text-sm text-muted-foreground">Что можно улучшить</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Недостаточно акцентных вещей</p>
                <Badge variant="secondary">Рекомендация</Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">Мало вещей с принтами и текстурами</p>
                <Badge variant="secondary">Рекомендация</Badge>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 shadow-soft">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Персональные рекомендации</h2>
              <p className="text-muted-foreground">
                AI советы для улучшения вашего гардероба
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 border border-border rounded-xl hover:border-primary transition-smooth">
              <h3 className="font-semibold mb-2">Добавьте структурированные вещи</h3>
              <p className="text-sm text-muted-foreground mb-3">
                У вас много однотонных футболок, попробуйте добавить клетчатую рубашку или полосатый джемпер для разнообразия
              </p>
              <div className="flex gap-2">
                <Badge>Рубашки</Badge>
                <Badge>Принты</Badge>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl hover:border-primary transition-smooth">
              <h3 className="font-semibold mb-2">Акцентные аксессуары</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Добавьте яркий шарф или сумку для создания запоминающихся образов
              </p>
              <div className="flex gap-2">
                <Badge>Аксессуары</Badge>
                <Badge>Акценты</Badge>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl hover:border-primary transition-smooth">
              <h3 className="font-semibold mb-2">Разнообразие силуэтов</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Попробуйте добавить оверсайз вещи или более приталенные варианты для интересных сочетаний
              </p>
              <div className="flex gap-2">
                <Badge>Силуэты</Badge>
                <Badge>Стиль</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
