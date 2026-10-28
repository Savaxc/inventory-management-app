import { Resend } from 'resend';
import { LowStockEmailTemplate } from '@/components/emails/low-stock-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const resendFrom =
  process.env.RESEND_FROM_EMAIL?.trim() ||
  'StockApp <onboarding@resend.dev>';

export async function checkAndSendLowStockAlert(
  userEmail: string,
  productName: string,
  quantity: number,
  lowStockAt: number | null,
  inventorySummary?: { totalItems: number; lowStockCount: number; totalValue: number }
) {
  const threshold = lowStockAt ?? 5; 

  if (quantity <= threshold) {
    try {
      await resend.emails.send({
        from: resendFrom,
        to: userEmail,
        subject: `⚠️ Low Stock Alert: ${productName}`,
        react: (
          <LowStockEmailTemplate
            productName={productName}
            currentQuantity={quantity}
            lowStockThreshold={threshold}
            inventorySummary={inventorySummary}
          />
        ),
      });
      console.log(`Alert sent for ${productName}`);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
}