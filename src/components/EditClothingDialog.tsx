import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X } from "lucide-react";
import { ClothingItem } from "@/hooks/useWardrobeItems";

interface EditClothingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ClothingItem | null;
  onItemUpdated?: () => void;
}

const EditClothingDialog = ({ open, onOpenChange, item, onItemUpdated }: EditClothingDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setColor(item.color);
      setSeason(item.season);
      setDescription(item.description || "");
      setImagePreview(item.image_url || null);
      setImageFile(null);
    }
  }, [item]);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    let imageUrl = item.image_url;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить изображение",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    } else if (!imagePreview) {
      imageUrl = null;
    }

    const { error } = await supabase
      .from("clothing_items")
      .update({
        name,
        category,
        color,
        season,
        description,
        image_url: imageUrl,
      })
      .eq("id", item.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить вещь",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно!",
        description: "Вещь обновлена",
      });
      onOpenChange(false);
      onItemUpdated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tight">Редактировать</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-xs uppercase tracking-wider font-display">Название</Label>
            <Input
              id="edit-name"
              placeholder="Например: Белая рубашка"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-xs uppercase tracking-wider font-display">Категория</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="border-border">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tops">Верх</SelectItem>
                <SelectItem value="bottoms">Низ</SelectItem>
                <SelectItem value="dresses">Платья</SelectItem>
                <SelectItem value="outerwear">Верхняя одежда</SelectItem>
                <SelectItem value="shoes">Обувь</SelectItem>
                <SelectItem value="accessories">Аксессуары</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color" className="text-xs uppercase tracking-wider font-display">Цвет</Label>
            <Input
              id="edit-color"
              placeholder="Например: Белый, Черный"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              className="border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-season" className="text-xs uppercase tracking-wider font-display">Сезон</Label>
            <Select value={season} onValueChange={setSeason} required>
              <SelectTrigger className="border-border">
                <SelectValue placeholder="Выберите сезон" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всесезон</SelectItem>
                <SelectItem value="spring">Весна</SelectItem>
                <SelectItem value="summer">Лето</SelectItem>
                <SelectItem value="autumn">Осень</SelectItem>
                <SelectItem value="winter">Зима</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-xs uppercase tracking-wider font-display">Описание (опционально)</Label>
            <Textarea
              id="edit-description"
              placeholder="Дополнительные детали..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border-border"
            />
          </div>

          {/* Image upload section */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-display">Фото вещи</Label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-foreground text-background hover:bg-foreground/90 transition-smooth"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border hover:border-accent transition-smooth"
                >
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Камера</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border hover:border-accent transition-smooth"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Файл</span>
                </button>
              </div>
            )}
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border font-display uppercase tracking-wider text-xs"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 font-display uppercase tracking-wider text-xs"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClothingDialog;
