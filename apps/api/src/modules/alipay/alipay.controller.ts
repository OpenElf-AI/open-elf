import { Controller, Post, Get, Body, Query, Res, UseInterceptors } from '@nestjs/common';
import { AlipayService } from './alipay.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { Response } from 'express';

@Controller('pay')
@UseInterceptors(TransformInterceptor)
export class AlipayController {
  constructor(private alipayService: AlipayService) {}

  @Post('alipay/prepayByAsset')
  async createPaymentByAsset(@Body() body: { assetType: string; assetId: string; userId?: string }) {
    const { assetType, assetId, userId } = body;
    
    if (!assetType || !assetId) {
      return { success: false, message: '参数不完整，需要 assetType 和 assetId' };
    }

    return this.alipayService.createPaymentByAsset(assetType, assetId, userId);
  }

  @Post('alipay/notify')
  async handleNotify(@Body() body: Record<string, any>, @Res() res: Response) {
    try {
      const result = await this.alipayService.handleNotify(body);
      res.type('text/plain').send(result);
    } catch (error) {
      console.error('[Alipay] 回调处理异常:', error);
      res.type('text/plain').send('fail');
    }
  }

  @Get('alipay/return')
  async handleReturn(@Query() query: Record<string, any>, @Res() res: Response) {
    try {
      const outTradeNo = query.out_trade_no || '';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>支付结果</title>
          <script>
            window.location.href = '/#/paymentResult?out_trade_no=${outTradeNo}';
          </script>
        </head>
        <body>
          <p>正在跳转到支付结果页面...</p>
        </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      console.error('[Alipay] 同步返回处理异常:', error);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>支付结果</title>
          <script>
            window.location.href = '/';
          </script>
        </head>
        <body>
          <p>正在跳转中...</p>
        </body>
        </html>
      `;
      res.send(html);
    }
  }

  @Get('result')
  async handleResult(@Query() query: Record<string, any>, @Res() res: Response) {
    try {
      const outTradeNo = query.out_trade_no || '';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>支付结果</title>
          <script>
            window.location.href = '/#/paymentResult?out_trade_no=${outTradeNo}';
          </script>
        </head>
        <body>
          <p>正在跳转到支付结果页面...</p>
        </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      console.error('[Alipay] 支付结果处理异常:', error);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>支付结果</title>
          <script>
            window.location.href = '/';
          </script>
        </head>
        <body>
          <p>跳转中...</p>
        </body>
        </html>
      `;
      res.send(html);
    }
  }
}
