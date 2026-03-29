import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { YidunService } from '../yidun/yidun.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { BlockchainService } from '../../common/blockchain/blockchain.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private yidunService: YidunService,
    @Inject(CryptoService) private cryptoService: CryptoService,
    private blockchainService: BlockchainService,
  ) {}

  async sendCode(phone: string, type: string) {
    const isPhone = /^1[3-9]\d{9}$/.test(phone);
    if (!isPhone) {
      throw new BadRequestException('请输入正确的手机号');
    }
    
    const result = await this.yidunService.sendSmsCode(phone);
    return result;
  }

  async sendCodeWithCaptcha(phone: string, captchaToken: string) {
    const isPhone = /^1[3-9]\d{9}$/.test(phone);
    if (!isPhone) {
      throw new BadRequestException('请输入正确的手机号');
    }

    const captchaResult = await this.yidunService.verifyCaptcha(captchaToken, phone);
    if (!captchaResult.valid) {
      throw new BadRequestException('请先完成行为验证');
    }

    const result = await this.yidunService.sendSmsCode(phone);
    return result;
  }

  async loginWithPhone(phone: string, code: string) {
    await this.yidunService.verifySmsCode(phone, code);

    // 加密手机号
    const encryptedPhone = this.cryptoService.encrypt(phone);

    let user = await this.prisma.user.findFirst({
      where: { phone: encryptedPhone },
    });

    if (!user) {
      // 生成区块链钱包
      const wallet = this.blockchainService.generateWallet();
      
      user = await this.prisma.user.create({
        data: {
          phone: encryptedPhone,
          name: `用户${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
          verificationStatus: 'unverified',
          blockchainAddress: wallet.address,
          blockchainPrivateKey: wallet.privateKey,
        },
      });

      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    const accessToken = this.jwtService.sign({ sub: user.id, phone: phone });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role || 'user',
        phone: phone,
        createdAt: user.createdAt.toISOString(),
        verificationStatus: user.verificationStatus || 'unverified',
      },
    };
  }

  async loginWithQuick(accessToken: string) {
    const { phone } = await this.yidunService.verifyMobileNumber(accessToken);

    // 加密手机号
    const encryptedPhone = this.cryptoService.encrypt(phone);

    let user = await this.prisma.user.findFirst({
      where: { phone: encryptedPhone },
    });

    if (!user) {
      // 生成区块链钱包
      const wallet = this.blockchainService.generateWallet();
      
      user = await this.prisma.user.create({
        data: {
          phone: encryptedPhone,
          name: `用户${phone.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
          verificationStatus: 'unverified',
          blockchainAddress: wallet.address,
          blockchainPrivateKey: wallet.privateKey,
        },
      });

      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    const token = this.jwtService.sign({ sub: user.id, phone: phone });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return {
      access_token: token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role || 'user',
        phone: phone,
        createdAt: user.createdAt.toISOString(),
        verificationStatus: user.verificationStatus || 'unverified',
      },
    };
  }

  async loginWithCode(phoneOrEmail: string, code: string) {
    const isPhone = /^1[3-9]\d{9}$/.test(phoneOrEmail);
    let user;

    if (isPhone) {
      // 加密手机号
      const encryptedPhone = this.cryptoService.encrypt(phoneOrEmail);
      user = await this.prisma.user.findFirst({
        where: { phone: encryptedPhone },
      });
    } else {
      // 加密邮箱
      const encryptedEmail = this.cryptoService.encrypt(phoneOrEmail);
      user = await this.prisma.user.findFirst({
        where: { 
          OR: [
            { email: encryptedEmail }, 
            { id: phoneOrEmail }
          ] 
        },
      });
    }

    if (!user) {
      const randomName = `用户${Math.floor(1000 + Math.random() * 9000)}`;
      
      // 生成区块链钱包
      const wallet = this.blockchainService.generateWallet();
      
      user = await this.prisma.user.create({
        data: {
          email: isPhone ? null : this.cryptoService.encrypt(phoneOrEmail),
          phone: isPhone ? this.cryptoService.encrypt(phoneOrEmail) : null,
          name: randomName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneOrEmail}`,
          role: 'user',
          verificationStatus: 'unverified',
          blockchainAddress: wallet.address,
          blockchainPrivateKey: wallet.privateKey,
        },
      });

      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: isPhone ? undefined : phoneOrEmail, phone: isPhone ? phoneOrEmail : undefined });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role || 'user',
        email: isPhone ? undefined : phoneOrEmail,
        phone: isPhone ? phoneOrEmail : undefined,
        createdAt: user.createdAt.toISOString(),
        verificationStatus: user.verificationStatus || 'unverified',
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newAccessToken = this.jwtService.sign({ sub: user.id, email: user.email, phone: user.phone });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async logout(refreshToken: string) {
    return { success: true };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }
}
