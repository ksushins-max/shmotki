import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    gender: "",
    age: "",
    occupation: "",
    favorite_brands: [] as string[],
  });

const popularBrands = [
  "Zara", "H&M", "Uniqlo", "Massimo Dutti", "COS", "Mango", "Reserved", 
  "12 Storeez", "Befree", "Love Republic", "Sela", "Gloria Jeans",
  "Nike", "Adidas", "New Balance", "Puma", "Reebok", "Converse",
  "Levi's", "Tommy Hilfiger", "Calvin Klein", "Lacoste", "Guess",
  "Pull&Bear", "Bershka", "Stradivarius", "ASOS", "Monki"
];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfileId(data.id);
        setProfile({
          gender: data.gender || "",
          age: data.age?.toString() || "",
          occupation: data.occupation || "",
          favorite_brands: data.favorite_brands || [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          gender: profile.gender || null,
          age: profile.age ? parseInt(profile.age) : null,
          occupation: profile.occupation || null,
          favorite_brands: profile.favorite_brands,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Профиль сохранен",
        description: "Ваши данные успешно обновлены",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Профиль пользователя</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Пол</Label>
              <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Выберите пол" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Мужской</SelectItem>
                  <SelectItem value="female">Женский</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Введите ваш возраст"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Сфера деятельности</Label>
              <Input
                id="occupation"
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                placeholder="Например: IT, Образование, Медицина"
              />
            </div>

            <div className="space-y-3">
              <Label>Любимые бренды</Label>
              {profile.favorite_brands.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.favorite_brands.map((brand) => (
                    <Badge 
                      key={brand} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setProfile({
                        ...profile,
                        favorite_brands: profile.favorite_brands.filter(b => b !== brand)
                      })}
                    >
                      {brand} ✕
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {popularBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={profile.favorite_brands.includes(brand)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProfile({ ...profile, favorite_brands: [...profile.favorite_brands, brand] });
                        } else {
                          setProfile({ ...profile, favorite_brands: profile.favorite_brands.filter(b => b !== brand) });
                        }
                      }}
                    />
                    <label htmlFor={brand} className="text-sm cursor-pointer">{brand}</label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
