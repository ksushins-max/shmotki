import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shirt, Trash2 } from "lucide-react";

interface ClothingCardProps {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  imageUrl?: string;
  onDelete: (id: string) => void;
}

const ClothingCard = ({ id, name, category, color, season, imageUrl, onDelete }: ClothingCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-smooth group relative">
      <div className="aspect-square bg-muted flex items-center justify-center group-hover:scale-105 transition-smooth overflow-hidden relative">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img 
              src={imageUrl} 
              alt={name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <Shirt className="h-20 w-20 text-muted-foreground" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">{name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{color}</Badge>
              <Badge variant="outline">{season}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ClothingCard;
