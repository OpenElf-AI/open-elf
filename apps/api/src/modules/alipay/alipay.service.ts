import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlipaySdk } from 'alipay-sdk';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderService } from '../order/order.service';

interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gatewayUrl: string;
  notifyUrl: string;
  returnUrl: string;
}

@Injectable()
export class AlipayService {
  private config: AlipayConfig;
  private processedNotifies: Set<string> = new Set();
  private alipaySdk: AlipaySdk;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private orderService: OrderService,
  ) {
    this.config = {
      appId: this.configService.get('ALIPAY_APP_ID') || '',
      privateKey: this.configService.get('ALIPAY_PRIVATE_KEY') || '',
      alipayPublicKey: this.configService.get('ALIPAY_PUBLIC_KEY') || '',
      gatewayUrl: this.configService.get('ALIPAY_GATEWAY_URL') || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
      notifyUrl: this.configService.get('ALIPAY_NOTIFY_URL') || '',
      returnUrl: this.configService.get('ALIPAY_RETURN_URL') || '',
    };
    
    const privateKey = this.config.privateKey.replace(/\\n/g, '\n').trim();
    const alipayPublicKey = this.config.alipayPublicKey.replace(/\\n/g, '\n').trim();

    this.alipaySdk = new AlipaySdk({
      appId: this.config.appId,
      privateKey: privateKey,
      alipayPublicKey: alipayPublicKey,
      gateway: this.config.gatewayUrl,
      signType: 'RSA2',
      charset: 'utf-8',
    });
    
    console.log('[Alipay] Service initialized with official SDK');
  }

  async createPaymentByAsset(
    assetType: string, 
    assetId: string, 
    userId?: string,
  ): Promise<{ paymentUrl: string; outTradeNo: string; amount: number }> {
    const productInfo = await this.getProductInfo(assetType, assetId);
    const outTradeNo = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { totalAmount, subject, assetName, sellerId } = productInfo;

    await this.orderService.createOrder({
      outTradeNo,
      userId: userId || '',
      totalAmount,
      subject,
      assetType,
      assetId,
      assetName,
      sellerId,
      payType: 'alipay',
    });

    const paymentUrl = await this.buildPaymentUrl(outTradeNo, totalAmount, subject);
    return { paymentUrl, outTradeNo, amount: totalAmount };
  }

  private async buildPaymentUrl(outTradeNo: string, totalAmount: number, subject: string): Promise<string> {
    console.log(`[Alipay] Creating payment order: ${outTradeNo}, amount: ${totalAmount}`);
    
    const paymentUrl = this.alipaySdk.pageExecute('alipay.trade.wap.pay', 'GET', {
      notifyUrl: this.config.notifyUrl,
      returnUrl: this.config.returnUrl,
      bizContent: {
        outTradeNo: outTradeNo,
        totalAmount: totalAmount.toFixed(2),
        subject: subject,
        productCode: 'QUICK_WAP_WAY',
      },
    });

    console.log('[Alipay] Payment URL:', paymentUrl);
    
    return paymentUrl;
  }

  private async getProductInfo(assetType: string, assetId: string): Promise<{ 
    totalAmount: number; 
    subject: string; 
    assetName: string;
    sellerId?: string;
  }> {
    if (assetType === 'agent') {
      const agent = await this.prisma.agent.findUnique({
        where: { id: assetId },
      });
      if (agent) {
        return {
          totalAmount: agent.price,
          subject: agent.name,
          assetName: agent.name,
          sellerId: agent.creatorId,
        };
      }
    } else if (assetType === 'capability') {
      const pkg = await this.prisma.capabilityPackage.findUnique({
        where: { id: assetId },
      });
      if (pkg) {
        return {
          totalAmount: pkg.price,
          subject: pkg.name,
          assetName: pkg.name,
          sellerId: pkg.creatorId,
        };
      }
    }

    return { 
      totalAmount: 0.01, 
      subject: `${assetType} - ${assetId}`, 
      assetName: `${assetType} - ${assetId}`,
    };
  }

  async handleNotify(params: Record<string, string>): Promise<string> {
    try {
      const signVerified = this.alipaySdk.checkNotifySign(params as any);
      
      if (!signVerified) {
        console.warn('[Alipay] Invalid signature in notify');
        return 'fail';
      }

      const { out_trade_no, trade_no, trade_status } = params;

      if (!out_trade_no) {
        return 'fail';
      }

      if (this.processedNotifies.has(trade_no)) {
        console.log(`[Alipay] Duplicate notify, already processed: ${trade_no}`);
        return 'success';
      }

      const order = await this.orderService.getOrder(out_trade_no);
      
      if (!order) {
        console.warn(`[Alipay] Order not found: ${out_trade_no}`);
        return 'success';
      }

      if (order.status === 'paid') {
        console.log(`[Alipay] Order already paid: ${out_trade_no}`);
        return 'success';
      }

      if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
        await this.orderService.updateOrderStatus(out_trade_no, 'paid');
        console.log(`[Alipay] Order paid: ${out_trade_no}`);
        await this.recordTransaction(order);
      }

      this.processedNotifies.add(trade_no);
      return 'success';
    } catch (error) {
      console.error('[Alipay] Error handling notify:', error);
      return 'fail';
    }
  }

  private async recordTransaction(order: any): Promise<void> {
    if (!order.assetType || !order.assetId) {
      console.warn('[Alipay] Incomplete order info for transaction:', order.outTradeNo);
      return;
    }

    try {
      const serviceFee = order.totalAmount * 0.1;
      const sellerReceived = order.totalAmount - serviceFee;

      await this.prisma.transaction.create({
        data: {
          type: 'purchase',
          assetType: order.assetType,
          assetId: order.assetId,
          assetName: order.assetName || '',
          buyerId: order.userId || '',
          sellerId: order.sellerId || '',
          amount: order.totalAmount,
          serviceFee: serviceFee,
          sellerReceived: sellerReceived,
        },
      });

      if (order.assetType === 'agent') {
        await this.prisma.agent.update({
          where: { id: order.assetId },
          data: { soldCount: { increment: 1 } },
        });
      } else if (order.assetType === 'capability') {
        const pkg = await this.prisma.capabilityPackage.findUnique({
          where: { id: order.assetId },
        });
        
        if (pkg && order.userId) {
          await this.prisma.userCapabilityPackage.create({
            data: {
              packageId: pkg.id,
              userId: order.userId,
              name: pkg.name,
              description: pkg.description,
              prompt: pkg.prompt,
              capabilities: pkg.capabilities,
              category: pkg.category,
              originalPackageId: pkg.id,
            },
          });
          
          await this.prisma.capabilityPackage.update({
            where: { id: order.assetId },
            data: { soldCount: { increment: 1 } },
          });
        }
      }

      console.log('[Alipay] Transaction recorded:', order.outTradeNo);
    } catch (error) {
      console.error('[Alipay] Error recording transaction:', error);
    }
  }

  async handleReturn(params: Record<string, string>): Promise<{ outTradeNo: string; status: string }> {
    const { out_trade_no, trade_status } = params;

    if (!out_trade_no) {
      return { outTradeNo: '', status: 'fail' };
    }

    const status = (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') ? 'success' : 'fail';
    console.log(`[Alipay] Sync return: ${out_trade_no}, status: ${status}`);

    return { outTradeNo: out_trade_no, status };
  }
}
