import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Modal, Descriptions, message, Space } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { userAgentApi } from '../api/client';

interface UserAgent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentCategory: string;
  originalAgentId: string;
  purchaseTime: string;
  conversationCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

const UserAgentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userAgents, setUserAgents] = useState<UserAgent[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUserAgent, setSelectedUserAgent] = useState<UserAgent | null>(null);

  const fetchUserAgents = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.pageSize };
      if (search) params.search = search;
      
      const response = await userAgentApi.getUserAgents(params);
      if (response.data.code === 0) {
        setUserAgents(response.data.data.items);
        setPagination({
          ...pagination,
          current: response.data.data.page,
          total: response.data.data.total,
        });
      }
    } catch (error) {
      message.error('获取智能体列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAgents();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchUserAgents(1);
  };

  const handleTableChange = (pag: any) => {
    fetchUserAgents(pag.current);
  };

  const handleViewDetail = (ua: UserAgent) => {
    setSelectedUserAgent(ua);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '智能体ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true,
    },
    {
      title: '智能体头像',
      dataIndex: 'agentAvatar',
      key: 'agentAvatar',
      width: 60,
      render: (avatar: string) => (
        <img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: 8 }} />
      ),
    },
    {
      title: '智能体名称',
      dataIndex: 'agentName',
      key: 'agentName',
    },
    {
      title: '分类',
      dataIndex: 'agentCategory',
      key: 'agentCategory',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: '拥有者',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: UserAgent) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: '对话次数',
      dataIndex: 'conversationCount',
      key: 'conversationCount',
    },
    {
      title: '购买时间',
      dataIndex: 'purchaseTime',
      key: 'purchaseTime',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (date?: string) => date ? new Date(date).toLocaleString() : '从未使用',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserAgent) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>智能体管理</h2>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input.Search
          placeholder="搜索智能体名称、用户姓名或邮箱"
          style={{ width: 400 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
        <Button onClick={() => fetchUserAgents(pagination.current)}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={userAgents}
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
        title="智能体详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedUserAgent && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="智能体ID">{selectedUserAgent.id}</Descriptions.Item>
            <Descriptions.Item label="智能体名称">{selectedUserAgent.agentName}</Descriptions.Item>
            <Descriptions.Item label="智能体头像">
              <img src={selectedUserAgent.agentAvatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: 8 }} />
            </Descriptions.Item>
            <Descriptions.Item label="分类">{selectedUserAgent.agentCategory}</Descriptions.Item>
            <Descriptions.Item label="原发行智能体ID">{selectedUserAgent.originalAgentId}</Descriptions.Item>
            <Descriptions.Item label="拥有者姓名">{selectedUserAgent.userName}</Descriptions.Item>
            <Descriptions.Item label="拥有者邮箱">{selectedUserAgent.userEmail}</Descriptions.Item>
            <Descriptions.Item label="拥有者用户ID">{selectedUserAgent.userId}</Descriptions.Item>
            <Descriptions.Item label="对话次数">{selectedUserAgent.conversationCount}</Descriptions.Item>
            <Descriptions.Item label="购买时间">{new Date(selectedUserAgent.purchaseTime).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="最后使用">
              {selectedUserAgent.lastUsedAt ? new Date(selectedUserAgent.lastUsedAt).toLocaleString() : '从未使用'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(selectedUserAgent.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserAgentManagement;
