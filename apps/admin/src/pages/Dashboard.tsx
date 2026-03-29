import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, Space, Spin, Alert } from 'antd';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../api/client';

const { Option } = Select;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayActiveUsers: 0,
    todayNewUsers: 0,
    totalAgents: 0,
    totalConversations: 0,
    totalTransactions: 0,
    todayOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    totalCreators: 0,
    agentConversionRate: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [orderTrend, setOrderTrend] = useState<any[]>([]);
  const [agentSales, setAgentSales] = useState<any[]>([]);

  const getDaysFromTimeRange = (range: string) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = getDaysFromTimeRange(timeRange);
      const [statsRes, userGrowthRes, orderTrendRes, agentSalesRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getUserGrowth(days),
        dashboardApi.getOrderTrend(days),
        dashboardApi.getAgentSales(5),
      ]);
      
      setStats(statsRes.data.data.stats);
      setRecentUsers(statsRes.data.data.recentUsers);
      setRecentAgents(statsRes.data.data.recentAgents);
      setPendingVerifications(statsRes.data.data.pendingVerifications);
      setUserGrowth(userGrowthRes.data.data);
      setOrderTrend(orderTrendRes.data.data);
      setAgentSales(agentSalesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>数据概览</h2>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 120 }}
          options={[
            { label: '近7天', value: '7d' },
            { label: '近30天', value: '30d' },
            { label: '近90天', value: '90d' },
          ]}
          disabled={loading}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" tip="加载数据中..." />
        </div>
      ) : error ? (
        <Alert message="错误" description={error} type="error" showIcon />
      ) : (

      {/* 关键指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="总用户数" 
              value={stats.totalUsers} 
              prefix="👥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="今日活跃用户" 
              value={stats.todayActiveUsers} 
              prefix="📱"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="今日新增用户" 
              value={stats.todayNewUsers} 
              prefix="🚀"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="总智能体" 
              value={stats.totalAgents} 
              prefix="🤖"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="总创作者" 
              value={stats.totalCreators} 
              prefix="👨‍💻"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="今日订单" 
              value={stats.todayOrders} 
              prefix="📝"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="今日营收" 
              value={stats.todayRevenue} 
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic 
              title="总收入" 
              value={stats.totalRevenue} 
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="用户增长趋势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="活跃用户" stroke="#1890ff" fill="#e6f7ff" />
                  <Area type="monotone" dataKey="new" name="新增用户" stroke="#52c41a" fill="#f6ffed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="订单与营收趋势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" name="订单数" fill="#1890ff" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="营收" stroke="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="智能体销售排行">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="销量" fill="#722ed1" />
                  <Bar dataKey="revenue" name="营收" fill="#fa8c16" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="核心转化率">
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 600, color: '#52c41a', marginBottom: 16 }}>
                {stats.agentConversionRate}%
              </div>
              <div style={{ color: '#666' }}>
                智能体购买转化率
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#999' }}>浏览智能体</div>
                  <div style={{ fontSize: 24, fontWeight: 600 }}>12,500</div>
                </div>
                <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                  <div style={{ fontSize: 14, color: '#999' }}>购买智能体</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>400</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card title="最近注册用户" size="small">
            <Table
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '用户',
                  dataIndex: 'name',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
                    </div>
                  ),
                },
                {
                  title: '注册时间',
                  dataIndex: 'createdAt',
                  style: { fontSize: 12, color: '#999' }
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="最新智能体" size="small">
            <Table
              dataSource={recentAgents}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '智能体',
                  dataIndex: 'name',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>by {record.creatorName}</div>
                    </div>
                  ),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  style: { fontSize: 12, color: '#999' }
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="待审核认证" size="small">
            <Table
              dataSource={pendingVerifications}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '用户',
                  dataIndex: 'name',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {record.platform} · {record.followers.toLocaleString()} 粉丝
                      </div>
                    </div>
                  ),
                },
                {
                  title: '提交时间',
                  dataIndex: 'submittedAt',
                  style: { fontSize: 12, color: '#999' }
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
      )}
    </div>
  );
};

export default Dashboard;
