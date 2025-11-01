-- Create clothing items table
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories')),
  color TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('all', 'spring', 'summer', 'autumn', 'winter')),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own clothing items"
ON public.clothing_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clothing items"
ON public.clothing_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing items"
ON public.clothing_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing items"
ON public.clothing_items
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clothing_items_updated_at
BEFORE UPDATE ON public.clothing_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_season ON public.clothing_items(season);