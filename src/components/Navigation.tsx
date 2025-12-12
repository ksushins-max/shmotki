import { Link, useLocation } from "react-router-dom";
import { Home, Shirt, Sparkles, TrendingUp, MessageCircle, LogOut, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import AuthDialog from "./AuthDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Вы вышли из системы" });
  };

  const links = [
    { to: "/", icon: Home, label: "Главная" },
    { to: "/wardrobe", icon: Shirt, label: "Гардероб" },
    { to: "/recommendations", icon: Sparkles, label: "Рекомендации" },
    { to: "/analysis", icon: TrendingUp, label: "Анализ" },
    { to: "/chat", icon: MessageCircle, label: "Чат с AI" },
    { to: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">SHMOTKI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{link.label}</span>
                  </Link>
                );
              })}
              
              {user ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Выйти</span>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setAuthDialogOpen(true)} className="ml-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Войти</span>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {links.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-smooth"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Выйти</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthDialogOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-smooth"
                  >
                    <User className="h-5 w-5" />
                    <span>Войти</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};

export default Navigation;