import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LLMConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfigs(userId: string) {
    const configs = await this.prisma.lLMConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return configs.map(config => ({
      id: config.id,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      isDefault: config.isDefault,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }));
  }

  async createConfig(
    userId: string,
    data: {
      provider: string;
      model: string;
      apiKey?: string;
      baseUrl?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const count = await this.prisma.lLMConfig.count({ where: { userId } });
    const isDefault = count === 0;

    const config = await this.prisma.lLMConfig.create({
      data: {
        userId,
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        isDefault,
      },
    });

    return {
      id: config.id,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      isDefault: config.isDefault,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  async updateConfig(
    userId: string,
    configId: string,
    data: {
      provider?: string;
      model?: string;
      apiKey?: string;
      baseUrl?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const config = await this.prisma.lLMConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    if (config.userId !== userId) {
      throw new ForbiddenException('无权修改此配置');
    }

    const updated = await this.prisma.lLMConfig.update({
      where: { id: configId },
      data,
    });

    return {
      id: updated.id,
      provider: updated.provider,
      model: updated.model,
      baseUrl: updated.baseUrl,
      temperature: updated.temperature,
      maxTokens: updated.maxTokens,
      isDefault: updated.isDefault,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteConfig(userId: string, configId: string) {
    const config = await this.prisma.lLMConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    if (config.userId !== userId) {
      throw new ForbiddenException('无权删除此配置');
    }

    await this.prisma.lLMConfig.delete({
      where: { id: configId },
    });

    return { success: true };
  }

  async setDefaultConfig(userId: string, configId: string) {
    const config = await this.prisma.lLMConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    if (config.userId !== userId) {
      throw new ForbiddenException('无权修改此配置');
    }

    await this.prisma.lLMConfig.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await this.prisma.lLMConfig.update({
      where: { id: configId },
      data: { isDefault: true },
    });

    return {
      id: updated.id,
      provider: updated.provider,
      model: updated.model,
      baseUrl: updated.baseUrl,
      temperature: updated.temperature,
      maxTokens: updated.maxTokens,
      isDefault: updated.isDefault,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async getDefaultConfig(userId: string) {
    const config = await this.prisma.lLMConfig.findFirst({
      where: { userId, isDefault: true },
    });

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      isDefault: config.isDefault,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}
