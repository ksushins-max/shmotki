import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Trash2 } from "lucide-react";
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
      // Show welcome message for non-authenticated users
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
        // Add welcome message for new users
        const welcomeMsg = {
          role: "assistant" as const,
          content: "Привет! Я ваш AI стилист. Задайте мне любые вопросы о моде, стиле или рекомендациях по вашему гардеробу."
        };
        setMessages([welcomeMsg]);
        // Save welcome message to DB
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

      // Reset to welcome message
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !userId) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to DB
    await saveMessage(userId, "user", input);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { 
          message: input, 
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
      
      // Save assistant message to DB
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
    <div className="min-h-screen gradient-soft">
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Стилист
            </h1>
            <p className="text-muted-foreground mt-2">
              Задайте вопросы о моде и получите персональные советы
            </p>
          </div>
          {userId && messages.length > 1 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить историю
            </Button>
          )}
        </div>

        <Card className="shadow-elegant overflow-hidden">
          <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-primary" : "gradient-accent"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`flex-1 rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-muted mr-12"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 rounded-2xl p-4 bg-muted mr-12">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={userId ? "Напишите сообщение..." : "Войдите, чтобы начать чат"}
                disabled={isLoading || !userId}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || !userId}
                className="gradient-accent"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
