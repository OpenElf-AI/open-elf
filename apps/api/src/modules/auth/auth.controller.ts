
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body() body: { phone: string; type?: string; captchaToken?: string }) {
    if (body.captchaToken) {
      return this.authService.sendCodeWithCaptcha(body.phone, body.captchaToken);
    }
    return this.authService.sendCode(body.phone, body.type || 'login');
  }

  @Post('login/phone')
  async loginWithPhone(@Body() body: { phone: string; code: string }) {
    return this.authService.loginWithPhone(body.phone, body.code);
  }

  @Post('login/quick')
  async loginWithQuick(@Body() body: { accessToken: string }) {
    return this.authService.loginWithQuick(body.accessToken);
  }

  @Post('login-with-code')
  async loginWithCode(@Body() body: { phoneOrEmail?: string; phone?: string; code: string }) {
    const identifier = body.phoneOrEmail || body.phone;
    return this.authService.loginWithCode(identifier, body.code);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    return this.authService.logout(body.refresh_token);
  }
}
