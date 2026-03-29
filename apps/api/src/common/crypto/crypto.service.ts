import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    // 从环境变量获取密钥和初始化向量
    const secretKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    const ivKey = process.env.ENCRYPTION_IV || 'default-iv-change-in-production';

    // 确保密钥长度为32字节（256位）
    this.key = Buffer.from(crypto.createHash('sha256').update(secretKey).digest());
    // 确保初始化向量长度为16字节（128位）
    this.iv = Buffer.from(crypto.createHash('md5').update(ivKey).digest()).slice(0, 16);
  }

  /**
   * 加密数据
   * @param data 要加密的数据
   * @returns 加密后的数据（Base64编码）
   */
  encrypt(data: string): string {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      this.logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * 解密数据
   * @param encryptedData 加密的数据（Base64编码）
   * @returns 解密后的数据
   */
  decrypt(encryptedData: string): string {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 生成随机密钥
   * @param length 密钥长度
   * @returns 随机密钥
   */
  generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 哈希数据（用于密码等不需要解密的数据）
   * @param data 要哈希的数据
   * @returns 哈希后的数据
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 生成HMAC（用于数据完整性验证）
   * @param data 要生成HMAC的数据
   * @returns HMAC值
   */
  generateHmac(data: string): string {
    return crypto.createHmac('sha256', this.key).update(data).digest('hex');
  }

  /**
   * 验证HMAC（用于数据完整性验证）
   * @param data 原始数据
   * @param hmac 要验证的HMAC值
   * @returns 是否验证通过
   */
  verifyHmac(data: string, hmac: string): boolean {
    const generatedHmac = this.generateHmac(data);
    return crypto.timingSafeEqual(Buffer.from(generatedHmac), Buffer.from(hmac));
  }
}
