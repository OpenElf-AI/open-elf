import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Button, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import VerificationManagement from './pages/VerificationManagement';
import CreatorAudit from './pages/CreatorAudit';
import OrderManagement from './pages/OrderManagement';
import AgentListingManagement from './pages/AgentManagement';
import UserAgentManagement from './pages/UserAgentManagement';
import LogManagement from './pages/LogManagement';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import SafePage from './components/SafePage';
import { useAuthStore } from './store/authStore';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={250}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontSize: 18, 
          fontWeight: 'bold', 
          borderBottom: '1px solid #333' 
        }}>
          Open Elf 运营后台
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          borderBottom: '1px solid #f0f0f0' 
        }}>
          <Space>
            <span style={{ marginRight: 8 }}>欢迎，{user?.name || '管理员'}</span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content style={{ 
          margin: 24, 
          padding: 24, 
          background: '#fff', 
          minHeight: 280 
        }}>
          <Routes>
            <Route path="/" element={
              <SafePage pageName="数据概览">
                <Dashboard />
              </SafePage>
            } />
            <Route path="/users" element={
              <SafePage pageName="用户管理">
                <UserManagement />
              </SafePage>
            } />
            <Route path="/verifications" element={
              <SafePage pageName="用户认证">
                <VerificationManagement />
              </SafePage>
            } />
            <Route path="/creator-audit" element={
              <SafePage pageName="创作者审核">
                <CreatorAudit />
              </SafePage>
            } />
            <Route path="/orders" element={
              <SafePage pageName="订单管理">
                <OrderManagement />
              </SafePage>
            } />
            <Route path="/agent-listings" element={
              <SafePage pageName="智能体发行管理">
                <AgentListingManagement />
              </SafePage>
            } />
            <Route path="/user-agents" element={
              <SafePage pageName="智能体管理">
                <UserAgentManagement />
              </SafePage>
            } />
            <Route path="/logs" element={
              <SafePage pageName="操作日志">
                <LogManagement />
              </SafePage>
            } />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;
