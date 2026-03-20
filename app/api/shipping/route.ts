import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { cep } = await req.json();
    if (!cep || cep.length < 5) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    const cleanCep = cep.replace(/\D/g, '');
    const settings = await getSettings();
    const rates = settings.shippingRates || [];

    // Find state by CEP range
    const match = rates.find((r) => {
      const cepNum = parseInt(cleanCep.slice(0, 5));
      const start = parseInt(r.cepRangeStart);
      const end = parseInt(r.cepRangeEnd);
      return cepNum >= start && cepNum <= end;
    });

    if (!match) {
      return NextResponse.json({
        state: null,
        price: 5000, // fallback R$ 50,00
        priceFormatted: 'R$ 50,00',
        message: 'Frete padrão (estado não identificado)',
      });
    }

    return NextResponse.json({
      state: match.state,
      name: match.name,
      price: match.price,
      priceFormatted: match.price === 0 ? 'Grátis' : `R$ ${(match.price / 100).toFixed(2).replace('.', ',')}`,
      message: match.price === 0 ? `Frete grátis para ${match.name}!` : `Frete para ${match.name} (${match.state})`,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 });
  }
}
