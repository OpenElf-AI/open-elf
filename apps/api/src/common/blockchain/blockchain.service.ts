import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  /**
   * 生成新的以太坊钱包地址和私钥
   * @returns 包含地址和私钥的对象
   */
  generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * 验证以太坊地址格式是否正确
   * @param address 以太坊地址
   * @returns 是否为有效的以太坊地址
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * 使用私钥签名消息
   * @param privateKey 私钥
   * @param message 要签名的消息
   * @returns 签名结果
   */
  async signMessage(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  }

  /**
   * 验证消息签名
   * @param address 地址
   * @param message 消息
   * @param signature 签名
   * @returns 是否验证通过
   */
  verifySignature(address: string, message: string, signature: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }
}
