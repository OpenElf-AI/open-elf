import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, UseInterceptors, SetMetadata } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('agents')
@UseInterceptors(TransformInterceptor, AuditInterceptor)
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  async getAgents(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ) {
    return this.agentService.getAgents(
      parseInt(page),
      parseInt(limit),
      category,
      search,
      featured === 'true',
    );
  }

  @Get('admin/all')
  @SetMetadata('module', 'agent')
  @SetMetadata('action', 'admin-list')
  async getAgentsAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('isListed') isListed?: string,
  ) {
    return this.agentService.getAgentsAdmin(
      parseInt(page),
      parseInt(limit),
      category,
      search,
      featured !== undefined ? featured === 'true' : undefined,
      isListed !== undefined ? isListed === 'true' : undefined,
    );
  }

  @Post(':id/toggle-listing')
  @SetMetadata('module', 'agent')
  @SetMetadata('action', 'toggle-listing')
  async toggleListing(
    @Param('id') id: string,
    @Body() body: { isListed: boolean },
  ) {
    return this.agentService.toggleListing(id, body.isListed);
  }

  @Post(':id/toggle-featured')
  @SetMetadata('module', 'agent')
  @SetMetadata('action', 'toggle-featured')
  async toggleFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.agentService.toggleFeatured(id, body.isFeatured);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyAgents(@CurrentUser() user: any) {
    return this.agentService.getMyAgents(user.id);
  }

  @Get(':id')
  async getAgentById(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.agentService.getAgentById(id, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAgent(@CurrentUser() user: any, @Body() data: any) {
    return this.agentService.createAgent(user.id, data);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@CurrentUser() user: any, @Param('id') id: string) {
    return this.agentService.toggleFavorite(user.id, id);
  }

  @Post(':id/toggle-showcase')
  @UseGuards(JwtAuthGuard)
  async toggleShowcase(@CurrentUser() user: any, @Param('id') id: string) {
    return this.agentService.toggleShowcase(user.id, id);
  }

  @Post(':id/add-exp')
  @UseGuards(JwtAuthGuard)
  async addExp(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { exp_amount: number }) {
    return this.agentService.addExp(user.id, id, body.exp_amount);
  }

  @Post(':id/test')
  @UseGuards(JwtAuthGuard)
  async testAgent(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { message: string }) {
    return this.agentService.testAgent(user.id, id, body.message);
  }

  @Get(':id/preview')
  async previewAgent(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.agentService.previewAgent(id, user?.id);
  }
}
