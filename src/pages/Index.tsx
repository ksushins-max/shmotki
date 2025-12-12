import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import featureWardrobe from "@/assets/feature-wardrobe.jpg";
import featureAiStylist from "@/assets/feature-ai-stylist.jpg";
import featureAnalysis from "@/assets/feature-analysis.jpg";
import featureChat from "@/assets/feature-chat.jpg";

const fashionTrends = [
  { title: "Оверсайз силуэты", description: "Свободные формы остаются в тренде" },
  { title: "Нейтральные тона", description: "Бежевый, серый и белый — база сезона" },
  { title: "Многослойность", description: "Комбинируйте разные текстуры" },
  { title: "Минимализм", description: "Чистые линии и простые формы" },
];

// Sample clothing items for the typing animation
const clothingItems = [
  { id: 1, emoji: "👕", label: "футболка" },
  { id: 2, emoji: "👖", label: "джинсы" },
  { id: 3, emoji: "👟", label: "кроссовки" },
];

const Index = () => {
  const [trends, setTrends] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  // Typing animation effect
  useEffect(() => {
    const typeSpeed = 600;
    const deleteSpeed = 400;
    const pauseBeforeDelete = 2000;
    const pauseBeforeType = 1000;

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (visibleItems.length < clothingItems.length) {
        timeout = setTimeout(() => {
          setVisibleItems(prev => [...prev, clothingItems[prev.length].id]);
        }, typeSpeed);
      } else {
        // All items typed, pause then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBeforeDelete);
      }
    } else {
      // Deleting phase
      if (visibleItems.length > 0) {
        timeout = setTimeout(() => {
          setVisibleItems(prev => prev.slice(0, -1));
        }, deleteSpeed);
      } else {
        // All items deleted, pause then start typing again
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, pauseBeforeType);
      }
    }

    return () => clearTimeout(timeout);
  }, [visibleItems, isDeleting]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: "Кратко опиши 4-5 актуальных модных тренда на текущий сезон. Ответ дай в формате списка, каждый тренд одним предложением.",
          wardrobeItems: [],
          weatherInfo: null,
          userProfile: null
        }
      });

      if (error) throw error;
      setTrends(data.response);
    } catch (error) {
      console.error("Error fetching trends:", error);
      setTrends(null);
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Typing Animation */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body font-medium">
                  AI-Powered Fashion
                </p>
                <h1 className="font-display text-editorial-xl font-bold uppercase tracking-tight">
                  SHMOTKI
                </h1>
                <p className="text-base text-muted-foreground font-body font-normal max-w-md leading-relaxed">
                  Персональный AI-стилист, который создает идеальные образы на основе вашего гардероба, погоды и актуальных трендов
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/wardrobe">
                  <button className="group w-full sm:w-auto bg-foreground text-background px-8 py-4 font-display text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-smooth flex items-center justify-center gap-3">
                    Мой гардероб
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </button>
                </Link>
                <Link to="/recommendations">
                  <button className="group w-full sm:w-auto border-2 border-foreground bg-transparent px-8 py-4 font-display text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-smooth flex items-center justify-center gap-3">
                    Рекомендации
                  </button>
                </Link>
              </div>
            </div>

            {/* Typing Animation Section */}
            <div className="relative flex items-center justify-center min-h-[400px]">
              <div className="relative w-full max-w-md">
                {/* Background surface */}
                <div className="absolute inset-0 bg-secondary/30 -rotate-1" />
                <div className="absolute inset-0 bg-secondary/50 rotate-1" />
                
                {/* Main container */}
                <div className="relative bg-card border border-border p-8 shadow-lg">
                  <div className="flex items-center justify-center gap-4 min-h-[200px]">
                    {/* Clothing items that "type" in */}
                    {clothingItems.map((item, index) => {
                      const isVisible = visibleItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`
                            flex flex-col items-center gap-2 transition-all duration-300 ease-out
                            ${isVisible 
                              ? "opacity-100 scale-100 translate-y-0" 
                              : "opacity-0 scale-75 translate-y-4"
                            }
                          `}
                        >
                          <div className="w-20 h-24 bg-secondary border border-border flex items-center justify-center shadow-sm">
                            <span className="text-4xl">{item.emoji}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Typing cursor */}
                    <div 
                      className={`
                        w-0.5 h-24 bg-accent transition-opacity duration-100
                        ${showCursor ? "opacity-100" : "opacity-0"}
                      `}
                    />
                  </div>
                  
                  {/* Hint text */}
                  <p className="text-center text-xs text-muted-foreground font-body mt-6">
                    Добавляйте вещи в гардероб
                  </p>
                </div>
                
                {/* Season badge */}
                <div className="absolute -bottom-4 -left-4 bg-foreground text-background p-4 shadow-lg">
                  <p className="font-display text-xs uppercase tracking-widest opacity-70">Season</p>
                  <p className="font-display text-2xl font-bold uppercase">24/25</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-3 bg-foreground text-background overflow-hidden">
        <div className="flex whitespace-nowrap marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-xs uppercase tracking-[0.2em] font-display font-semibold">
              AI Styling • Trend Analysis • Personal Wardrobe • Weather Based • Daily Outfits •
            </span>
          ))}
        </div>
      </section>

      {/* Fashion Trends */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-accent font-display text-sm font-semibold uppercase tracking-wider">Trends</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              Тренды
            </h2>
          </div>
          
          {loadingTrends ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : trends ? (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 text-base text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                {trends}
              </div>
              <div className="text-sm text-muted-foreground font-body">
                <p className="mb-4">Каждая коллекция — это не просто одежда, а история, вдохновленная культурой, искусством и современностью.</p>
                <Link to="/analysis" className="inline-flex items-center gap-2 text-foreground font-display font-semibold uppercase text-xs tracking-wider hover:gap-3 transition-all">
                  Смотреть <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fashionTrends.map((trend, index) => (
                <div key={index} className="group p-6 bg-card border border-border hover:bg-foreground hover:text-background transition-smooth">
                  <span className="text-[10px] text-muted-foreground group-hover:text-background/60 font-display font-semibold tracking-wider">0{index + 1}</span>
                  <h4 className="font-display text-lg font-bold uppercase mt-3 mb-2">{trend.title}</h4>
                  <p className="text-xs text-muted-foreground font-body group-hover:text-background/70 transition-smooth">{trend.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Wardrobe */}
            <Link to="/wardrobe" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                <img 
                  src={featureWardrobe} 
                  alt="Гардероб" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/10 transition-smooth" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                  <span className="text-[10px] uppercase tracking-wider opacity-70 font-display">01</span>
                  <h3 className="font-display text-xl font-bold uppercase">Гардероб</h3>
                </div>
              </div>
            </Link>

            {/* AI Recommendations */}
            <Link to="/recommendations" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                <img 
                  src={featureAiStylist} 
                  alt="AI рекомендации" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/10 transition-smooth" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                  <span className="text-[10px] uppercase tracking-wider opacity-70 font-display">02</span>
                  <h3 className="font-display text-xl font-bold uppercase">AI Стилист</h3>
                </div>
              </div>
            </Link>

            {/* Analysis */}
            <Link to="/analysis" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                <img 
                  src={featureAnalysis} 
                  alt="Анализ гардероба" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/10 transition-smooth" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                  <span className="text-[10px] uppercase tracking-wider opacity-70 font-display">03</span>
                  <h3 className="font-display text-xl font-bold uppercase">Анализ</h3>
                </div>
              </div>
            </Link>

            {/* Chat */}
            <Link to="/chat" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                <img 
                  src={featureChat} 
                  alt="AI чат" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/10 transition-smooth" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                  <span className="text-[10px] uppercase tracking-wider opacity-70 font-display">04</span>
                  <h3 className="font-display text-xl font-bold uppercase">AI Чат</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-60 font-display mb-2">Начните сейчас</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight max-w-xl">
                Создайте свой идеальный гардероб
              </h2>
            </div>
            <Link to="/wardrobe">
              <button className="group bg-background text-foreground px-10 py-4 font-display text-sm font-semibold uppercase tracking-wider hover:bg-background/90 transition-smooth inline-flex items-center gap-3">
                Начать
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-display text-2xl font-bold uppercase">SHMOTKI</p>
            <div className="flex gap-6 text-xs uppercase tracking-wider text-muted-foreground font-display font-medium">
              <Link to="/wardrobe" className="hover:text-foreground transition-smooth">Гардероб</Link>
              <Link to="/recommendations" className="hover:text-foreground transition-smooth">Рекомендации</Link>
              <Link to="/analysis" className="hover:text-foreground transition-smooth">Анализ</Link>
              <Link to="/chat" className="hover:text-foreground transition-smooth">AI Чат</Link>
            </div>
            <p className="text-[10px] text-muted-foreground font-body">© 2024 Shmotki</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;