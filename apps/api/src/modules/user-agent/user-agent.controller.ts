import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { UserAgentService } from './user-agent.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('user-agents')
@UseInterceptors(TransformInterceptor)
export class UserAgentController {
  constructor(private userAgentService: UserAgentService) {}

  @Get()
  async getUserAgents(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.userAgentService.getUserAgents(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }
}
