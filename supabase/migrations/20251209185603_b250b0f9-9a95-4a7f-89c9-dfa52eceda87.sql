-- Add favorite_brands column to profiles table
ALTER TABLE public.profiles ADD COLUMN favorite_brands text[] DEFAULT '{}';