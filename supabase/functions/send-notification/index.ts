
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'new_order' | 'new_shop' | 'order_update';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data }: NotificationRequest = await req.json();

    console.log('Processing notification:', type, data);

    switch (type) {
      case 'new_order':
        await handleNewOrder(supabaseClient, data);
        break;
      case 'new_shop':
        await handleNewShop(supabaseClient, data);
        break;
      case 'order_update':
        await handleOrderUpdate(supabaseClient, data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function handleNewOrder(supabaseClient: any, data: any) {
  const { orderId, shopId, customerId } = data;

  // Get order details
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select('*, customer:user_profiles!orders_customer_id_fkey(full_name)')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('Error fetching order:', orderError);
    return;
  }

  // Notify shop owner
  await supabaseClient
    .from('notifications')
    .insert([{
      user_id: shopId,
      type: 'new_order',
      title: 'New Order Received!',
      message: `You have a new order from ${order.customer?.full_name} worth $${order.total_amount.toFixed(2)}`,
      data: { orderId, customerId }
    }]);

  // Find nearby delivery partners (within 10km radius)
  const { data: deliveryPartners, error: dpError } = await supabaseClient
    .from('user_profiles')
    .select('id, latitude, longitude')
    .eq('role', 'delivery_partner')
    .eq('is_online', true);

  if (!dpError && deliveryPartners) {
    for (const partner of deliveryPartners) {
      // In a real app, you'd calculate distance properly
      // For now, notify all online delivery partners
      await supabaseClient
        .from('notifications')
        .insert([{
          user_id: partner.id,
          type: 'delivery_opportunity',
          title: 'New Delivery Available',
          message: `New delivery worth $${order.total_amount.toFixed(2)} is available in your area`,
          data: { orderId, estimated_earning: (order.total_amount * 0.1).toFixed(2) }
        }]);
    }
  }

  console.log('New order notifications sent successfully');
}

async function handleNewShop(supabaseClient: any, data: any) {
  const { shopId } = data;

  // Get shop details
  const { data: shop, error: shopError } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('id', shopId)
    .eq('role', 'shop_owner')
    .single();

  if (shopError) {
    console.error('Error fetching shop:', shopError);
    return;
  }

  // Notify all customers in the area about new shop
  const { data: customers, error: customerError } = await supabaseClient
    .from('user_profiles')
    .select('id')
    .eq('role', 'customer');

  if (!customerError && customers) {
    for (const customer of customers) {
      await supabaseClient
        .from('notifications')
        .insert([{
          user_id: customer.id,
          type: 'new_shop',
          title: 'New Shop in Your Area!',
          message: `${shop.shop_name} is now available on LocalHub. Check out their ${shop.shop_category} offerings!`,
          data: { shopId, shopName: shop.shop_name, category: shop.shop_category }
        }]);
    }
  }

  console.log('New shop notifications sent successfully');
}

async function handleOrderUpdate(supabaseClient: any, data: any) {
  const { orderId, status, customerId } = data;

  const statusMessages = {
    'accepted': 'Your order has been accepted by the shop',
    'preparing': 'Your order is being prepared',
    'ready': 'Your order is ready for pickup',
    'picked_up': 'Your order has been picked up by the delivery partner',
    'on_the_way': 'Your order is on the way to you',
    'delivered': 'Your order has been delivered successfully',
    'cancelled': 'Your order has been cancelled'
  };

  const message = statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated';

  // Notify customer
  await supabaseClient
    .from('notifications')
    .insert([{
      user_id: customerId,
      type: 'order_update',
      title: 'Order Update',
      message: message,
      data: { orderId, status }
    }]);

  console.log('Order update notification sent successfully');
}

serve(handler);
