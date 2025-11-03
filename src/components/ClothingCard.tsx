import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shirt } from "lucide-react";

interface ClothingCardProps {
  name: string;
  category: string;
  color: string;
  season: string;
  imageUrl?: string;
}

const ClothingCard = ({ name, category, color, season, imageUrl }: ClothingCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-smooth cursor-pointer group">
      <div className="aspect-square bg-muted flex items-center justify-center group-hover:scale-105 transition-smooth overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Shirt className="h-20 w-20 text-muted-foreground" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{name}</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{color}</Badge>
          <Badge variant="outline">{season}</Badge>
        </div>
      </div>
    </Card>
  );
};

export default ClothingCard;
