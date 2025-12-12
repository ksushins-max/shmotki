import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Trash2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  season: string;
  description?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Что надеть сегодня?",
  "Образ для работы",
  "Для свидания",
  "На прогулку",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await Promise.all([
        fetchMessages(user.id),
        fetchWeather(),
        fetchWardrobe(user.id),
        fetchUserProfile(user.id)
      ]);
    } else {
      setMessages([{
        role: "assistant",
        content: "Привет! Я ваш AI стилист. Войдите в систему, чтобы получить персональные рекомендации.",
      }]);
    }
  };

  const fetchMessages = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content
        })));
      } else {
        const welcomeMsg = {
          role: "assistant" as const,
          content: "Привет! Я ваш AI стилист. Задайте мне любые вопросы о моде, стиле или рекомендациях по вашему гардеробу."
        };
        setMessages([welcomeMsg]);
        await saveMessage(uid, welcomeMsg.role, welcomeMsg.content);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const saveMessage = async (uid: string, role: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ user_id: uid, role, content }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  const clearHistory = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      const welcomeMsg = {
        role: "assistant" as const,
        content: "Привет! Я ваш AI стилист. Задайте мне любые вопросы о моде, стиле или рекомендациях по вашему гардеробу."
      };
      setMessages([welcomeMsg]);
      await saveMessage(userId, welcomeMsg.role, welcomeMsg.content);

      toast({
        title: "История очищена",
        description: "Все сообщения удалены",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось очистить историю",
        variant: "destructive",
      });
    }
  };

  const fetchWeather = async () => {
    try {
      const latitude = 59.9343;
      const longitude = 30.3351;
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=Europe/Moscow`
      );
      const data = await response.json();
      
      const weatherConditions: { [key: number]: string } = {
        0: "Ясно", 1: "Преимущественно ясно", 2: "Переменная облачность", 3: "Облачно",
        45: "Туман", 48: "Изморозь", 51: "Легкая морось", 61: "Небольшой дождь",
        71: "Небольшой снег", 95: "Гроза"
      };

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: weatherConditions[data.current.weathercode] || "Неизвестно",
        location: "Санкт-Петербург"
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather({ temp: 0, condition: "Неизвестно", location: "Санкт-Петербург" });
    }
  };

  const fetchWardrobe = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("clothing_items")
        .select("*")
        .eq("user_id", uid);

      if (error) throw error;
      setWardrobe(data || []);
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
    }
  };

  const fetchUserProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading || !userId) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await saveMessage(userId, "user", text);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { 
          message: text, 
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          weather,
          wardrobe: wardrobe.map(item => ({
            name: item.name,
            category: item.category,
            color: item.color,
            season: item.season,
            description: item.description
          })),
          userProfile
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
      
      await saveMessage(userId, "assistant", data.response);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="grid lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2">
            <span className="text-accent font-display text-sm font-semibold uppercase tracking-wider">AI Stylist</span>
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mt-2">
              Чат
            </h1>
            <p className="text-muted-foreground font-body mt-4 max-w-md">
              Задайте вопросы о моде и получите персональные советы на основе вашего гардероба
            </p>
          </div>
          
          <div className="flex flex-col justify-end">
            {weather && (
              <div className="bg-secondary p-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">Погода сейчас</span>
                <p className="font-display text-2xl font-bold">{weather.temp}°C</p>
                <p className="text-sm text-muted-foreground">{weather.condition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick prompts */}
        {userId && messages.length <= 2 && (
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-3">Быстрые запросы</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="px-4 py-2 border border-border text-sm font-display font-medium hover:bg-foreground hover:text-background transition-smooth"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="border border-border bg-card">
              <ScrollArea className="h-[500px]" ref={scrollRef}>
                <div className="p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-10 w-10 flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-foreground" : "bg-accent"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-5 w-5 text-background" />
                        ) : (
                          <Bot className="h-5 w-5 text-accent-foreground" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${
                          message.role === "user" ? "text-right" : ""
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">
                          {message.role === "user" ? "Вы" : "AI Стилист"}
                        </span>
                        <p className="font-body mt-1 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-accent flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">AI Стилист</span>
                        <div className="flex gap-1 mt-2">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={userId ? "Напишите сообщение..." : "Войдите, чтобы начать чат"}
                    disabled={isLoading || !userId}
                    className="flex-1 border-0 bg-secondary font-body"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim() || !userId}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {userId && messages.length > 1 && (
              <button
                onClick={clearHistory}
                className="w-full flex items-center justify-between p-4 border border-border hover:bg-secondary transition-smooth"
              >
                <span className="text-sm font-display font-medium">Очистить историю</span>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            
            <div className="p-4 bg-foreground text-background">
              <span className="text-[10px] uppercase tracking-wider opacity-60 font-display">Подсказка</span>
              <p className="text-sm font-body mt-2">
                AI учитывает ваш гардероб и текущую погоду для рекомендаций
              </p>
            </div>

            <div className="p-4 border border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">Ваш гардероб</span>
              <p className="font-display text-2xl font-bold mt-1">{wardrobe.length}</p>
              <p className="text-xs text-muted-foreground">вещей</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
