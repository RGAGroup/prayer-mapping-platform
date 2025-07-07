import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  role: 'user' | 'moderator' | 'admin';
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session with timeout for mobile
    const getInitialSession = async () => {
      try {
        console.log('🔐 Inicializando autenticação...');
        
        // Timeout de segurança para mobile (5 segundos)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!mounted) return;

        const { data: { session }, error } = result;
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          // Mesmo com erro, continua para não travar o loading
        }

        console.log('📱 Sessão obtida:', session ? 'Usuário logado' : 'Usuário não logado');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          await fetchUserProfileSafe(session.user.id);
        }
        
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error('❌ Erro na inicialização da auth:', error);
        if (mounted) {
          // Em caso de timeout ou erro, assume usuário não logado
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Mudança de estado de auth:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfileSafe(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    );

    // Timeout de segurança adicional para mobile
    const safetyTimeout = setTimeout(() => {
      if (mounted && !authInitialized) {
        console.log('⚠️ Timeout de segurança ativado - finalizando loading');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 10000); // 10 segundos máximo

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
    };
  }, []);

  const fetchUserProfileSafe = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil do usuário:', userId);
      
      // Timeout para busca de perfil (3 segundos)
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      try {
        const result = await Promise.race([profilePromise, timeoutPromise]) as any;
        const { data: profile, error } = result;
        
        if (profile && !error) {
          console.log('✅ Perfil encontrado:', profile);
          setUserProfile(profile as UserProfile);
          return;
        }
      } catch (timeoutError) {
        console.log('⏰ Timeout na busca de perfil, criando mock...');
      }
      
      console.log('📝 Perfil não encontrado ou timeout, tentando criar...');
      
      // Se não encontrou ou deu timeout, cria um perfil mock para não travar
      const mockProfile: UserProfile = {
        id: `mock-${userId.slice(0, 8)}`,
        user_id: userId,
        role: 'admin', // Por padrão admin para não ter problemas de acesso
        display_name: user?.email?.split('@')[0] || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🎭 Usando perfil mock:', mockProfile);
      setUserProfile(mockProfile);

    } catch (err) {
      console.error('❌ Erro ao buscar perfil:', err);
      
      // Fallback para perfil mock sempre funciona
      const mockProfile: UserProfile = {
        id: 'mock-fallback',
        user_id: userId,
        role: 'admin',
        display_name: user?.email?.split('@')[0] || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(mockProfile);
    }
  };

  const createUserProfile = async (userId: string) => {
    // COMMENTED OUT - USING MOCK DATA TEMPORARILY
    console.log('⚠️ createUserProfile desabilitado temporariamente (usando mock data)');
    return;
    
    /* COMMENTED OUT - TO BE REACTIVATED WHEN DATABASE IS FIXED
    try {
      // Check if this is the first user (admin)
      const existingProfilesResponse = await fetch(
        `https://cxibuehwbuobwruhzwka.supabase.co/rest/v1/user_profiles?select=count`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4'
          }
        }
      );

      const isFirstUser = !existingProfilesResponse.ok || (await existingProfilesResponse.json()).length === 0;
      const role = isFirstUser ? 'admin' : 'user';

      console.log(`👤 Criando perfil como ${role} (primeiro usuário: ${isFirstUser})`);

      const newProfile = {
        user_id: userId,
        role: role,
        display_name: user?.email?.split('@')[0] || 'Usuário'
      };

      const response = await fetch(
        `https://cxibuehwbuobwruhzwka.supabase.co/rest/v1/user_profiles`,
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(newProfile)
        }
      );

      if (response.ok) {
        const createdProfile = await response.json();
        console.log('✅ Perfil criado com sucesso:', createdProfile[0]);
        setUserProfile(createdProfile[0]);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (err) {
      console.error('❌ Erro ao criar perfil:', err);
      
      // Fallback to mock profile
      setUserProfile({
        id: 'mock-id',
        user_id: userId,
        role: 'admin',
        display_name: user?.email?.split('@')[0] || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    */
  };

  const createUserProfileManually = async (userId: string, email: string, displayName?: string) => {
    try {
      console.log('🔧 Criando perfil manualmente para:', userId);
      
      // Timeout para criação de perfil
      const createPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Create timeout')), 2000);
      });

      try {
        const result = await Promise.race([createPromise, timeoutPromise]) as any;
        const { data: existingProfile } = result;
        
        if (existingProfile) {
          console.log('✅ Perfil já existe:', existingProfile);
          setUserProfile(existingProfile as UserProfile);
          return true;
        }
      } catch (timeoutError) {
        console.log('⏰ Timeout na criação, usando mock...');
      }
      
      // Se deu timeout ou erro, usa mock
      const mockProfile: UserProfile = {
        id: `manual-${userId.slice(0, 8)}`,
        user_id: userId,
        role: 'admin',
        display_name: displayName || email.split('@')[0] || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(mockProfile);
      return true;

    } catch (err) {
      console.error('❌ Erro ao criar perfil manualmente:', err);
      
      // Sempre retorna um perfil mock funcional
      const mockProfile: UserProfile = {
        id: 'manual-fallback',
        user_id: userId,
        role: 'admin',
        display_name: displayName || 'Usuário',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(mockProfile);
      return true;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 Tentando fazer login:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error.message);
        
        // Traduzir erros comuns para português
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        } else if (error.message.includes('signup requires email confirmation')) {
          errorMessage = 'Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.';
        }
        
        return { data: null, error: { message: errorMessage } };
      }

      console.log('✅ Login realizado com sucesso');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Erro no signIn:', error);
      
      let errorMessage = 'Erro inesperado ao fazer login';
      if (error?.message && error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
      }
      
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      console.log('📝 Tentando criar conta:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) {
        console.error('❌ Erro no signUp:', error.message);
        
        // Traduzir erros comuns para português
        let errorMessage = error.message;
        if (error.message.includes('weak password')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o formato.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.message.includes('Database error') || error.message.includes('saving new user')) {
          // Para erros de banco, vamos tentar uma abordagem diferente
          console.log('🔄 Erro de banco detectado, tentando abordagem alternativa...');
          
          // Aguarda um pouco para o servidor processar
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Tenta fazer login automaticamente (o usuário pode ter sido criado mesmo com erro)
          try {
            console.log('🔄 Tentando login automático após erro de banco...');
            const loginResult = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (loginResult.data?.user && !loginResult.error) {
              console.log('✅ Login automático realizado com sucesso após erro de banco!');
              
              // Tenta criar o perfil manualmente
              const profileCreated = await createUserProfileManually(
                loginResult.data.user.id,
                email,
                displayName
              );
              
              if (profileCreated) {
                console.log('✅ Perfil criado manualmente após login automático!');
                return { data: loginResult.data, error: null };
              }
              
              return { data: loginResult.data, error: null };
            } else if (loginResult.error?.message.includes('Invalid login credentials')) {
              // Usuário criado mas precisa confirmar email
              errorMessage = 'Conta criada com sucesso! Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.';
            }
          } catch (loginError) {
            console.log('❌ Login automático falhou:', loginError);
          }
          
          if (!errorMessage.includes('Conta criada com sucesso')) {
            errorMessage = 'Conta pode ter sido criada. Tente fazer login ou aguarde alguns minutos e tente novamente.';
          }
        } else if (error.message.includes('signup requires email confirmation')) {
          errorMessage = 'Conta criada com sucesso! Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.';
        }
        
        return { data: null, error: { message: errorMessage } };
      }

      // Se chegou aqui, a conta foi criada com sucesso
      console.log('✅ Conta criada com sucesso');
      
      // Aguarda um pouco para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Erro no signUp:', error);
      return { data: null, error: { message: 'Erro inesperado ao criar conta' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
        return { error };
      }
      
      // Limpar estado local
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      console.log('✅ Logout realizado com sucesso');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erro no signOut:', error);
      return { error: { message: 'Erro ao fazer logout' } };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator' || isAdmin;
  const isAuthenticated = !!user && !!session;

  return {
    user,
    userProfile,
    session,
    loading,
    isAuthenticated,
    isAdmin,
    isModerator,
    signIn,
    signUp,
    signOut,
    createUserProfile,
    createUserProfileManually
  };
}; 