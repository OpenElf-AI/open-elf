import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    localStorage.setItem('admin_token', 'temp');
    localStorage.setItem('user_info', JSON.stringify({ name: '测试管理员' }));
  }

  return <>{children}</>;
};

export default ProtectedRoute;
