import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
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

  useEffect(() => {
    fetchTrends();
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
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="container max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-body">
                  AI-Powered Fashion
                </p>
                <h1 className="font-display text-editorial-xl font-medium">
                  SHMOTKI
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-body font-light max-w-md leading-relaxed">
                  Персональный AI-стилист, который создает идеальные образы на основе вашего гардероба, погоды и актуальных трендов
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/wardrobe">
                  <button className="group w-full sm:w-auto bg-foreground text-background px-8 py-4 font-body text-sm uppercase tracking-wider hover:bg-foreground/90 transition-smooth flex items-center justify-center gap-3">
                    Мой гардероб
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </button>
                </Link>
                <Link to="/recommendations">
                  <button className="group w-full sm:w-auto border border-foreground bg-transparent px-8 py-4 font-body text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-smooth flex items-center justify-center gap-3">
                    Рекомендации
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-smooth" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={wardrobeHero} 
                  alt="Fashion" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-background p-4 border border-border">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Season 24/25</p>
                <p className="font-display text-2xl">New Collection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-4 bg-foreground text-background overflow-hidden">
        <div className="flex whitespace-nowrap marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-sm uppercase tracking-[0.3em] font-body">
              AI Styling • Trend Analysis • Personal Wardrobe • Weather Based • Daily Outfits •
            </span>
          ))}
        </div>
      </section>

      {/* Fashion Trends */}
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">01</p>
              <h2 className="font-display text-editorial-lg">
                Тренды<br />сезона
              </h2>
            </div>
            
            <div className="lg:col-span-2">
              {loadingTrends ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : trends ? (
                <div className="text-lg text-muted-foreground font-body font-light leading-relaxed whitespace-pre-line border-l border-border pl-8">
                  {trends}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {fashionTrends.map((trend, index) => (
                    <div key={index} className="group p-6 border border-border hover:bg-foreground hover:text-background transition-smooth">
                      <span className="text-xs text-muted-foreground group-hover:text-background/60 transition-smooth">0{index + 1}</span>
                      <h4 className="font-display text-xl mt-2 mb-2">{trend.title}</h4>
                      <p className="text-sm text-muted-foreground font-body group-hover:text-background/70 transition-smooth">{trend.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-1">
            {/* Wardrobe */}
            <Link to="/wardrobe" className="group">
              <div className="relative aspect-square overflow-hidden bg-background">
                <img 
                  src={wardrobeHero} 
                  alt="Гардероб" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/20 transition-smooth" />
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-background">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase tracking-widest opacity-70">Гардероб</span>
                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-smooth" />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl mb-2">Оцифруйте</h3>
                    <p className="font-body text-sm opacity-80 max-w-xs">
                      Все ваши вещи в одном месте с умной каталогизацией
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Recommendations */}
            <Link to="/recommendations" className="group">
              <div className="relative aspect-square overflow-hidden bg-background">
                <img 
                  src={styleAnalysis} 
                  alt="AI рекомендации" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/20 transition-smooth" />
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-background">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase tracking-widest opacity-70">AI Стилист</span>
                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-smooth" />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl mb-2">Рекомендации</h3>
                    <p className="font-body text-sm opacity-80 max-w-xs">
                      Персональные образы с учетом погоды и трендов
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Analysis */}
            <Link to="/analysis" className="group">
              <div className="relative aspect-square overflow-hidden bg-foreground">
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-background">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase tracking-widest opacity-70">Анализ</span>
                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-smooth" />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl mb-2">Анализ<br/>гардероба</h3>
                    <p className="font-body text-sm opacity-80 max-w-xs">
                      Узнайте, каких вещей не хватает в вашем гардеробе
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Chat */}
            <Link to="/chat" className="group">
              <div className="relative aspect-square overflow-hidden bg-background">
                <img 
                  src={aiAssistant} 
                  alt="AI чат" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/20 transition-smooth" />
                <div className="absolute inset-0 flex flex-col justify-between p-8 text-background">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase tracking-widest opacity-70">AI Чат</span>
                    <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-smooth" />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl mb-2">Общайтесь</h3>
                    <p className="font-body text-sm opacity-80 max-w-xs">
                      Задавайте вопросы AI-стилисту напрямую
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Начните сейчас</p>
          <h2 className="font-display text-editorial-lg mb-8 max-w-2xl mx-auto">
            Создайте свой идеальный гардероб
          </h2>
          <Link to="/wardrobe">
            <button className="group bg-foreground text-background px-12 py-5 font-body text-sm uppercase tracking-wider hover:bg-foreground/90 transition-smooth inline-flex items-center gap-4">
              Начать
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-display text-2xl">SHMOTKI</p>
            <div className="flex gap-8 text-sm text-muted-foreground font-body">
              <Link to="/wardrobe" className="editorial-link hover:text-foreground transition-smooth">Гардероб</Link>
              <Link to="/recommendations" className="editorial-link hover:text-foreground transition-smooth">Рекомендации</Link>
              <Link to="/analysis" className="editorial-link hover:text-foreground transition-smooth">Анализ</Link>
              <Link to="/chat" className="editorial-link hover:text-foreground transition-smooth">AI Чат</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2024 Shmotki. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
