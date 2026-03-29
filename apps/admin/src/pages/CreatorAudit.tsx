import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, message, Select, Space, Card, Spin } from 'antd';
import { creatorApi } from '../api/client';

const { TextArea } = Input;

interface CreatorAuth {
  id: string;
  userId: string;
  platform: string;
  accountName: string;
  fansCount: number;
  proofUrl: string;
  status: string;
  rejectReason?: string;
  createdAt: string;
  auditTime?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function CreatorAudit() {
  const [list, setList] = useState<CreatorAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; reason: string }>({
    open: false,
    id: '',
    reason: '',
  });
  const [proofModal, setProofModal] = useState<{ open: boolean; url: string }>({
    open: false,
    url: '',
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [batchRejectModal, setBatchRejectModal] = useState<{ open: boolean; reason: string }>({
    open: false,
    reason: '',
  });

  useEffect(() => {
    fetchList();
  }, [filter]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await creatorApi.getList(filter === 'all' ? undefined : filter);
      setList(res.data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      message.error(err.response?.data?.message || '获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePass = async (id: string) => {
    try {
      await creatorApi.audit(id, 'pass');
      message.success('审核通过');
      fetchList();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    try {
      await creatorApi.audit(rejectModal.id, 'reject', rejectModal.reason);
      message.success('已驳回');
      setRejectModal({ open: false, id: '', reason: '' });
      fetchList();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleBatchPass = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的项目');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await creatorApi.audit(id, 'pass');
      }
      message.success(`已批量通过 ${selectedRowKeys.length} 个项目`);
      setSelectedRowKeys([]);
      fetchList();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleBatchReject = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的项目');
      return;
    }
    if (!batchRejectModal.reason.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await creatorApi.audit(id, 'reject', batchRejectModal.reason);
      }
      message.success(`已批量驳回 ${selectedRowKeys.length} 个项目`);
      setBatchRejectModal({ open: false, reason: '' });
      setSelectedRowKeys([]);
      fetchList();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '审核中', color: 'orange' },
    pass: { label: '已通过', color: 'green' },
    reject: { label: '已驳回', color: 'red' },
  };

  const platformMap: Record<string, string> = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    bilibili: 'B站',
    weibo: '微博',
    other: '其他',
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: CreatorAuth) => record.user?.name || record.userId.slice(0, 8) + '...',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => platformMap[platform] || platform,
    },
    {
      title: '账号',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: '粉丝数',
      dataIndex: 'fansCount',
      key: 'fansCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '证明链接',
      dataIndex: 'proofUrl',
      key: 'proofUrl',
      render: (url: string) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => setProofModal({ open: true, url })}
        >
          查看
        </Button>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CreatorAuth) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => handlePass(record.id)}>
                通过
              </Button>
              <Button type="link" size="small" danger onClick={() => setRejectModal({ open: true, id: record.id, reason: '' })}>
                驳回
              </Button>
            </>
          )}
          {record.status === 'reject' && record.rejectReason && (
            <span style={{ color: '#999', fontSize: 12 }}>原因: {record.rejectReason}</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, minHeight: '100vh' }}>
      <Card title="创作者审核" style={{ background: '#fff' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>审核列表</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: 120 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '审核中', value: 'pending' },
                { label: '已通过', value: 'pass' },
                { label: '已驳回', value: 'reject' },
              ]}
            />
            {selectedRowKeys.length > 0 && (
              <Space>
                <Button type="primary" onClick={handleBatchPass}>
                  批量通过
                </Button>
                <Button danger onClick={() => setBatchRejectModal({ open: true, reason: '' })}>
                  批量驳回
                </Button>
                <Button onClick={() => setSelectedRowKeys([])}>
                  取消选择
                </Button>
              </Space>
            )}
          </div>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={list}
            rowKey="id"
            locale={{ emptyText: '暂无数据' }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: record.status !== 'pending',
              }),
            }}
          />
        </Spin>

        <Modal
          title="驳回原因"
          open={rejectModal.open}
          onOk={handleReject}
          onCancel={() => setRejectModal({ open: false, id: '', reason: '' })}
          okText="确认驳回"
          okButtonProps={{ danger: true }}
        >
          <TextArea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            placeholder="请输入驳回原因（必填）"
            rows={4}
          />
        </Modal>

        <Modal
          title="证明链接"
          open={proofModal.open}
          onCancel={() => setProofModal({ open: false, url: '' })}
          footer={[
            <Button key="close" onClick={() => setProofModal({ open: false, url: '' })}>
              关闭
            </Button>,
            <Button key="open" type="primary" onClick={() => window.open(proofModal.url, '_blank')}>
              在新窗口打开
            </Button>,
          ]}
          width={800}
        >
          <div style={{ marginBottom: 16 }}>
            <p><strong>链接地址：</strong></p>
            <a href={proofModal.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
              {proofModal.url}
            </a>
          </div>
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 4, height: 400, overflow: 'hidden' }}>
            <iframe 
              src={proofModal.url} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="证明内容"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </Modal>

        <Modal
          title={`批量驳回（共 ${selectedRowKeys.length} 项）`}
          open={batchRejectModal.open}
          onOk={handleBatchReject}
          onCancel={() => setBatchRejectModal({ open: false, reason: '' })}
          okText="确认驳回"
          okButtonProps={{ danger: true }}
        >
          <TextArea
            value={batchRejectModal.reason}
            onChange={(e) => setBatchRejectModal({ ...batchRejectModal, reason: e.target.value })}
            placeholder="请输入驳回原因（必填）"
            rows={4}
          />
          <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
            此原因将应用于所有选中的项目
          </div>
        </Modal>
      </Card>
    </div>
  );
}
