import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, Shield, Sparkles, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/use-mobile';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const { signIn, signUp, loading } = useAuth();
  const { isMobile, isMobileDevice, screenWidth } = useMobile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      console.log('🔐 Tentando fazer login...', { isMobile, isMobileDevice, screenWidth });
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        // Melhorar mensagens de erro para mobile
        let mobileError = error.message;
        if (isMobile) {
          if (error.message.includes('Invalid login credentials')) {
            mobileError = 'Email ou senha incorretos.\nVerifique suas credenciais.';
          } else if (error.message.includes('Network')) {
            mobileError = 'Problema de conexão.\nVerifique sua internet e tente novamente.';
          } else if (error.message.includes('Too many requests')) {
            mobileError = 'Muitas tentativas.\nAguarde 5 minutos e tente novamente.';
          }
        }
        setError(mobileError);
        return;
      }
      
      console.log('✅ Login realizado com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(isMobile ? 'Erro na conexão.\nTente novamente.' : 'Erro inesperado ao fazer login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      console.log('📝 Tentando criar conta...', { isMobile, isMobileDevice, screenWidth });
      const { data, error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        // Melhorar mensagens de erro para mobile
        let mobileError = error.message;
        if (isMobile) {
          if (error.message.includes('weak password')) {
            mobileError = 'Senha muito fraca.\nUse pelo menos 6 caracteres.';
          } else if (error.message.includes('Invalid email')) {
            mobileError = 'Email inválido.\nVerifique o formato.';
          } else if (error.message.includes('already registered')) {
            mobileError = 'Email já cadastrado.\nTente fazer login ou usar outro email.';
          }
        }
        
        setError(mobileError);
        
        // Se a mensagem indica que a conta pode ter sido criada, sugere tentar login
        if (error.message.includes('Conta pode ter sido criada')) {
          setError(error.message + (isMobile ? '\nOu tente fazer login.' : ' Ou tente fazer login na aba "Entrar".'));
        }
        
        return;
      }
      
      // Se chegou aqui, deu tudo certo
      console.log('✅ Conta criada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error('❌ Erro no registro:', err);
      setError(isMobile ? 'Erro na conexão.\nTente novamente.' : 'Erro inesperado ao criar conta');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} bg-white dark:bg-slate-900 backdrop-blur-ios border-slate-200 dark:border-slate-700 rounded-ios-2xl shadow-ios-2xl animate-ios-slide-up`}>
        <CardHeader className="relative text-center pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-ios-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Logo e Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-ios-xl bg-gradient-to-br from-ios-blue via-ios-purple to-ios-indigo flex items-center justify-center shadow-ios-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-ios-green rounded-full flex items-center justify-center shadow-ios-sm">
                {isMobile ? <Smartphone className="h-3 w-3 text-white" /> : <Sparkles className="h-3 w-3 text-white" />}
              </div>
            </div>
          </div>

          <CardTitle className="space-y-2">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white tracking-tight`}>
              Mapa Global de Intercessão
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-400 font-medium`}>
              Conecte-se com intercessores ao redor do mundo
            </p>
            {isMobile && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Smartphone className="h-4 w-4 text-ios-blue" />
                <span className="text-xs text-ios-blue font-medium">Otimizado para mobile</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-ios-red/10 border-ios-red/20 rounded-ios-lg animate-ios-fade-in">
              <AlertCircle className="h-4 w-4 text-ios-red" />
              <AlertDescription className={`text-ios-red font-medium ${isMobile ? 'text-sm' : ''}`}>
                {error.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className={`grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 rounded-ios-xl p-1 ${isMobile ? 'h-10' : 'h-12'}`}>
              <TabsTrigger 
                value="login" 
                className={`rounded-ios-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-semibold text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white ${isMobile ? 'text-sm' : ''}`}
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className={`rounded-ios-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-semibold text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white ${isMobile ? 'text-sm' : ''}`}
              >
                Registrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className={`text-slate-900 dark:text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className={`pl-10 ${isMobile ? 'h-10 text-sm' : 'h-12'} bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-ios-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-ios-blue focus:ring-ios-blue/20 transition-all duration-200`}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className={`text-slate-900 dark:text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className={`pl-10 pr-10 ${isMobile ? 'h-10 text-sm' : 'h-12'} bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-ios-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-ios-blue focus:ring-ios-blue/20 transition-all duration-200`}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} bg-gradient-to-r from-ios-blue to-ios-purple hover:from-ios-blue/90 hover:to-ios-purple/90 text-white border-0 rounded-ios-lg font-semibold shadow-ios-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-ios-xl`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Entrar</span>
                      {isMobile && <Wifi className="h-4 w-4" />}
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={`text-slate-900 dark:text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      className={`pl-10 ${isMobile ? 'h-10 text-sm' : 'h-12'} bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-ios-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-ios-blue focus:ring-ios-blue/20 transition-all duration-200`}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-register" className={`text-slate-900 dark:text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="email-register"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className={`pl-10 ${isMobile ? 'h-10 text-sm' : 'h-12'} bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-ios-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-ios-blue focus:ring-ios-blue/20 transition-all duration-200`}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-register" className={`text-slate-900 dark:text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <Input
                      id="password-register"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      className={`pl-10 pr-10 ${isMobile ? 'h-10 text-sm' : 'h-12'} bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-ios-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-ios-blue focus:ring-ios-blue/20 transition-all duration-200`}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-ios-blue dark:hover:text-ios-blue transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} bg-gradient-to-r from-ios-green to-ios-blue hover:from-ios-green/90 hover:to-ios-blue/90 text-white border-0 rounded-ios-lg font-semibold shadow-ios-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-ios-xl`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Criar conta</span>
                      {isMobile && <Wifi className="h-4 w-4" />}
                    </div>
                  )}
                </Button>

                {isMobile && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
                    Verifique sua conexão com a internet
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
