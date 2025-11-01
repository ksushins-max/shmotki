import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import WeeklyOutfitCard from "@/components/WeeklyOutfitCard";

const Recommendations = () => {
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
            className="gradient-accent shadow-elegant hover:scale-105 transition-smooth"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
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
          {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day, index) => (
            <WeeklyOutfitCard key={day} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
