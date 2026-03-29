import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, message, Select, Space, Card, Spin, Pagination } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { orderApi } from '../api/client';

const { Option } = Select;

interface OrderStatus {
  id?: string;
  outTradeNo: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  status: 'pending' | 'paid' | 'failed' | 'timeout';
  totalAmount: number;
  subject: string;
  createTime: Date;
  payTime?: Date;
  payType?: string;
  assetType?: string;
  assetId?: string;
  assetName?: string;
  sellerId?: string;
}

export default function OrderManagement() {
  const [list, setList] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [detailModal, setDetailModal] = useState<{ open: boolean; order: OrderStatus | null }>({
    open: false,
    order: null,
  });

  useEffect(() => {
    fetchList();
  }, [page, pageSize, statusFilter]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getList({
        page,
        limit: pageSize,
        status: statusFilter || undefined,
      });
      setList(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err: any) {
      console.error('Fetch error:', err);
      message.error(err.response?.data?.message || '获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: OrderStatus) => {
    setDetailModal({ open: true, order });
  };

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待支付', color: 'orange' },
    paid: { label: '已支付', color: 'green' },
    failed: { label: '支付失败', color: 'red' },
    timeout: { label: '已超时', color: 'default' },
  };

  const payTypeMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'outTradeNo',
      key: 'outTradeNo',
      width: 200,
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (_: any, record: OrderStatus) => (
        <div>
          <div>{record.user?.name || record.user?.phone || '-'}</div>
          {record.user?.email && <div style={{ fontSize: 12, color: '#999' }}>{record.user.email}</div>}
        </div>
      ),
    },
    {
      title: '商品',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => <span style={{ fontWeight: 500 }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      key: 'payType',
      width: 100,
      render: (payType: string) => payTypeMap[payType] || payType || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 160,
      render: (date: Date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: OrderStatus) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, minHeight: '100vh' }}>
      <Card title="订单管理" style={{ background: '#fff' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            placeholder="订单状态"
            value={statusFilter || undefined}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="pending">待支付</Option>
            <Option value="paid">已支付</Option>
            <Option value="failed">支付失败</Option>
            <Option value="timeout">已超时</Option>
          </Select>
          <Input
            placeholder="搜索订单号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            搜索
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={list}
            rowKey="outTradeNo"
            pagination={false}
            locale={{ emptyText: '暂无订单数据' }}
            scroll={{ x: 1200 }}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(newPage, newPageSize) => {
                setPage(newPage);
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                  setPage(1);
                }
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </Spin>

        <Modal
          title="订单详情"
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false, order: null })}
          footer={[
            <Button key="close" onClick={() => setDetailModal({ open: false, order: null })}>
              关闭
            </Button>,
          ]}
          width={600}
        >
          {detailModal.order && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  基本信息
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><strong>订单号：</strong><span style={{ fontFamily: 'monospace' }}>{detailModal.order.outTradeNo}</span></div>
                  <div><strong>状态：</strong>
                    <Tag color={statusMap[detailModal.order.status]?.color}>
                      {statusMap[detailModal.order.status]?.label}
                    </Tag>
                  </div>
                  <div><strong>商品：</strong>{detailModal.order.subject}</div>
                  <div><strong>金额：</strong><span style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 500 }}>¥{detailModal.order.totalAmount.toFixed(2)}</span></div>
                  <div><strong>支付方式：</strong>{payTypeMap[detailModal.order.payType || ''] || detailModal.order.payType || '-'}</div>
                  <div><strong>创建时间：</strong>{new Date(detailModal.order.createTime).toLocaleString('zh-CN')}</div>
                  {detailModal.order.payTime && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>支付时间：</strong>{new Date(detailModal.order.payTime).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                  用户信息
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><strong>用户ID：</strong>{detailModal.order.user?.id || '-'}</div>
                  <div><strong>姓名：</strong>{detailModal.order.user?.name || '-'}</div>
                  <div><strong>手机号：</strong>{detailModal.order.user?.phone || '-'}</div>
                  <div><strong>邮箱：</strong>{detailModal.order.user?.email || '-'}</div>
                </div>
              </div>

              {detailModal.order.assetType && (
                <div>
                  <h3 style={{ marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                    商品信息
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><strong>资产类型：</strong>{detailModal.order.assetType}</div>
                    <div><strong>资产ID：</strong>{detailModal.order.assetId || '-'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>资产名称：</strong>{detailModal.order.assetName || '-'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}
