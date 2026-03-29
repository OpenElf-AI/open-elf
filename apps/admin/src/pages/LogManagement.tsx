import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Row, Col, Statistic, message } from 'antd';
import { MessageOutlined, UserOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { dashboardApi } from '../api/client';

const LogManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getStats();
      if (response.data.code === 0) {
        setRecentUsers(response.data.data.recentUsers || []);
        setRecentAgents(response.data.data.recentAgents || []);
      }
    } catch (error) {
      message.error('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const userColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '类型',
      key: 'type',
      render: () => <Tag color="blue">用户注册</Tag>,
    },
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
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
  ];

  const agentColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '类型',
      key: 'type',
      render: () => <Tag color="green">智能体创建</Tag>,
    },
    {
      title: '智能体ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建者',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>操作日志</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="用户注册日志" loading={loading}>
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="智能体创建日志" loading={loading}>
            <Table
              columns={agentColumns}
              dataSource={recentAgents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LogManagement;
