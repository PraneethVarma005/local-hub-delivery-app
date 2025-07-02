-- Create shops table for shop owner information
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_owner_id UUID NOT NULL,
  shop_name TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  contact_number TEXT,
  pin_code TEXT,
  description TEXT,
  shop_image TEXT,
  shop_lat NUMERIC,
  shop_lng NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shop_inventory table for products
CREATE TABLE IF NOT EXISTS public.shop_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'food',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for shops table
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create policies for shops table
CREATE POLICY "Shop owners can manage their own shops" 
ON public.shops 
FOR ALL 
USING (auth.uid() = shop_owner_id);

CREATE POLICY "Anyone can view active shops" 
ON public.shops 
FOR SELECT 
USING (is_active = true);

-- Enable RLS for shop_inventory table
ALTER TABLE public.shop_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for shop_inventory table
CREATE POLICY "Shop owners can manage their inventory" 
ON public.shop_inventory 
FOR ALL 
USING (
  shop_id IN (
    SELECT id FROM public.shops WHERE shop_owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view available inventory" 
ON public.shop_inventory 
FOR SELECT 
USING (
  is_available = true AND 
  shop_id IN (
    SELECT id FROM public.shops WHERE is_active = true
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_inventory_updated_at
  BEFORE UPDATE ON public.shop_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();