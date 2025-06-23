
-- Create user_profiles table first
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'shop_owner', 'delivery_partner')),
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'shop_owner', 'delivery_partner')),
  avatar_url TEXT,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_online BOOLEAN DEFAULT false,
  shop_name TEXT,
  shop_category TEXT,
  shop_address TEXT,
  shop_lat DECIMAL(10,8),
  shop_lng DECIMAL(11,8),
  vehicle_type TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  shop_id UUID NOT NULL REFERENCES auth.users(id),
  delivery_partner_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(10,8),
  delivery_lng DECIMAL(11,8),
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,8),
  pickup_lng DECIMAL(11,8),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery_tracking table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  delivery_partner_id UUID NOT NULL REFERENCES auth.users(id),
  current_lat DECIMAL(10,8) NOT NULL,
  current_lng DECIMAL(11,8) NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add privacy policy acceptance table
CREATE TABLE IF NOT EXISTS public.user_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  return_policy_accepted BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'shop_owner', 'delivery_partner')),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view shop profiles" ON public.user_profiles;
CREATE POLICY "Users can view shop profiles" ON public.user_profiles
  FOR SELECT USING (role = 'shop_owner');

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for orders
DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
CREATE POLICY "Users can view their orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = shop_id OR 
    auth.uid() = delivery_partner_id
  );

DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Shop owners and delivery partners can update orders" ON public.orders;
CREATE POLICY "Shop owners and delivery partners can update orders" ON public.orders
  FOR UPDATE USING (auth.uid() = shop_id OR auth.uid() = delivery_partner_id);

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for delivery_tracking
DROP POLICY IF EXISTS "Anyone can view delivery tracking" ON public.delivery_tracking;
CREATE POLICY "Anyone can view delivery tracking" ON public.delivery_tracking
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Delivery partners can insert tracking" ON public.delivery_tracking;
CREATE POLICY "Delivery partners can insert tracking" ON public.delivery_tracking
  FOR INSERT WITH CHECK (auth.uid() = delivery_partner_id);

-- RLS Policy for user agreements
DROP POLICY IF EXISTS "Users can manage their own agreements" ON public.user_agreements;
CREATE POLICY "Users can manage their own agreements" ON public.user_agreements
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for delivery tracking
ALTER TABLE public.delivery_tracking REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    phone, 
    role, 
    user_type,
    shop_name, 
    shop_category, 
    shop_address, 
    shop_lat, 
    shop_lng, 
    vehicle_type, 
    latitude, 
    longitude
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'shop_category',
    NEW.raw_user_meta_data->>'shop_address',
    CASE WHEN NEW.raw_user_meta_data->>'shop_lat' IS NOT NULL THEN (NEW.raw_user_meta_data->>'shop_lat')::DECIMAL END,
    CASE WHEN NEW.raw_user_meta_data->>'shop_lng' IS NOT NULL THEN (NEW.raw_user_meta_data->>'shop_lng')::DECIMAL END,
    NEW.raw_user_meta_data->>'vehicle_type',
    CASE WHEN NEW.raw_user_meta_data->>'latitude' IS NOT NULL THEN (NEW.raw_user_meta_data->>'latitude')::DECIMAL END,
    CASE WHEN NEW.raw_user_meta_data->>'longitude' IS NOT NULL THEN (NEW.raw_user_meta_data->>'longitude')::DECIMAL END
  );

  -- Insert user agreements
  INSERT INTO public.user_agreements (
    user_id,
    privacy_policy_accepted,
    return_policy_accepted,
    terms_accepted,
    user_type
  )
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'privacy_policy_accepted')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'return_policy_accepted')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
