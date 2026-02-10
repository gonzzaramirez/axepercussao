import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    productName: string;
    brandName?: string;
    variantDesc?: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  trackingCode?: string;
  courierName?: string;
  address: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail: string;
  private readonly storeName = 'Axé Percussão';
  private readonly brandColor = '#FF6D00';
  private readonly siteUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    this.siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const itemsHtml = data.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.productName}${item.brandName ? ` - ${item.brandName}` : ''}${item.variantDesc ? ` (${item.variantDesc})` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
        </tr>
      `,
        )
        .join('');

      const html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: ${this.brandColor}; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${this.storeName}</h1>
          </div>
          <div style="padding: 32px; background: #fff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: #d4edda; color: #155724; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                ✅ Pedido Confirmado
              </span>
            </div>
            <p>Hola <strong>${data.customerName}</strong>,</p>
            <p>Tu pedido <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> ha sido confirmado.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Producto</th>
                  <th style="padding: 12px; text-align: center;">Cant.</th>
                  <th style="padding: 12px; text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            
            <div style="text-align: right; font-size: 20px; font-weight: bold; margin: 16px 0;">
              Total: $${data.totalAmount.toLocaleString()}
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <strong>📍 Dirección de envío:</strong><br/>
              ${data.address}
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${this.siteUrl}/pedido/${data.orderId}" 
                 style="background: ${this.brandColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ver mi Pedido
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
            <p>${this.storeName} | Contacto: WhatsApp</p>
          </div>
        </div>
      `;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.customerEmail,
        subject: `✅ Pedido #${data.orderId.slice(0, 8).toUpperCase()} Confirmado - ${this.storeName}`,
        html,
      });

      this.logger.log(`Email de confirmación enviado a ${data.customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error enviando email de confirmación: ${error}`,
      );
      return false;
    }
  }

  async sendTrackingUpdate(data: OrderEmailData): Promise<boolean> {
    try {
      const html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: ${this.brandColor}; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${this.storeName}</h1>
          </div>
          <div style="padding: 32px; background: #fff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: #cce5ff; color: #004085; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                📦 Pedido Enviado
              </span>
            </div>
            <p>Hola <strong>${data.customerName}</strong>,</p>
            <p>Tu pedido <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> ya fue despachado.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; color: #666;">Código de seguimiento:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.trackingCode}</p>
              ${data.courierName ? `<p style="margin: 8px 0 0; color: #666;">Transporte: ${data.courierName}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${this.siteUrl}/pedido/${data.orderId}" 
                 style="background: ${this.brandColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Seguir mi Envío
              </a>
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
            <p>${this.storeName} | Contacto: WhatsApp</p>
          </div>
        </div>
      `;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.customerEmail,
        subject: `📦 Pedido #${data.orderId.slice(0, 8).toUpperCase()} Enviado - ${this.storeName}`,
        html,
      });

      this.logger.log(`Email de tracking enviado a ${data.customerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email de tracking: ${error}`);
      return false;
    }
  }
}
