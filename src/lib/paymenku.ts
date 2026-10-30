import crypto from "crypto";

export interface PaymenkuPaymentRequest {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
}

export interface PaymenkuPaymentResponse {
  success: boolean;
  transactionId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  payUrl?: string;
  qrisPayload?: string;
  qrisImageUrl?: string;
  vaNumber?: string;
  merchantName?: string;
  expiredAt: string;
  message: string;
}

export function getPaymenkuConfig() {
  let merchantCode = process.env.PAYMENKU_MERCHANT_CODE || "Jejak-hijau";
  let apiKey = process.env.PAYMENKU_API_KEY || "";
  let secretKey = process.env.PAYMENKU_SECRET_KEY || "";
  let baseUrl = process.env.PAYMENKU_BASE_URL || "https://paymenku.com/api/v1";
  let callbackUrl = process.env.PAYMENKU_CALLBACK_URL || "https://jejakhijau.web.id/api/payment/paymenku/webhook";
  let returnUrl = process.env.PAYMENKU_RETURN_URL || "https://jejakhijau.web.id/orders";

  try {
    const cfContext = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env) {
      if (cfContext.env.PAYMENKU_MERCHANT_CODE) merchantCode = cfContext.env.PAYMENKU_MERCHANT_CODE;
      if (cfContext.env.PAYMENKU_API_KEY) apiKey = cfContext.env.PAYMENKU_API_KEY;
      if (cfContext.env.PAYMENKU_SECRET_KEY) secretKey = cfContext.env.PAYMENKU_SECRET_KEY;
      if (cfContext.env.PAYMENKU_BASE_URL) baseUrl = cfContext.env.PAYMENKU_BASE_URL;
      if (cfContext.env.PAYMENKU_CALLBACK_URL) callbackUrl = cfContext.env.PAYMENKU_CALLBACK_URL;
      if (cfContext.env.PAYMENKU_RETURN_URL) returnUrl = cfContext.env.PAYMENKU_RETURN_URL;
    }
  } catch (err) {
    // ignore
  }

  return { merchantCode, apiKey, secretKey, baseUrl, callbackUrl, returnUrl };
}

/**
 * Verify incoming webhook signature from Paymenku
 * Header X-PaymenKu-Signature: HMAC-SHA256(timestamp + "." + raw_body, webhook_secret)
 */
export function verifyPaymenkuWebhookSignature(
  signature: string,
  timestamp: string,
  rawBody: string,
  secretKey?: string
): boolean {
  if (!signature || !timestamp) return false;
  const cfg = getPaymenkuConfig();
  const secret = secretKey || cfg.secretKey;
  if (!secret) return false;

  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");
    return expected.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Helper to map user payment selection to Paymenku channel_code
 */
export function mapToPaymenkuChannel(method?: string): string {
  if (!method) return "qris";
  const m = method.toLowerCase();
  if (m.includes("qris")) return "qris";
  if (m.includes("bca")) return "bca_va";
  if (m.includes("bri")) return "bri_va";
  if (m.includes("bni")) return "bni_va";
  if (m.includes("mandiri")) return "mandiri_va";
  if (m.includes("cimb")) return "cimb_va";
  if (m.includes("permata")) return "permata_va";
  if (m.includes("bsi")) return "bsi_va";
  if (m.includes("dana")) return "dana";
  if (m.includes("ovo")) return "ovo";
  if (m.includes("shopee")) return "shopeepay";
  if (m.includes("linkaja")) return "linkaja";
  return "qris";
}

/**
 * Create a live Payment Transaction via Paymenku API
 */
export async function createPaymenkuTransaction(
  req: PaymenkuPaymentRequest
): Promise<PaymenkuPaymentResponse> {
  const cfg = getPaymenkuConfig();
  const channelCode = mapToPaymenkuChannel(req.paymentMethod);

  if (!cfg.apiKey) {
    throw new Error("Kunci API Paymenku (PAYMENKU_API_KEY) belum dikonfigurasi di environment.");
  }

  const payload = {
    channel_code: channelCode,
    amount: Math.round(req.amount),
    reference_id: req.orderNumber,
    customer_name: req.customerName || "Pelanggan JejakHijau",
    customer_email: req.customerEmail || "pelanggan@jejakhijau.id",
    customer_phone: req.customerPhone || "081234567890",
    return_url: `${cfg.returnUrl}/${req.orderNumber}`,
  };

  const response = await fetch(`${cfg.baseUrl}/transaction/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const resJson: any = await response.json();

  if (!response.ok || resJson.status !== "success" || !resJson.data) {
    const errorMsg =
      resJson?.message ||
      (resJson?.errors ? JSON.stringify(resJson.errors) : `HTTP ${response.status} Gagal membuat transaksi`);
    throw new Error(`Paymenku Error: ${errorMsg}`);
  }

  const data = resJson.data;
  const paymentInfo = data.payment_info || {};

  return {
    success: true,
    transactionId: data.trx_id,
    orderNumber: data.reference_id || req.orderNumber,
    amount: parseFloat(data.amount || req.amount),
    paymentMethod: channelCode,
    status: (data.status?.toUpperCase() as any) || "PENDING",
    payUrl: data.pay_url,
    qrisPayload: paymentInfo.qr_string,
    qrisImageUrl: paymentInfo.qr_url,
    vaNumber: paymentInfo.va_number,
    merchantName: paymentInfo.merchant_name || "Paymenku",
    expiredAt:
      paymentInfo.expiration_date ||
      new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    message: "Transaksi Paymenku berhasil dibuat",
  };
}

/**
 * Check live status of a transaction from Paymenku API
 */
export async function checkPaymenkuTransactionStatus(trxIdOrRefId: string) {
  const cfg = getPaymenkuConfig();
  if (!cfg.apiKey) {
    throw new Error("Kunci API Paymenku belum dikonfigurasi.");
  }

  const response = await fetch(`${cfg.baseUrl}/check-status/${encodeURIComponent(trxIdOrRefId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const resJson: any = await response.json();
  if (!response.ok || resJson.status !== "success" || !resJson.data) {
    throw new Error(resJson?.message || `Gagal memeriksa status: HTTP ${response.status}`);
  }

  return resJson.data;
}
