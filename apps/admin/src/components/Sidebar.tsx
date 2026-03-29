import { Menu } from 'antd';
import { DashboardOutlined, UserOutlined, RobotOutlined, SafetyOutlined, MessageOutlined, CheckCircleOutlined, ShoppingOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/creator-audit',
      icon: <CheckCircleOutlined />,
      label: '创作者审核',
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: '订单管理',
    },
    {
      key: '/verifications',
      icon: <SafetyOutlined />,
      label: '用户认证',
    },
    {
      key: '/agent-listings',
      icon: <ShopOutlined />,
      label: '智能体发行',
    },
    {
      key: '/user-agents',
      icon: <RobotOutlined />,
      label: '智能体管理',
    },
    {
      key: '/logs',
      icon: <MessageOutlined />,
      label: '操作日志',
    },
  ];

  const handleClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Menu
      theme="dark"
      selectedKeys={[location.pathname]}
      mode="inline"
      items={items}
      onClick={handleClick}
    />
  );
};

export default Sidebar;
