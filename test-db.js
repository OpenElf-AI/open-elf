const { PrismaClient } = require('@open-elf/shared');

const prisma = new PrismaClient();

async function main() {
  console.log('=== 查询数据库 ===\n');

  // 查询所有用户
  console.log('1. 查询所有用户:');
  const users = await prisma.user.findMany();
  console.log(`找到 ${users.length} 个用户:`);
  users.forEach(user => {
    console.log(`  - ID: ${user.id}`);
    console.log(`    名称: ${user.name}`);
    console.log(`    认证状态: ${user.verificationStatus}`);
    console.log(`    创建时间: ${user.createdAt}`);
    console.log();
  });

  // 查询所有创作者认证申请
  console.log('\n2. 查询所有创作者认证申请:');
  const creatorAuths = await prisma.creatorAuth.findMany({
    include: { user: true }
  });
  console.log(`找到 ${creatorAuths.length} 个创作者认证申请:`);
  creatorAuths.forEach(auth => {
    console.log(`  - ID: ${auth.id}`);
    console.log(`    用户: ${auth.user?.name || '未知'}`);
    console.log(`    平台: ${auth.platform}`);
    console.log(`    账号: ${auth.accountName}`);
    console.log(`    粉丝数: ${auth.fansCount}`);
    console.log(`    状态: ${auth.status}`);
    console.log(`    创建时间: ${auth.createdAt}`);
    console.log();
  });

  // 如果没有用户，创建一个测试用户
  if (users.length === 0) {
    console.log('\n3. 创建测试用户:');
    const testUser = await prisma.user.create({
      data: {
        name: '测试用户',
        email: 'test@example.com',
        phone: '13800138000',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        role: 'user',
        verificationStatus: 'unverified'
      }
    });
    console.log(`创建测试用户成功: ${testUser.name} (ID: ${testUser.id})`);

    // 为测试用户创建创作者认证申请
    console.log('\n4. 创建创作者认证申请:');
    const creatorAuth = await prisma.creatorAuth.create({
      data: {
        userId: testUser.id,
        platform: '小红书',
        accountName: '测试创作者小明',
        fansCount: 50000,
        proofUrl: 'https://www.xiaohongshu.com/user/profile/test',
        status: 'pending'
      }
    });
    console.log(`创建创作者认证申请成功: ID: ${creatorAuth.id}`);

    // 更新用户的认证状态
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        verificationStatus: 'pending',
        verificationPlatform: '小红书',
        verificationUsername: '测试创作者小明',
        verificationFollowers: 50000,
        verificationProofUrl: 'https://www.xiaohongshu.com/user/profile/test',
        verificationSubmitTime: new Date()
      }
    });
    console.log(`更新用户认证状态成功`);
  }

  // 如果有用户但没有认证申请，创建一个
  else if (creatorAuths.length === 0 && users.length > 0) {
    console.log('\n3. 为现有用户创建创作者认证申请:');
    const user = users[0];
    const creatorAuth = await prisma.creatorAuth.create({
      data: {
        userId: user.id,
        platform: '小红书',
        accountName: '测试创作者小明',
        fansCount: 50000,
        proofUrl: 'https://www.xiaohongshu.com/user/profile/test',
        status: 'pending'
      }
    });
    console.log(`创建创作者认证申请成功: ID: ${creatorAuth.id}`);

    // 更新用户的认证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: 'pending',
        verificationPlatform: '小红书',
        verificationUsername: '测试创作者小明',
        verificationFollowers: 50000,
        verificationProofUrl: 'https://www.xiaohongshu.com/user/profile/test',
        verificationSubmitTime: new Date()
      }
    });
    console.log(`更新用户认证状态成功`);
  }

  // 再次查询确认
  console.log('\n=== 最终查询结果 ===\n');
  const finalUsers = await prisma.user.findMany();
  const finalAuths = await prisma.creatorAuth.findMany({ include: { user: true } });
  
  console.log(`用户数: ${finalUsers.length}`);
  console.log(`创作者认证申请数: ${finalAuths.length}`);
  
  if (finalAuths.length > 0) {
    console.log('\n待审核的认证申请:');
    finalAuths.forEach(auth => {
      if (auth.status === 'pending') {
        console.log(`  - 用户: ${auth.user?.name || '未知'}`);
        console.log(`    平台: ${auth.platform}`);
        console.log(`    账号: ${auth.accountName}`);
        console.log(`    粉丝数: ${auth.fansCount}`);
        console.log(`    状态: ${auth.status}`);
        console.log();
      }
    });
  }
}

main()
  .catch(e => {
    console.error('错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
