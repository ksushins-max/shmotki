import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddClothingDialog from "@/components/AddClothingDialog";
import EditClothingDialog from "@/components/EditClothingDialog";
import ClothingCard from "@/components/ClothingCard";
import { supabase } from "@/integrations/supabase/client";
import { useWardrobeItems, ClothingItem } from "@/hooks/useWardrobeItems";

const Wardrobe = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { items, isLoading, deleteItem, refresh } = useWardrobeItems(user?.id);

  const handleItemAdded = () => {
    refresh();
  };

  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleItemUpdated = () => {
    refresh();
  };

  const categories = ["all", ...new Set(items.map(item => item.category))];
  const filteredItems = filter === "all" ? items : items.filter(item => item.category === filter);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="font-display text-3xl font-bold uppercase mb-4">
            Войдите в систему
          </h2>
          <p className="text-muted-foreground font-body">
            Создайте аккаунт или войдите, чтобы начать добавлять вещи в свой гардероб
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-display text-sm font-semibold uppercase tracking-wider">Collection</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mt-2">
              Гардероб
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={refresh}
              variant="outline"
              size="icon"
              className="border-border hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90 font-display text-sm font-semibold uppercase tracking-wider px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">Категория</span>
          <div className="flex gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`text-sm font-display font-medium uppercase tracking-wider transition-smooth ${
                  filter === cat 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "all" ? "Все" : cat}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-muted-foreground font-body">
            [{filteredItems.length}]
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.length === 0 ? (
              <div
                className="aspect-[3/4] border-2 border-dashed border-border hover:border-accent transition-smooth flex items-center justify-center cursor-pointer col-span-2 md:col-span-1"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <div className="text-center p-6">
                  <Plus className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-display uppercase tracking-wider">Добавить вещь</p>
                </div>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <ClothingCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  color={item.color}
                  season={item.season}
                  imageUrl={item.image_url}
                  description={item.description}
                  onDelete={deleteItem}
                  onEdit={handleEditItem}
                  index={index}
                />
              ))
            )}
          </div>
        )}

        <AddClothingDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onItemAdded={handleItemAdded}
        />

        <EditClothingDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={editingItem}
          onItemUpdated={handleItemUpdated}
        />
      </div>
    </div>
  );
};

export default Wardrobe;
