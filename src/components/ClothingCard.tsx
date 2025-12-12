import { useState } from "react";
import { Shirt, Trash2 } from "lucide-react";

interface ClothingCardProps {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  imageUrl?: string;
  onDelete: (id: string) => void;
  index?: number;
}

const ClothingCard = ({ id, name, category, color, season, imageUrl, onDelete, index }: ClothingCardProps) => {
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
        
        {/* Delete button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute top-2 left-2 h-8 w-8 bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
