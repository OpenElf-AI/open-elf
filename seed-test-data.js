const { PrismaClient } = require('@open-elf/shared');

const prisma = new PrismaClient();

async function main() {
  console.log('=== 开始初始化测试数据 ===\n');

  // 清理现有数据
  console.log('1. 清理现有数据...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.agentAchievement.deleteMany();
  await prisma.agentReview.deleteMany();
  await prisma.agentFollow.deleteMany();
  await prisma.userAgent.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.userNotification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.walletRecord.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.order.deleteMany();
  await prisma.userCapabilityPackage.deleteMany();
  await prisma.capabilityPackage.deleteMany();
  await prisma.creatorAuth.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agentLevelConfig.deleteMany();

  console.log('   数据清理完成\n');

  // 创建智能体等级配置
  console.log('2. 创建智能体等级配置...');
  const levelConfigs = [
    { level: 1, expRequired: 0, title: '新手', benefits: ['基础功能'] },
    { level: 2, expRequired: 100, title: '学徒', benefits: ['基础功能', '头像上传'] },
    { level: 3, expRequired: 300, title: '熟练', benefits: ['基础功能', '头像上传', '自定义提示词'] },
    { level: 4, expRequired: 600, title: '专家', benefits: ['全部功能'] },
    { level: 5, expRequired: 1000, title: '大师', benefits: ['全部功能', '专属标识'] },
  ];
  
  for (const config of levelConfigs) {
    await prisma.agentLevelConfig.create({ data: config });
  }
  console.log(`   已创建 ${levelConfigs.length} 个等级配置\n`);

  // 创建测试用户
  console.log('3. 创建测试用户...');
  const users = [
    {
      name: '测试用户',
      email: 'test@example.com',
      phone: '13800138000',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1',
    },
    {
      name: '智能体创作者',
      email: 'creator@example.com',
      phone: '13900139000',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      verificationStatus: 'verified',
      verificationPlatform: '小红书',
      verificationUsername: 'AI达人小明',
      verificationFollowers: 50000,
    },
  ];
  
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
    console.log(`   - ${user.name} (${user.phone})`);
  }
  console.log();

  // 为用户创建钱包
  console.log('4. 创建用户钱包...');
  for (const user of createdUsers) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 1000.0,
      },
    });
  }
  console.log('   钱包创建完成\n');

  // 创建测试智能体
  console.log('5. 创建测试智能体...');
  const agents = [
    {
      name: '文案策划',
      description: '帮你写出吸引人的文案和广告语',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=copywriter',
      prompt: '你是一位专业的文案策划师，擅长撰写吸引人的广告语和营销文案。请用简洁有力的语言回答用户的问题。',
      category: '营销',
      creatorId: createdUsers[1].id,
      creatorName: createdUsers[1].name,
      creatorAvatar: createdUsers[1].avatar,
      price: 99.0,
      totalSupply: 100,
      isFeatured: true,
    },
    {
      name: '代码大师',
      description: '帮助你解决编程问题，写出高质量代码',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coder',
      prompt: '你是一位资深的软件工程师，擅长各种编程语言和技术栈。请帮助用户解决编程问题，提供高质量的代码示例。',
      category: '编程',
      creatorId: createdUsers[1].id,
      creatorName: createdUsers[1].name,
      creatorAvatar: createdUsers[1].avatar,
      price: 199.0,
      totalSupply: 50,
      isFeatured: true,
    },
    {
      name: '英语外教 Owen',
      description: '专业的英语口语陪练和语法老师',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owen',
      prompt: 'You are a professional English teacher named Owen. Help users practice English speaking, improve their grammar, and learn new vocabulary. Speak in English unless asked otherwise.',
      category: '教育',
      creatorId: createdUsers[1].id,
      creatorName: createdUsers[1].name,
      creatorAvatar: createdUsers[1].avatar,
      price: 149.0,
      totalSupply: 80,
      isFeatured: true,
    },
    {
      name: '家庭医生',
      description: '提供专业的健康咨询和医疗建议',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
      prompt: '你是一位专业的家庭医生，可以提供健康咨询和医疗建议。请注意：这只是一般性建议，不能替代专业医生的诊断。',
      category: '健康',
      creatorId: createdUsers[1].id,
      creatorName: createdUsers[1].name,
      creatorAvatar: createdUsers[1].avatar,
      price: 129.0,
      totalSupply: 60,
    },
    {
      name: 'OpenElf',
      description: '全能 AI 助手，可以帮你写作、编程、分析数据',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=openelf',
      prompt: '你是 OpenElf，一个全能的 AI 助手。你可以帮助用户写作、编程、分析数据、解答问题等。用友好和专业的态度回答用户的所有问题。',
      category: '全能',
      creatorId: createdUsers[1].id,
      creatorName: createdUsers[1].name,
      creatorAvatar: createdUsers[1].avatar,
      price: 299.0,
      totalSupply: 200,
      isFeatured: true,
    },
  ];
  
  const createdAgents = [];
  for (const agentData of agents) {
    const agent = await prisma.agent.create({ data: agentData });
    createdAgents.push(agent);
    console.log(`   - ${agent.name} (${agent.category})`);
  }
  console.log();

  // 为测试用户创建一些用户智能体
  console.log('6. 为测试用户分配智能体...');
  for (let i = 0; i < 3; i++) {
    await prisma.userAgent.create({
      data: {
        userId: createdUsers[0].id,
        agentId: createdAgents[i].id,
        agentName: createdAgents[i].name,
        agentAvatar: createdAgents[i].avatar,
        originalAgentId: createdAgents[i].id,
      },
    });
  }
  console.log('   用户智能体分配完成\n');

  // 创建一些关注关系
  console.log('7. 创建智能体关注关系...');
  for (const agent of createdAgents.slice(0, 3)) {
    await prisma.agentFollow.create({
      data: {
        userId: createdUsers[0].id,
        agentId: agent.id,
      },
    });
  }
  console.log('   关注关系创建完成\n');

  // 创建一些评价
  console.log('8. 创建智能体评价...');
  const reviews = [
    { agentId: createdAgents[0].id, userId: createdUsers[0].id, rating: 5, comment: '非常棒的文案助手！帮我写了很多好的广告语。' },
    { agentId: createdAgents[1].id, userId: createdUsers[0].id, rating: 4, comment: '代码水平很高，解决了我的问题。' },
    { agentId: createdAgents[2].id, userId: createdUsers[0].id, rating: 5, comment: 'Owen老师非常专业，我的英语进步很大！' },
  ];
  
  for (const reviewData of reviews) {
    await prisma.agentReview.create({ data: reviewData });
  }
  console.log('   评价创建完成\n');

  // 为测试用户创建通知
  console.log('9. 创建通知...');
  const notifications = [
    { type: 'system', title: '欢迎使用 OpenElf', content: '欢迎来到 OpenElf 智能体平台！开始探索各种智能体吧。' },
    { type: 'agent', title: '新智能体上架', content: '你关注的「代码大师」智能体已更新，快去看看！' },
  ];
  
  for (const notificationData of notifications) {
    const notification = await prisma.notification.create({ data: notificationData });
    await prisma.userNotification.create({
      data: {
        userId: createdUsers[0].id,
        notificationId: notification.id,
      },
    });
  }
  console.log('   通知创建完成\n');

  console.log('=== 测试数据初始化完成！ ===\n');
  console.log('📊 统计数据：');
  console.log(`   用户数: ${createdUsers.length}`);
  console.log(`   智能体数: ${createdAgents.length}`);
  console.log(`   等级配置: ${levelConfigs.length}`);
  console.log();
  console.log('🔑 测试账号：');
  console.log(`   手机号: ${createdUsers[0].phone}`);
  console.log(`   用户名: ${createdUsers[0].name}`);
  console.log();
}

main()
  .catch(e => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
