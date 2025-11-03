import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AddClothingDialog from "@/components/AddClothingDialog";
import ClothingCard from "@/components/ClothingCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  description?: string;
  image_url?: string;
}

const Wardrobe = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClothingItems();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClothingItems();
      } else {
        setClothingItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClothingItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить вещи из гардероба",
        variant: "destructive",
      });
    } else {
      setClothingItems(data || []);
      
      // Auto-populate with sample data if wardrobe is empty
      if (data && data.length === 0) {
        await addSampleData(user.id);
      }
    }
  };

  const addSampleData = async (userId: string) => {
    const sampleItems = [
      { name: 'Белая базовая футболка', category: 'tops', color: 'Белый', season: 'summer', description: 'Классическая белая футболка из хлопка' },
      { name: 'Черная футболка', category: 'tops', color: 'Черный', season: 'all', description: 'Универсальная черная футболка' },
      { name: 'Синие джинсы', category: 'bottoms', color: 'Синий', season: 'all', description: 'Классические прямые джинсы' },
      { name: 'Черные брюки', category: 'bottoms', color: 'Черный', season: 'all', description: 'Строгие черные брюки' },
      { name: 'Серая толстовка', category: 'tops', color: 'Серый', season: 'autumn', description: 'Теплая толстовка с капюшоном' },
      { name: 'Клетчатая рубашка', category: 'tops', color: 'Синий', season: 'spring', description: 'Рубашка в синюю клетку' },
      { name: 'Черная кожаная куртка', category: 'outerwear', color: 'Черный', season: 'autumn', description: 'Стильная кожаная куртка' },
      { name: 'Бежевый тренч', category: 'outerwear', color: 'Бежевый', season: 'spring', description: 'Классический тренч' },
      { name: 'Белые кроссовки', category: 'shoes', color: 'Белый', season: 'all', description: 'Универсальные белые кроссовки' },
      { name: 'Черные ботинки', category: 'shoes', color: 'Черный', season: 'autumn', description: 'Классические черные ботинки' },
      { name: 'Синее платье', category: 'dresses', color: 'Синий', season: 'summer', description: 'Легкое летнее платье' },
      { name: 'Кожаный ремень', category: 'accessories', color: 'Коричневый', season: 'all', description: 'Классический кожаный ремень' },
      { name: 'Зимняя куртка', category: 'outerwear', color: 'Черный', season: 'winter', description: 'Теплая зимняя куртка' },
      { name: 'Свитер', category: 'tops', color: 'Бежевый', season: 'winter', description: 'Теплый вязаный свитер' },
    ];

    const itemsWithUserId = sampleItems.map(item => ({ ...item, user_id: userId }));
    
    const { error } = await supabase.from("clothing_items").insert(itemsWithUserId);
    
    if (error) {
      console.error("Error adding sample data:", error);
    } else {
      toast({
        title: "Гардероб заполнен!",
        description: "Добавлены тестовые вещи для демонстрации функционала",
      });
      
      const { data } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      setClothingItems(data || []);
    }
  };

  const handleItemAdded = () => {
    fetchClothingItems();
  };

  if (!user) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 shadow-elegant">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Войдите, чтобы управлять гардеробом
          </h2>
          <p className="text-muted-foreground text-center">
            Создайте аккаунт или войдите, чтобы начать добавлять вещи в свой гардероб
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Мой гардероб
            </h1>
            <p className="text-muted-foreground mt-2">
              Управляйте своими вещами и создавайте коллекции
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="gradient-accent shadow-elegant hover:scale-105 transition-smooth"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Добавить вещь
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothingItems.length === 0 ? (
            <Card
              className="border-2 border-dashed border-border hover:border-primary transition-smooth flex items-center justify-center min-h-[280px] cursor-pointer"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <div className="text-center p-8">
                <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Добавьте первую вещь</p>
              </div>
            </Card>
          ) : (
            clothingItems.map((item) => (
              <ClothingCard
                key={item.id}
                name={item.name}
                category={item.category}
                color={item.color}
                season={item.season}
                imageUrl={item.image_url}
              />
            ))
          )}
        </div>

        <AddClothingDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onItemAdded={handleItemAdded}
        />
      </div>
    </div>
  );
};

export default Wardrobe;
