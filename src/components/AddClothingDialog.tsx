import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddClothingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded?: () => void;
}

const AddClothingDialog = ({ open, onOpenChange, onItemAdded }: AddClothingDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const { error } = await supabase.from("clothing_items").insert([{
      name,
      category,
      color,
      season,
      description,
      user_id: user.id,
    }]);

    setLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить вещь",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно!",
        description: "Вещь добавлена в гардероб",
      });
      setName("");
      setCategory("");
      setColor("");
      setSeason("");
      setDescription("");
      onOpenChange(false);
      onItemAdded?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Добавить вещь</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              placeholder="Например: Белая рубашка"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
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
            <Label htmlFor="color">Цвет</Label>
            <Input
              id="color"
              placeholder="Например: Белый, Черный"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Сезон</Label>
            <Select value={season} onValueChange={setSeason} required>
              <SelectTrigger>
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
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              placeholder="Дополнительные детали..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-accent"
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClothingDialog;
