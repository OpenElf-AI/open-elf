import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Select, Modal, Descriptions, message, Space, Switch } from 'antd';
import { SearchOutlined, EyeOutlined, StarOutlined, StarFilled, UpOutlined, DownOutlined } from '@ant-design/icons';
import { agentApi } from '../api/client';

const { Option } = Select;

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  creatorId: string;
  creatorName: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  isListed: boolean;
  isFeatured: boolean;
  conversationCount: number;
  likes: number;
  createdAt: string;
}

const AgentListingManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const fetchAgents = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pagination.pageSize };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== undefined) params.isListed = statusFilter;
      if (featuredFilter !== undefined) params.featured = featuredFilter;
      
      const response = await agentApi.getAgentsAdmin(params);
      if (response.data.code === 0) {
        setAgents(response.data.data.items);
        setPagination({
          ...pagination,
          current: response.data.data.page,
          total: response.data.data.total,
        });
      }
    } catch (error) {
      message.error('获取智能体发行列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchAgents(1);
  };

  const handleTableChange = (pag: any) => {
    fetchAgents(pag.current);
  };

  const handleViewDetail = async (agent: Agent) => {
    setSelectedAgent(agent);
    setDetailVisible(true);
  };

  const handleToggleListing = async (agent: Agent) => {
    try {
      const response = await agentApi.toggleListing(agent.id, !agent.isListed);
      if (response.data.code === 0) {
        message.success(agent.isListed ? '已下架' : '已上架');
        fetchAgents(pagination.current);
        setDetailVisible(false);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleToggleFeatured = async (agent: Agent) => {
    try {
      const response = await agentApi.toggleFeatured(agent.id, !agent.isFeatured);
      if (response.data.code === 0) {
        message.success(agent.isFeatured ? '已取消精选' : '已设为精选');
        fetchAgents(pagination.current);
        setDetailVisible(false);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchListing = async (isListed: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的智能体');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await agentApi.toggleListing(id, isListed);
      }
      message.success(`已批量${isListed ? '上架' : '下架'} ${selectedRowKeys.length} 个智能体`);
      setSelectedRowKeys([]);
      fetchAgents(pagination.current);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchFeatured = async (isFeatured: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的智能体');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await agentApi.toggleFeatured(id, isFeatured);
      }
      message.success(`已批量${isFeatured ? '设为精选' : '取消精选'} ${selectedRowKeys.length} 个智能体`);
      setSelectedRowKeys([]);
      fetchAgents(pagination.current);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusTag = (isListed: boolean) => {
    return isListed ? <Tag color="green">上架中</Tag> : <Tag color="red">已下架</Tag>;
  };

  const columns = [
    {
      title: 'ID',
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
        <img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: 8 }} />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: '创建者',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '销量',
      dataIndex: 'soldCount',
      key: 'soldCount',
    },
    {
      title: '精选',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 80,
      render: (isFeatured: boolean, record: Agent) => (
        <Button
          type="text"
          icon={isFeatured ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
          onClick={() => handleToggleFeatured(record)}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'isListed',
      key: 'isListed',
      render: (isListed: boolean) => getStatusTag(isListed),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Agent) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button 
            type="link" 
            icon={record.isListed ? <DownOutlined /> : <UpOutlined />} 
            onClick={() => handleToggleListing(record)}
          >
            {record.isListed ? '下架' : '上架'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>智能体发行管理</h2>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input.Search
          placeholder="搜索智能体名称"
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
        <Select
          placeholder="分类"
          style={{ width: 150 }}
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setPagination({ ...pagination, current: 1 });
            fetchAgents(1);
          }}
          allowClear
        >
          <Option value="通用">通用</Option>
          <Option value="教育">教育</Option>
          <Option value="娱乐">娱乐</Option>
          <Option value="工具">工具</Option>
        </Select>
        <Select
          placeholder="状态"
          style={{ width: 150 }}
          value={statusFilter === undefined ? undefined : String(statusFilter)}
          onChange={(value) => {
            setStatusFilter(value === undefined ? undefined : value === 'true');
            setPagination({ ...pagination, current: 1 });
            fetchAgents(1);
          }}
          allowClear
        >
          <Option value="true">上架中</Option>
          <Option value="false">已下架</Option>
        </Select>
        <Select
          placeholder="精选"
          style={{ width: 150 }}
          value={featuredFilter === undefined ? undefined : String(featuredFilter)}
          onChange={(value) => {
            setFeaturedFilter(value === undefined ? undefined : value === 'true');
            setPagination({ ...pagination, current: 1 });
            fetchAgents(1);
          }}
          allowClear
        >
          <Option value="true">是</Option>
          <Option value="false">否</Option>
        </Select>
        <Button onClick={() => fetchAgents(pagination.current)}>刷新</Button>
        {selectedRowKeys.length > 0 && (
          <Space style={{ marginLeft: 'auto' }}>
            <Button type="primary" onClick={() => handleBatchListing(true)}>
              批量上架
            </Button>
            <Button danger onClick={() => handleBatchListing(false)}>
              批量下架
            </Button>
            <Button onClick={() => handleBatchFeatured(true)}>
              批量设为精选
            </Button>
            <Button onClick={() => handleBatchFeatured(false)}>
              批量取消精选
            </Button>
            <Button onClick={() => setSelectedRowKeys([])}>
              取消选择
            </Button>
          </Space>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={agents}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title="智能体发行详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={selectedAgent ? [
          <Button 
            key="toggle-featured"
            onClick={() => handleToggleFeatured(selectedAgent)}
          >
            {selectedAgent.isFeatured ? '取消精选' : '设为精选'}
          </Button>,
          <Button 
            key="toggle" 
            type="primary" 
            danger={selectedAgent.isListed}
            onClick={() => handleToggleListing(selectedAgent)}
          >
            {selectedAgent.isListed ? '下架' : '上架'}
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ] : null}
        width={600}
      >
        {selectedAgent && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{selectedAgent.id}</Descriptions.Item>
            <Descriptions.Item label="名称">{selectedAgent.name}</Descriptions.Item>
            <Descriptions.Item label="头像">
              <img src={selectedAgent.avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: 8 }} />
            </Descriptions.Item>
            <Descriptions.Item label="描述">{selectedAgent.description}</Descriptions.Item>
            <Descriptions.Item label="分类">{selectedAgent.category}</Descriptions.Item>
            <Descriptions.Item label="创建者">{selectedAgent.creatorName}</Descriptions.Item>
            <Descriptions.Item label="价格">¥{selectedAgent.price}</Descriptions.Item>
            <Descriptions.Item label="总发行量">{selectedAgent.totalSupply}</Descriptions.Item>
            <Descriptions.Item label="已售数量">{selectedAgent.soldCount}</Descriptions.Item>
            <Descriptions.Item label="对话数">{selectedAgent.conversationCount}</Descriptions.Item>
            <Descriptions.Item label="点赞数">{selectedAgent.likes}</Descriptions.Item>
            <Descriptions.Item label="精选">{selectedAgent.isFeatured ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(selectedAgent.isListed)}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(selectedAgent.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AgentListingManagement;
