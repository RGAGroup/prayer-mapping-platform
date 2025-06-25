
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onAuthClick: () => void;
  isAuthenticated: boolean;
}

const Header = ({ onAuthClick }: HeaderProps) => {
  const { isAuthenticated, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="relative z-50 bg-card/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-celestial-500 to-divine-500 divine-glow">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold celestial-text">
                Mapa Global de Intercessão
              </h1>
              <p className="text-sm text-muted-foreground">
                Rede mundial de oração estratégica
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">1.247 intercessores ativos</span>
              </div>
              <Badge variant="secondary" className="bg-divine-900/50 text-divine-300">
                Movimento Global
              </Badge>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {userProfile?.role === 'admin' && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{userProfile?.display_name || 'Intercessor'}</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.role === 'admin' ? 'Administrador' : 
                     userProfile?.role === 'moderator' ? 'Moderador' : 'Vigia Ativo'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-celestial-400 to-divine-400 flex items-center justify-center text-white text-sm font-bold">
                  {userProfile?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={onAuthClick}
                className="bg-gradient-to-r from-celestial-600 to-divine-600 hover:from-celestial-700 hover:to-divine-700 text-white border-0 divine-glow"
              >
                Entrar na Rede
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
