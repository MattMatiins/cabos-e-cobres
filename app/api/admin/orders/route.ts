import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrder, updateOrder } from '@/lib/store';
import { sendOrderNotification } from '@/lib/sms';
import type { OrderStatus } from '@/lib/types';

function checkAdminAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return auth === `Bearer ${password}`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getOrders());
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, status, trackingCode }: { orderId: string; status?: OrderStatus; trackingCode?: string } = await req.json();

    const existing = getOrder(orderId);
    if (!existing) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const updates: any = {};

    if (trackingCode !== undefined) {
      updates.trackingCode = trackingCode;
    }

    if (status && status !== existing.status) {
      updates.status = status;
      updates.statusHistory = [
        ...existing.statusHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          note: trackingCode ? `Rastreio: ${trackingCode}` : undefined,
        },
      ];
    }

    const updated = updateOrder(orderId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }

    // Send notification on status change
    let whatsappLink = '';
    if (status && status !== existing.status) {
      const result = await sendOrderNotification(updated, status);
      whatsappLink = result.whatsappLink;
    }

    return NextResponse.json({ ...updated, whatsappLink });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
