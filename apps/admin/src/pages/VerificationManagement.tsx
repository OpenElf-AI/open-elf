import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Descriptions, message, Card, Row, Col, Statistic, Space, Input } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { creatorApi, dashboardApi } from '../api/client';

const VerificationManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const [listResponse, allResponse] = await Promise.all([
        creatorApi.getList(filterStatus === 'all' ? undefined : filterStatus),
        creatorApi.getList('all'),
      ]);
      
      if (listResponse.data) {
        setVerifications(listResponse.data || []);
      }
      
      if (allResponse.data) {
        const allAuths = allResponse.data || [];
        setStats({
          pending: allAuths.filter((a: any) => a.status === 'pending').length,
          verified: allAuths.filter((a: any) => a.status === 'pass').length,
          rejected: allAuths.filter((a: any) => a.status === 'reject').length,
        });
      }
    } catch (error) {
      message.error('获取认证列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [filterStatus]);

  const handleVerify = async (authId: string, status: 'pass' | 'reject') => {
    try {
      if (status === 'reject' && !rejectReason.trim()) {
        message.error('驳回申请必须填写原因');
        return;
      }
      
      const response = await creatorApi.audit(authId, status, status === 'reject' ? rejectReason : undefined);
      if (response.data.success) {
        message.success(status === 'pass' ? '已通过认证' : '已拒绝认证');
        fetchVerifications();
        setDetailVisible(false);
        setRejectReason('');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleViewDetail = async (auth: any) => {
    setSelectedAuth(auth);
    setRejectReason('');
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true,
    },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          {record.user?.avatar && (
            <img src={record.user.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          )}
          <span>{record.user?.name || '-'}</span>
        </Space>
      ),
    },
    {
      title: '认证平台',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: '账号名称',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: '粉丝数',
      dataIndex: 'fansCount',
      key: 'fansCount',
      render: (count: number) => count?.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'gold',
          pass: 'green',
          reject: 'red',
        };
        const textMap: Record<string, string> = {
          pending: '待审核',
          pass: '已通过',
          reject: '已拒绝',
        };
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => handleVerify(record.id, 'pass')}>
                通过
              </Button>
              <Button danger icon={<CloseOutlined />} onClick={() => {
                setSelectedAuth(record);
                setDetailVisible(true);
              }}>
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
      <h2 style={{ marginBottom: 16 }}>创作者认证管理</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.verified}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type={filterStatus === 'pending' ? 'primary' : 'default'} onClick={() => setFilterStatus('pending')}>
            待审核
          </Button>
          <Button type={filterStatus === 'pass' ? 'primary' : 'default'} onClick={() => setFilterStatus('pass')}>
            已通过
          </Button>
          <Button type={filterStatus === 'reject' ? 'primary' : 'default'} onClick={() => setFilterStatus('reject')}>
            已拒绝
          </Button>
          <Button type={filterStatus === 'all' ? 'primary' : 'default'} onClick={() => setFilterStatus('all')}>
            全部
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={verifications}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="认证申请详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setRejectReason('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setDetailVisible(false);
            setRejectReason('');
          }}>
            取消
          </Button>,
          <Button key="reject" danger onClick={() => selectedAuth && handleVerify(selectedAuth.id, 'reject')}>
            拒绝
          </Button>,
          <Button key="approve" type="primary" onClick={() => selectedAuth && handleVerify(selectedAuth.id, 'pass')}>
            通过
          </Button>,
        ]}
        width={600}
      >
        {selectedAuth && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="申请ID">{selectedAuth.id}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{selectedAuth.userId}</Descriptions.Item>
              <Descriptions.Item label="用户昵称">{selectedAuth.user?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户头像">
                {selectedAuth.user?.avatar && (
                  <img src={selectedAuth.user.avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: '50%' }} />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="认证平台">{selectedAuth.platform}</Descriptions.Item>
              <Descriptions.Item label="账号名称">{selectedAuth.accountName}</Descriptions.Item>
              <Descriptions.Item label="粉丝数">{selectedAuth.fansCount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="证明材料">
                <a href={selectedAuth.proofUrl} target="_blank" rel="noopener noreferrer">
                  查看证明材料
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedAuth.status === 'pending' ? 'gold' : selectedAuth.status === 'pass' ? 'green' : 'red'}>
                  {selectedAuth.status === 'pending' ? '待审核' : selectedAuth.status === 'pass' ? '已通过' : '已拒绝'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {selectedAuth.createdAt ? new Date(selectedAuth.createdAt).toLocaleString() : '-'}
              </Descriptions.Item>
              {selectedAuth.auditTime && (
                <Descriptions.Item label="审核时间">
                  {new Date(selectedAuth.auditTime).toLocaleString()}
                </Descriptions.Item>
              )}
              {selectedAuth.rejectReason && (
                <Descriptions.Item label="驳回原因">
                  {selectedAuth.rejectReason}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedAuth.status === 'pending' && (
              <div>
                <h4 style={{ marginBottom: 8 }}>驳回原因（如选择拒绝）</h4>
                <Input.TextArea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VerificationManagement;
