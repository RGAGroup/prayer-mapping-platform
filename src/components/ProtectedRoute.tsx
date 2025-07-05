import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  // Show loading while checking auth status with iOS design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-ios-2xl bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 flex items-center justify-center mb-6 animate-ios-bounce shadow-ios-lg">
            <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-ios-dark-text mb-2">
            Verificando permissões
          </h3>
          <p className="text-ios-gray dark:text-ios-dark-text2 font-medium">
            Aguarde um momento...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show access denied screen with iOS design if admin access required but user is not admin
  if (requireAdmin && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-ios-2xl bg-ios-red/10 backdrop-blur-ios border border-ios-red/20 flex items-center justify-center mx-auto mb-6 shadow-ios-lg">
            <AlertTriangle className="h-10 w-10 text-ios-red" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-ios-dark-text mb-4">
            Acesso Restrito
          </h2>
          <p className="text-ios-gray dark:text-ios-dark-text2 mb-6 leading-relaxed">
            Esta área é restrita para administradores. Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-ios-blue to-ios-purple hover:from-ios-blue/90 hover:to-ios-purple/90 text-white px-6 py-3 rounded-ios-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-ios-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 