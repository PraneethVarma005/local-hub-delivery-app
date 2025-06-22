
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'new_order' | 'new_shop';
  orderId?: string;
  shopId?: string;
  customerLocation?: { lat: number; lng: number };
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, orderId, shopId, customerLocation, data }: NotificationRequest = await req.json();

    if (type === 'new_order') {
      // Notify shop owner about new order
      await supabase
        .from('notifications')
        .insert({
          recipient_id: data.shopOwnerId,
          type: 'new_order',
          title: 'New Order Received!',
          message: `You have a new order #${orderId}`,
          data: { orderId, customerLocation }
        });

      // Find nearby delivery partners (within 5km radius)
      const { data: deliveryPartners } = await supabase
        .from('user_profiles')
        .select('id, latitude, longitude')
        .eq('role', 'delivery_partner')
        .eq('is_online', true);

      if (deliveryPartners && customerLocation) {
        for (const partner of deliveryPartners) {
          if (partner.latitude && partner.longitude) {
            const distance = calculateDistance(
              customerLocation.lat, 
              customerLocation.lng,
              partner.latitude,
              partner.longitude
            );
            
            if (distance <= 5) { // Within 5km
              await supabase
                .from('notifications')
                .insert({
                  recipient_id: partner.id,
                  type: 'delivery_opportunity',
                  title: 'New Delivery Available',
                  message: `Delivery opportunity nearby (${distance.toFixed(1)}km away)`,
                  data: { orderId, distance }
                });
            }
          }
        }
      }
    } else if (type === 'new_shop') {
      // Broadcast new shop to all customers in the area
      console.log('New shop registered:', shopId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
}

serve(handler);
