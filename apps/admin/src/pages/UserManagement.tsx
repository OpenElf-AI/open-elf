import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { userApi } from '../api/client';

const { Option } = Select;

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.pageSize };
      if (search) params.search = search;
      if (statusFilter) params.verificationStatus = statusFilter;
      
      const response = await userApi.getUsers(params);
      if (response.data.code === 0) {
        setUsers(response.data.data.items);
        setPagination({
          ...pagination,
          current: response.data.data.page,
          total: response.data.data.total,
        });
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchUsers(1);
  };

  const handleTableChange = (pag: any) => {
    fetchUsers(pag.current);
  };

  const handleViewDetail = async (user: any) => {
    try {
      const response = await userApi.getUserById(user.id);
      if (response.data.code === 0) {
        setSelectedUser(response.data.data);
        setDetailVisible(true);
      }
    } catch (error) {
      message.error('获取用户详情失败');
    }
  };

  const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await userApi.verifyUser(userId, status);
      if (response.data.code === 0) {
        message.success(status === 'verified' ? '已通过审核' : '已拒绝');
        fetchUsers(pagination.current);
        setDetailVisible(false);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      unverified: { color: 'default', text: '未认证' },
      pending: { color: 'orange', text: '待审核' },
      verified: { color: 'green', text: '已认证' },
      rejected: { color: 'red', text: '已拒绝' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar: string) => (
        <img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      ),
    },
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '认证状态',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.verificationStatus === 'pending' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleVerify(record.id, 'verified')}>
                通过
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleVerify(record.id, 'rejected')}>
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>用户管理</h2>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input.Search
          placeholder="搜索用户ID/邮箱/手机号"
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
        <Select
          placeholder="认证状态"
          style={{ width: 150 }}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPagination({ ...pagination, current: 1 });
            fetchUsers(1);
          }}
          allowClear
        >
          <Option value="unverified">未认证</Option>
          <Option value="pending">待审核</Option>
          <Option value="verified">已认证</Option>
          <Option value="rejected">已拒绝</Option>
        </Select>
        <Button onClick={() => fetchUsers(pagination.current)}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={selectedUser?.verificationStatus === 'pending' ? [
          <Button key="reject" danger onClick={() => handleVerify(selectedUser.id, 'rejected')}>
            拒绝
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleVerify(selectedUser.id, 'verified')}>
            通过
          </Button>,
        ] : null}
        width={600}
      >
        {selectedUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="用户ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="昵称">{selectedUser.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="头像">
              <img src={selectedUser.avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: '50%' }} />
            </Descriptions.Item>
            <Descriptions.Item label="认证状态">{getStatusTag(selectedUser.verificationStatus)}</Descriptions.Item>
            <Descriptions.Item label="认证平台">{selectedUser.verificationPlatform || '-'}</Descriptions.Item>
            <Descriptions.Item label="认证用户名">{selectedUser.verificationUsername || '-'}</Descriptions.Item>
            <Descriptions.Item label="粉丝数">{selectedUser.verificationFollowers || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {selectedUser.verificationSubmitTime ? new Date(selectedUser.verificationSubmitTime).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">{new Date(selectedUser.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
