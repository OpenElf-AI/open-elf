import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('capability-packages')
@UseInterceptors(TransformInterceptor)
export class CapabilityController {
  constructor(private capabilityService: CapabilityService) {}

  @Get()
  async getPackages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.capabilityService.getPackages(
      parseInt(page),
      parseInt(limit),
      category,
      search,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyPackages(@CurrentUser() user: any) {
    return this.capabilityService.getMyPackages(user.id);
  }

  @Get(':id')
  async getPackageById(@Param('id') id: string) {
    return this.capabilityService.getPackageById(id);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard)
  async purchasePackage(@CurrentUser() user: any, @Param('id') id: string) {
    return this.capabilityService.purchasePackage(user.id, id);
  }

  @Post(':userPackageId/install')
  @UseGuards(JwtAuthGuard)
  async installPackage(
    @CurrentUser() user: any,
    @Param('userPackageId') userPackageId: string,
    @Body() body: { agent_id: string },
  ) {
    return this.capabilityService.installPackage(user.id, userPackageId, body.agent_id);
  }

  @Post(':userPackageId/uninstall')
  @UseGuards(JwtAuthGuard)
  async uninstallPackage(
    @CurrentUser() user: any,
    @Param('userPackageId') userPackageId: string,
  ) {
    return this.capabilityService.uninstallPackage(user.id, userPackageId);
  }
}
