const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  const testUsers = [
    {
      name: '测试用户1',
      phone: '13800138001',
      email: 'test1@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1',
    },
    {
      name: '测试用户2',
      phone: '13800138002',
      email: 'test2@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2',
    },
    {
      name: '测试用户3',
      phone: '13800138003',
      email: 'test3@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test3',
    },
  ];

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`创建用户: ${user.name} (${user.id})`);

      if (userData.phone === '13800138001') {
        await prisma.creatorAuth.create({
          data: {
            userId: user.id,
            platform: '小红书',
            accountName: '测试创作者小红',
            fansCount: 15000,
            proofUrl: 'https://example.com/proof',
            status: 'pending',
          },
        });
        console.log(`为用户 ${user.name} 创建了认证申请`);
      }

      if (userData.phone === '13800138002') {
        const auth = await prisma.creatorAuth.create({
          data: {
            userId: user.id,
            platform: '抖音',
            accountName: '测试创作者小抖',
            fansCount: 25000,
            proofUrl: 'https://example.com/proof2',
            status: 'pass',
            auditTime: new Date(),
          },
        });

        await prisma.creatorUser.create({
          data: {
            userId: user.id,
            isCreator: true,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationStatus: 'verified',
            verificationPlatform: '抖音',
            verificationUsername: '测试创作者小抖',
            verificationFollowers: 25000,
            verificationProofUrl: 'https://example.com/proof2',
            verificationSubmitTime: new Date(Date.now() - 86400000 * 3),
          },
        });
        console.log(`用户 ${user.name} 已成为认证创作者`);
      }
    }
  }

  const user2 = await prisma.user.findUnique({ where: { phone: '13800138002' } });
  const user3 = await prisma.user.findUnique({ where: { phone: '13800138003' } });

  const testAgents = [
    {
      name: '我的专属助手',
      description: '专属的AI助手，只属于你一个人',
      prompt: '你是一个友好的AI助手，乐于帮助用户解决各种问题。',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=assistant1',
      category: '助手',
      creatorId: user2 ? user2.id : '',
      creatorName: '测试用户2',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2',
      price: 0,
      totalSupply: 0,
      isListed: false,
      level: 2,
      exp: 50,
      expToNextLevel: 100,
      fans: 12,
    },
    {
      name: '已购公开智能体',
      description: '已购买并设置公开对话的智能体',
      prompt: '你是一个专业的顾问，提供专业、准确的建议和信息。',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=public1',
      category: '公开',
      creatorId: user3 ? user3.id : '',
      creatorName: '测试用户3',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test3',
      price: 9.9,
      totalSupply: 100,
      soldCount: 5,
      isListed: true,
      isFeatured: true,
      level: 1,
      exp: 20,
      expToNextLevel: 100,
      fans: 5,
    },
  ];

  const createdAgents = [];
  for (const agentData of testAgents) {
    const existingAgent = await prisma.agent.findFirst({
      where: { name: agentData.name },
    });

    if (!existingAgent) {
      const agent = await prisma.agent.create({
        data: agentData,
      });
      console.log(`创建智能体: ${agent.name} (${agent.id})`);
      createdAgents.push(agent);
    } else {
      createdAgents.push(existingAgent);
    }
  }

  // 跳过用户关注关系创建，因为没有定义Follow模型
  const user1 = await prisma.user.findUnique({ where: { phone: '13800138001' } });

  // 创建智能体评价
  if (user1 && createdAgents.length > 0) {
    for (let i = 0; i < createdAgents.length; i++) {
      const agent = createdAgents[i];
      const existingReview = await prisma.agentReview.findFirst({
        where: { agentId: agent.id, userId: user1.id },
      });
      if (!existingReview) {
        await prisma.agentReview.create({
          data: {
            agentId: agent.id,
            userId: user1.id,
            rating: i === 0 ? 5 : 4,
            comment: i === 0 ? '非常好用的智能体！' : '还不错，功能挺实用的',
          },
        });
        console.log(`用户 ${user1.name} 评价了智能体 ${agent.name}`);
      }
    }
  }

  // 跳过用户成就创建，因为没有定义UserAchievement模型

  // 创建智能体等级配置
  const levelConfigs = [
    { level: 1, expRequired: 0, title: '新手', benefits: ['基础功能'] },
    { level: 2, expRequired: 100, title: '学徒', benefits: ['基础功能', '创建1个智能体'] },
    { level: 3, expRequired: 300, title: '创作者', benefits: ['基础功能', '创建3个智能体'] },
    { level: 4, expRequired: 600, title: '专家', benefits: ['全部功能', '创建5个智能体'] },
    { level: 5, expRequired: 1000, title: '大师', benefits: ['全部功能', '无限创建智能体'] },
  ];

  for (const config of levelConfigs) {
    const existingConfig = await prisma.agentLevelConfig.findUnique({
      where: { level: config.level },
    });
    if (!existingConfig) {
      await prisma.agentLevelConfig.create({
        data: config,
      });
      console.log(`创建等级配置: Lv.${config.level} - ${config.title}`);
    }
  }

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
