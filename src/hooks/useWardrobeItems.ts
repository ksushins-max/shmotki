import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  description?: string;
  image_url?: string;
}

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

const fetchClothingItems = async (userId: string): Promise<ClothingItem[]> => {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Auto-populate with sample data if empty
  if (!data || data.length === 0) {
    const itemsWithUserId = sampleItems.map(item => ({ ...item, user_id: userId }));
    const { data: newData, error: insertError } = await supabase
      .from("clothing_items")
      .insert(itemsWithUserId)
      .select();
    
    if (insertError) throw insertError;
    return newData || [];
  }
  
  return data;
};

export const useWardrobeItems = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wardrobe-items', userId],
    queryFn: () => fetchClothingItems(userId!),
    enabled: !!userId,
    staleTime: Infinity, // Don't auto-refetch, only on demand
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clothing_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Удалено",
        description: "Вещь успешно удалена из гардероба",
      });
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items', userId] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить вещь",
        variant: "destructive",
      });
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['wardrobe-items', userId] });
  };

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    deleteItem: deleteMutation.mutate,
    refresh,
  };
};
