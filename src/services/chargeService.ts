import prisma from '../prismaClient';
import { chargeValidator } from '../validators/chargeValidator';

const ALLOWED_STATUSES = ['pending', 'paid', 'failed', 'expired'] as const;

function generateBoletoDetails(paymentDetails: any) {
  return {
    due_date: paymentDetails.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    boleto_url: paymentDetails.boleto_url || `https://boleto.fake/${Math.random().toString(36).slice(2, 9)}`,
    barcode: paymentDetails.barcode || '237' + Math.floor(Math.random() * 1e12).toString(),
  };
}

function generatePixDetails(paymentDetails: any) {
  return {
    pix_key: paymentDetails.pix_key || 'default@pix',
    qr_code: paymentDetails.qr_code || `000201...${Math.random().toString(36).slice(2, 8)}`,
  };
}

function generateCardDetails(paymentDetails: any) {
  return {
    installments: Math.max(paymentDetails.installments || 1, 1),
    card_last4: paymentDetails.card_last4 || null,
  };
}

export async function createCharge(data: any, idempotencyKey?: string) {
  const validated = chargeValidator.parse(data);

  if (idempotencyKey) {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (existing?.responseBody) return existing.responseBody;
  }

  const customer = await prisma.customer.findUnique({ where: { id: validated.customer_id } });
  if (!customer) throw { status: 404, message: 'Customer não encontrado' };

  const paymentDetails = validated.payment_details || {};
  
  const paymentDetailsMap: Record<string, () => any> = {
    boleto: () => generateBoletoDetails(paymentDetails),
    pix: () => generatePixDetails(paymentDetails),
    card: () => generateCardDetails(paymentDetails),
  };

  const finalDetails = paymentDetailsMap[validated.payment_method]?.() || paymentDetails;

  const charge = await prisma.charge.create({
    data: {
      customerId: validated.customer_id,
      amount: validated.amount,
      currency: validated.currency,
      paymentMethod: validated.payment_method,
      status: 'pending',
      metadata: validated.metadata ?? null,
      paymentDetails: finalDetails,
      expiresAt: paymentDetails.expires_at ? new Date(paymentDetails.expires_at) : null,
    },
  });

  if (idempotencyKey) {
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        requestMethod: 'POST',
        requestPath: '/api/v1/charges',
        responseStatus: 201,
        responseBody: charge,
      },
    });
  }

  return charge;
}

export async function getCharge(id: string) {
  const charge = await prisma.charge.findUnique({ where: { id } });
  if (!charge) throw { status: 404, message: 'Charge não encontrada' };
  return charge;
}

export async function updateChargeStatus(id: string, body: any) {
  const { status, payment_details } = body;
  
  if (!ALLOWED_STATUSES.includes(status)) {
    throw { status: 400, message: 'Status inválido' };
  }

  return prisma.charge.update({
    where: { id },
    data: {
      status,
      paymentDetails: payment_details,
    },
  });
}