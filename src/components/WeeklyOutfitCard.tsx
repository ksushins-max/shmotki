import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Sun } from "lucide-react";

interface WeeklyOutfitCardProps {
  day: string;
}

const WeeklyOutfitCard = ({ day }: WeeklyOutfitCardProps) => {
  return (
    <Card className="p-6 shadow-soft hover:shadow-elegant transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{day}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sun className="h-4 w-4" />
            <span>+18°C, Солнечно</span>
          </div>
        </div>
        <Badge className="gradient-accent">AI рекомендация</Badge>
      </div>
      
      <div className="p-4 bg-muted rounded-lg mb-4">
        <p className="text-sm text-muted-foreground mb-3">Комплект дня:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm">Белая рубашка</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm">Синие джинсы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm">Белые кроссовки</span>
          </div>
        </div>
      </div>

      <div className="p-4 border border-border rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Совет стилиста:</span> Этот образ идеально подходит для теплой погоды. 
          Можно добавить легкий кардиган на вечер.
        </p>
      </div>
    </Card>
  );
};

export default WeeklyOutfitCard;
