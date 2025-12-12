import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import wardrobeHero from "@/assets/wardrobe-hero.jpg";
import styleAnalysis from "@/assets/style-analysis.jpg";
import aiAssistant from "@/assets/ai-assistant.jpg";

const fashionTrends = [
  { title: "Оверсайз силуэты", description: "Свободные формы остаются в тренде" },
  { title: "Нейтральные тона", description: "Бежевый, серый и белый — база сезона" },
  { title: "Многослойность", description: "Комбинируйте разные текстуры" },
  { title: "Минимализм", description: "Чистые линии и простые формы" },
];

const Index = () => {
  const [trends, setTrends] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchTrends();
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
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
      {/* Hero Section - Moodboard Style with Animation */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div 
              className={`space-y-8 transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="space-y-6">
                <p 
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body font-medium"
                  style={{ transitionDelay: "0.1s" }}
                >
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

            {/* Moodboard Style Collage with Staggered Animation */}
            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Background paper layers with animation */}
                <div 
                  className={`absolute inset-0 bg-secondary/60 shadow-lg transition-all duration-1000 ease-out ${
                    isVisible ? "opacity-100 rotate-3 translate-x-2.5 translate-y-1.5" : "opacity-0 rotate-0 translate-x-0 translate-y-0"
                  }`}
                  style={{ transitionDelay: "0.3s" }}
                />
                <div 
                  className={`absolute inset-0 bg-secondary/80 shadow-md transition-all duration-1000 ease-out ${
                    isVisible ? "opacity-100 -rotate-2 -translate-x-1 translate-y-0.5" : "opacity-0 rotate-0 translate-x-0 translate-y-0"
                  }`}
                  style={{ transitionDelay: "0.4s" }}
                />
                
                {/* Main image container */}
                <div 
                  className={`relative bg-card shadow-xl p-3 transition-all duration-1000 ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: "0.5s" }}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={wardrobeHero} 
                      alt="Fashion" 
                      className={`w-full h-full object-cover transition-transform duration-1000 ${
                        isVisible ? "scale-100" : "scale-110"
                      }`}
                      style={{ transitionDelay: "0.7s" }}
                    />
                  </div>
                  
                  {/* Handwritten-style labels with staggered animation */}
                  <div 
                    className={`absolute -right-4 top-1/4 transform transition-all duration-700 ease-out ${
                      isVisible ? "opacity-100 rotate-12 translate-x-0" : "opacity-0 rotate-0 translate-x-10"
                    }`}
                    style={{ transitionDelay: "0.9s" }}
                  >
                    <span className="font-body italic text-sm text-muted-foreground bg-background px-2 py-1 shadow-sm inline-block animate-float">
                      стиль сезона →
                    </span>
                  </div>
                  
                  <div 
                    className={`absolute -left-8 top-1/2 transform transition-all duration-700 ease-out ${
                      isVisible ? "opacity-100 -rotate-6 translate-x-0" : "opacity-0 rotate-0 -translate-x-10"
                    }`}
                    style={{ transitionDelay: "1s" }}
                  >
                    <span className="font-body italic text-sm text-muted-foreground bg-background px-2 py-1 shadow-sm inline-block animate-float-delayed">
                      ваш образ
                    </span>
                  </div>
                  
                  <div 
                    className={`absolute -right-6 bottom-1/4 transform transition-all duration-700 ease-out ${
                      isVisible ? "opacity-100 rotate-6 translate-x-0" : "opacity-0 rotate-0 translate-x-10"
                    }`}
                    style={{ transitionDelay: "1.1s" }}
                  >
                    <span className="font-body italic text-sm text-muted-foreground bg-background px-2 py-1 shadow-sm inline-block animate-float">
                      AI подбор →
                    </span>
                  </div>
                </div>
                
                {/* Paperclip decoration with animation */}
                <div 
                  className={`absolute -top-6 left-1/4 w-8 h-16 border-2 border-muted-foreground/40 rounded-full transition-all duration-700 ease-out ${
                    isVisible ? "opacity-100 rotate-45" : "opacity-0 rotate-0"
                  }`}
                  style={{ 
                    borderBottomColor: "transparent", 
                    borderLeftColor: "transparent",
                    transitionDelay: "1.2s"
                  }} 
                />
                
                {/* Season badge with animation */}
                <div 
                  className={`absolute -bottom-4 -left-4 bg-foreground text-background p-4 shadow-lg transition-all duration-700 ease-out ${
                    isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-10 translate-y-10"
                  }`}
                  style={{ transitionDelay: "0.8s" }}
                >
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
                  src={wardrobeHero} 
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
                  src={styleAnalysis} 
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
              <div className="relative aspect-[3/4] overflow-hidden bg-foreground flex flex-col justify-end p-4">
                <span className="text-[10px] uppercase tracking-wider text-background/70 font-display">03</span>
                <h3 className="font-display text-xl font-bold uppercase text-background">Анализ</h3>
                <p className="text-xs text-background/70 font-body mt-2">Узнайте, каких вещей не хватает</p>
              </div>
            </Link>

            {/* Chat */}
            <Link to="/chat" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-card">
                <img 
                  src={aiAssistant} 
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