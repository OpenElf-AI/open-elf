import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建管理员账户
  const adminExists = await prisma.admin.findFirst({
    where: { username: 'admin' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@openelf.com',
        password: hashedPassword,
        name: '超级管理员',
        role: 'super_admin',
        isActive: true
      }
    });
    console.log('创建管理员账户成功:', admin.username);
    console.log('登录凭证:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请在生产环境中修改此密码！');
  } else {
    console.log('管理员账户已存在');
  }

  // 创建测试用户
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

  // 生成更多用户数据
  for (let i = 4; i <= 20; i++) {
    testUsers.push({
      name: `测试用户${i}`,
      phone: `138001380${i.toString().padStart(2, '0')}`,
      email: `test${i}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=test${i}`,
    });
  }

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`创建用户: ${user.name} (${user.id})`);

      // 为测试用户1创建一个认证申请
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

      // 为测试用户2创建一个已通过的认证
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

        // 创建 CreatorUser 记录
        await prisma.creatorUser.create({
          data: {
            userId: user.id,
            isCreator: true,
          },
        });

        // 更新用户状态
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

  // 创建测试智能体
  const testAgents = [
    {
      name: '我的专属助手',
      description: '专属的AI助手，只属于你一个人',
      prompt: '你是一个友好的AI助手，乐于帮助用户解决各种问题。',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=assistant1',
      category: '助手',
      creatorId: '',
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
      creatorId: '',
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

  // 生成更多智能体数据
  const agentCategories = ['助手', '教育', '娱乐', '健康', '金融', '创意', '技术', '生活'];
  const agentNames = ['写作助手', '代码专家', '英语教师', '健康顾问', '投资顾问', '创意设计师', '技术支持', '生活助手', '旅行规划', '美食专家'];

  for (let i = 0; i < 15; i++) {
    const category = agentCategories[Math.floor(Math.random() * agentCategories.length)];
    const name = agentNames[i % agentNames.length] + (i >= agentNames.length ? ` ${i - agentNames.length + 1}` : '');
    const creatorIndex = Math.floor(Math.random() * testUsers.length);
    const creator = testUsers[creatorIndex];
    
    testAgents.push({
      name,
      description: `这是一个${category}类别的智能体，功能强大，能够帮助用户解决各种问题。`,
      prompt: `你是一个专业的${category}智能体，能够为用户提供专业、准确的${category}相关信息和建议。`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=agent${i + 3}`,
      category,
      creatorId: '',
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      price: Math.floor(Math.random() * 50) + 5,
      totalSupply: Math.floor(Math.random() * 100) + 50,
      soldCount: Math.floor(Math.random() * 30),
      isListed: Math.random() > 0.2,
      isFeatured: Math.random() > 0.8,
      level: Math.floor(Math.random() * 3) + 1,
      exp: Math.floor(Math.random() * 100),
      expToNextLevel: 100,
      fans: Math.floor(Math.random() * 50),
    });
  }

  // 获取测试用户ID来作为创建者
  const userMap = new Map<string, string>();
  for (const userData of testUsers) {
    const user = await prisma.user.findUnique({ where: { phone: userData.phone } });
    if (user) {
      userMap.set(userData.name, user.id);
    }
  }

  // 设置所有智能体的创建者ID
  for (const agent of testAgents) {
    const creatorId = userMap.get(agent.creatorName);
    if (creatorId) {
      agent.creatorId = creatorId;
    }
  }

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

  // 创建用户成就
  if (user1) {
    const achievements = [
      {
        achievementId: 'first_follow',
        title: '初次关注',
        description: '关注了第一个用户',
        iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=follow',
      },
      {
        achievementId: 'first_review',
        title: '初次评价',
        description: '发表了第一个评价',
        iconUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=star',
      },
    ];

    for (const achievement of achievements) {
      const existingAchievement = await prisma.userAchievement.findFirst({
        where: { userId: user1.id, achievementId: achievement.achievementId },
      });
      if (!existingAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId: user1.id,
            ...achievement,
          },
        });
        console.log(`用户 ${user1.name} 解锁了成就: ${achievement.title}`);
      }
    }
  }

  // 创建用户等级配置
  const levelConfigs = [
    { level: 1, expRequired: 0, title: '新手', benefits: ['基础功能'] },
    { level: 2, expRequired: 100, title: '学徒', benefits: ['基础功能', '创建1个智能体'] },
    { level: 3, expRequired: 300, title: '创作者', benefits: ['基础功能', '创建3个智能体'] },
    { level: 4, expRequired: 600, title: '专家', benefits: ['全部功能', '创建5个智能体'] },
    { level: 5, expRequired: 1000, title: '大师', benefits: ['全部功能', '无限创建智能体'] },
  ];

  for (const config of levelConfigs) {
    const existingConfig = await prisma.userLevelConfig.findUnique({
      where: { level: config.level },
    });
    if (!existingConfig) {
      await prisma.userLevelConfig.create({
        data: config,
      });
      console.log(`创建等级配置: Lv.${config.level} - ${config.title}`);
    }
  }

  // 创建测试订单数据
  const createdOrders = [];
  const users = await prisma.user.findMany();
  const agents = await prisma.agent.findMany({ where: { isListed: true, price: { gt: 0 } } });

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const status = Math.random() > 0.3 ? 'completed' : 'pending';
    const createTime = new Date();
    createTime.setDate(createTime.getDate() - Math.floor(Math.random() * 30));
    
    const order = await prisma.order.create({
      data: {
        outTradeNo: `ORDER${Date.now()}_${i}`,
        userId: user.id,
        totalAmount: agent.price,
        subject: `购买智能体：${agent.name}`,
        status,
        createTime,
        payTime: status === 'completed' ? createTime : null,
        payType: 'alipay',
        assetType: 'agent',
        assetId: agent.id,
        assetName: agent.name,
        sellerId: agent.creatorId,
      },
    });
    
    createdOrders.push(order);
    console.log(`创建订单: ${order.outTradeNo} - ${order.status}`);
  }

  // 创建测试交易记录
  for (const order of createdOrders) {
    if (order.status === 'completed') {
      await prisma.transaction.create({
        data: {
          type: 'purchase',
          assetType: 'agent',
          assetId: order.assetId || '',
          assetName: order.assetName || '',
          buyerId: order.userId,
          sellerId: order.sellerId || '',
          amount: order.totalAmount || 0,
          serviceFee: (order.totalAmount || 0) * 0.1,
          sellerReceived: (order.totalAmount || 0) * 0.9,
        },
      });
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
