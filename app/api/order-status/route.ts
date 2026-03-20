import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getOrders } from '@/lib/store';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const trackingId = req.nextUrl.searchParams.get('trackingId');

  if (!orderId && !trackingId) {
    return NextResponse.json({ error: 'orderId or trackingId required' }, { status: 400 });
  }

  let order;
  if (orderId) {
    order = await getOrder(orderId);
  } else if (trackingId) {
    const orders = await getOrders();
    order = orders.find((o) => o.trackingId === trackingId);
  }

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  // If only orderId was provided (checkout polling), return minimal data + trackingId
  if (orderId && !trackingId) {
    return NextResponse.json({ status: order.status, trackingId: order.trackingId });
  }

  // Public tracking: return safe data (no email, phone, address)
  return NextResponse.json({
    trackingId: order.trackingId,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    trackingCode: order.trackingCode || null,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    total: order.total,
    customerName: order.customerName,
    createdAt: order.createdAt,
    statusHistory: order.statusHistory,
  });
}
