import { Table, Tag, Space, Button } from 'antd';

const Users = () => {
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'creator' ? 'blue' : 'green'}>
          {role === 'admin' ? '管理员' : role === 'creator' ? '创作者' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '认证状态',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status: string) => (
        <Tag color={status === 'verified' ? 'green' : status === 'pending' ? 'orange' : 'default'}>
          {status === 'verified' ? '已认证' : status === 'pending' ? '待审核' : '未认证'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">查看</Button>
          <Button type="link">编辑</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      id: '1',
      name: '张三',
      phone: '138****0001',
      role: 'user',
      verificationStatus: 'verified',
      createdAt: '2024-01-01',
    },
    {
      key: '2',
      id: '2',
      name: '李四',
      phone: '138****0002',
      role: 'creator',
      verificationStatus: 'pending',
      createdAt: '2024-01-02',
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Users;
