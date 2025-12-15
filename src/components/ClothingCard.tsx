import { useState } from "react";
import { Shirt, Trash2, Pencil } from "lucide-react";
import { ClothingItem } from "@/hooks/useWardrobeItems";

interface ClothingCardProps {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  imageUrl?: string;
  description?: string;
  onDelete: (id: string) => void;
  onEdit?: (item: ClothingItem) => void;
  index?: number;
}

const ClothingCard = ({ id, name, category, color, season, imageUrl, description, onDelete, onEdit, index }: ClothingCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group relative">
      {/* Number indicator */}
      {typeof index === 'number' && (
        <span className="absolute top-2 right-2 z-10 text-accent font-display text-sm font-semibold">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      
      {/* Image */}
      <div className="aspect-[3/4] bg-secondary flex items-center justify-center overflow-hidden relative">
        {imageUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-secondary animate-pulse" />
            )}
            <img 
              src={imageUrl} 
              alt={name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <Shirt className="h-16 w-16 text-muted-foreground" />
        )}
        
        {/* Action buttons on hover */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit({ id, name, category, color, season, image_url: imageUrl, description });
              }}
              className="h-8 w-8 bg-background/90 flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="h-8 w-8 bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="pt-3">
        <h3 className="font-display text-sm font-medium lowercase">{name}</h3>
        <p className="text-xs text-muted-foreground font-body mt-0.5">{category}</p>
      </div>
    </div>
  );
};

export default ClothingCard;
