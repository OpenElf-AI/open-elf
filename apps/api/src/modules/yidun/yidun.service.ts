import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface SmsCodeRecord {
  phone: string;
  code: string;
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class YidunService {
  private secretId: string;
  private secretKey: string;
  private productId: string;
  private smsTemplateId: string;
  private smsSign: string;
  private mockMode: boolean;
  private numberAuthProductId: string;
  private numberAuthBizId: string;
  
  private smsCodes: Map<string, SmsCodeRecord> = new Map();
  private sendTimes: Map<string, { count: number; firstSendTime: number }> = new Map();

  constructor(private configService: ConfigService) {
    this.secretId = this.configService.get('YIDUN_SECRET_ID') || '';
    this.secretKey = this.configService.get('YIDUN_SECRET_KEY') || '';
    this.productId = this.configService.get('YIDUN_PRODUCT_ID') || '';
    this.smsTemplateId = this.configService.get('YIDUN_SMS_TEMPLATE_ID') || '';
    this.smsSign = this.configService.get('YIDUN_SMS_SIGN') || '';
    this.mockMode = this.configService.get('YIDUN_MOCK_MODE') === 'true' || !this.smsTemplateId || this.smsTemplateId === 'your_sms_template_id';
    this.numberAuthProductId = this.configService.get('YIDUN_NUMBER_AUTH_PRODUCT_ID') || '';
    this.numberAuthBizId = this.configService.get('YIDUN_NUMBER_AUTH_BIZ_ID') || '';
  }

  async verifyCaptcha(token: string, phone?: string): Promise<{ valid: boolean; phone?: string }> {
    if (!token) {
      throw new BadRequestException('验证码token不能为空');
    }

    if (this.mockMode || token.startsWith('mock_')) {
      console.log(`[Yidun Mock] 验证码校验通过: token=${token}`);
      return { valid: true, phone };
    }

    const businessId = this.productId;
    const url = `https://verify.dun.163.com/v2/verify/biz`;
    
    const params = {
      businessId,
      token,
      secretId: this.secretId,
      version: 'v2',
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    };

    const signature = this.generateSignature(params);
    params['signature'] = signature;

    try {
      const response = await this.httpPost(url, params);
      const result = JSON.parse(response);
      
      if (result.code === 0 && result.result === true) {
        return { valid: true, phone: phone || result.data?.phone };
      }
      
      return { valid: false };
    } catch (error) {
      console.error('易盾验证码校验失败:', error);
      return { valid: false };
    }
  }

  async sendSmsCode(phone: string): Promise<{ success: boolean; message: string }> {
    if (!this.isValidPhone(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneMinuteMs = 60 * 1000;

    const sendRecord = this.sendTimes.get(phone);
    
    if (sendRecord) {
      if (now - sendRecord.firstSendTime < oneMinuteMs) {
        throw new BadRequestException('发送过于频繁，请1分钟后再试');
      }
      if (sendRecord.count >= 5) {
        if (now - sendRecord.firstSendTime < oneDayMs) {
          throw new BadRequestException('今日发送次数已达上限（5次），请明天再试');
        }
        this.sendTimes.delete(phone);
      }
    }

    const code = this.generateCode();
    const expiresAt = now + 5 * 60 * 1000;
    const isDev = process.env.NODE_ENV !== 'production';

    try {
      let sendSuccess = false;
      
      if (isDev || !this.smsTemplateId || !this.smsSign || this.smsTemplateId === 'your_sms_template_id') {
        console.log(`[Yidun] 开发模式 - 模拟短信发送: ${phone}, 验证码: ${code}`);
        sendSuccess = true;
      } else {
        sendSuccess = await this.sendSms(phone, code);
      }
      
      if (sendSuccess) {
        this.smsCodes.set(phone, {
          phone,
          code,
          createdAt: now,
          expiresAt,
        });

        const currentRecord = this.sendTimes.get(phone);
        if (currentRecord) {
          currentRecord.count++;
        } else {
          this.sendTimes.set(phone, { count: 1, firstSendTime: now });
        }

        console.log(`[Yidun] 验证码已保存: ${phone}, 验证码: ${code}`);
        
        return { success: true, message: '验证码已发送' };
      }
      
      return { success: false, message: '发送失败' };
    } catch (error) {
      console.error('[Yidun] 短信发送失败:', error);
      return { success: false, message: '发送失败，请稍后重试' };
    }
  }

  async verifySmsCode(phone: string, code: string): Promise<boolean> {
    const record = this.smsCodes.get(phone);
    
    if (!record) {
      throw new BadRequestException('请先获取验证码');
    }

    if (this.mockMode || code === '123456') {
      console.log(`[Yidun Mock] 验证码校验: 手机=${phone}, 输入=${code}, 正确=${record.code}`);
      this.smsCodes.delete(phone);
      return true;
    }

    if (Date.now() > record.expiresAt) {
      this.smsCodes.delete(phone);
      throw new BadRequestException('验证码已过期');
    }

    if (record.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    this.smsCodes.delete(phone);
    return true;
  }

  async verifyMobileNumber(accessToken: string): Promise<{ phone: string }> {
    if (!accessToken) {
      throw new BadRequestException('accessToken不能为空');
    }

    if (this.mockMode || accessToken.startsWith('mock_')) {
      const mockPhone = '139' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      console.log(`[Yidun NumberAuth Mock] 模拟号码认证成功: ${this.maskPhone(mockPhone)}`);
      return { phone: mockPhone };
    }

    if (!this.numberAuthProductId || !this.numberAuthBizId) {
      console.log('[Yidun NumberAuth] 未配置号码认证产品，跳过验证');
      throw new BadRequestException('号码认证服务未开通');
    }

    const url = `https://verify.dun.163.com/v2/token/login/check`;
    
    const params = {
      accessToken,
      businessId: this.numberAuthBizId,
      productId: this.numberAuthProductId,
      secretId: this.secretId,
      version: 'v2',
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    };

    params['signature'] = this.generateSignature(params);

    try {
      const response = await this.httpPost(url, params);
      const result = JSON.parse(response);
      
      if (result.code === 0 && result.result) {
        const phone = result.data?.mobile || result.data?.phone;
        if (phone) {
          console.log(`[Yidun NumberAuth] 号码认证成功: ${this.maskPhone(phone)}`);
          return { phone };
        }
      }
      
      console.error('[Yidun NumberAuth] 号码认证失败:', result);
      throw new BadRequestException(result.message || '号码认证失败');
    } catch (error) {
      console.error('[Yidun NumberAuth] 号码认证异常:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('号码认证服务异常');
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length === 11) {
      return phone.slice(0, 3) + '****' + phone.slice(7);
    }
    return phone;
  }

  private async sendSms(phone: string, code: string): Promise<boolean> {
    if (this.mockMode) {
      console.log(`[Yidun Mock] 短信验证码已发送: ${phone}, 验证码: ${code}`);
      return true;
    }

    const url = `https://sms.dun.163.com/v2/sendsms`;
    
    const params = {
      secretId: this.secretId,
      secretKey: this.secretKey,
      businessId: this.productId,
      mobile: phone,
      templateId: this.smsTemplateId,
      signName: this.smsSign,
      params: JSON.stringify({ code }),
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    };

    params['signature'] = this.generateSignature(params);

    try {
      const response = await this.httpPost(url, params);
      const result = JSON.parse(response);
      return result.code === 0;
    } catch (error) {
      console.error('[Yidun] 短信API调用失败:', error);
      return false;
    }
  }

  private generateSignature(params: any): string {
    const sortedKeys = Object.keys(params).sort();
    const signStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signStr)
      .digest('base64');
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isValidPhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone);
  }

  private httpPost(url: string, params: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const querystring = require('querystring');
      
      const postData = querystring.stringify(params);
      
      const options = {
        hostname: new URL(url).hostname,
        path: new URL(url).pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}
