import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Shield, AlertTriangle, Smartphone, ArrowLeft, Home } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const { isMobile, isMobileDevice } = useMobile();

  // Show loading while checking auth status with iOS design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-ios-2xl bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 flex items-center justify-center mb-6 animate-ios-bounce shadow-ios-lg">
            <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-ios-dark-text mb-2`}>
            Verificando permissões
          </h3>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-ios-gray dark:text-ios-dark-text2 font-medium`}>
            Aguarde um momento...
          </p>
          {isMobile && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Smartphone className="h-4 w-4 text-ios-blue" />
              <span className="text-xs text-ios-blue">Modo Mobile</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 Usuário não autenticado, redirecionando para home');
    return <Navigate to="/" replace />;
  }

  // Show access denied screen with iOS design if admin access required but user is not admin
  if (requireAdmin && userProfile?.role !== 'admin') {
    console.log('🚫 Acesso negado - usuário não é admin:', { role: userProfile?.role, isMobile });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center p-4">
        <div className={`text-center ${isMobile ? 'max-w-xs' : 'max-w-md'}`}>
          <div className="w-20 h-20 rounded-ios-2xl bg-ios-red/10 backdrop-blur-ios border border-ios-red/20 flex items-center justify-center mx-auto mb-6 shadow-ios-lg">
            <AlertTriangle className="h-10 w-10 text-ios-red" />
          </div>
          
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-ios-dark-text mb-4`}>
            Acesso Restrito
          </h2>
          
          <div className="space-y-4">
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-ios-gray dark:text-ios-dark-text2 leading-relaxed`}>
              Esta área é restrita para administradores. 
              {isMobile ? ' Você não tem permissão para acessar.' : ' Você não tem permissão para acessar esta página.'}
            </p>
            
            {isMobile && (
              <div className="bg-ios-blue/10 rounded-lg p-3 border border-ios-blue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4 text-ios-blue" />
                  <span className="text-xs font-medium text-ios-blue">Acesso Mobile</span>
                </div>
                <p className="text-xs text-ios-blue">
                  Para acessar recursos administrativos, entre em contato com um administrador.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className={`w-full bg-gradient-to-r from-ios-blue to-ios-purple hover:from-ios-blue/90 hover:to-ios-purple/90 text-white ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} rounded-ios-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-ios-lg flex items-center justify-center gap-2`}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className={`w-full bg-ios-gray/20 hover:bg-ios-gray/30 text-ios-gray dark:text-ios-dark-text2 ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} rounded-ios-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
              >
                <Home className="h-4 w-4" />
                Ir para Home
              </button>
            </div>
            
            {userProfile && (
              <div className="mt-6 p-3 bg-ios-gray/10 rounded-lg">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-ios-gray dark:text-ios-dark-text2`}>
                  Conectado como: <span className="font-medium">{userProfile.display_name || 'Usuário'}</span>
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-ios-gray dark:text-ios-dark-text2`}>
                  Nível: <span className="font-medium capitalize">{userProfile.role}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 