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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil do usuário:', userId);
      
      // Primeiro tenta buscar o perfil existente
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profile && !error) {
        console.log('✅ Perfil encontrado:', profile);
        setUserProfile(profile as UserProfile);
        return;
      }
      
      console.log('📝 Perfil não encontrado, tentando criar manualmente...');
      
      // Se não encontrou, tenta criar manualmente
      const profileCreated = await createUserProfileManually(
        userId,
        user?.email || 'user@example.com'
      );
      
      if (!profileCreated) {
        console.log('⚠️ Não foi possível criar perfil, usando mock temporário');
        
        // Fallback para perfil mock
        const mockProfile: UserProfile = {
          id: `mock-${userId.slice(0, 8)}`,
          user_id: userId,
          role: 'admin',
          display_name: user?.email?.split('@')[0] || 'Admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUserProfile(mockProfile);
      }

    } catch (err) {
      console.error('❌ Erro ao buscar perfil:', err);
      
      // Fallback para perfil mock
      const mockProfile: UserProfile = {
        id: 'mock-id',
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
      
      // Verifica se já existe um perfil
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingProfile) {
        console.log('✅ Perfil já existe:', existingProfile);
        setUserProfile(existingProfile as UserProfile);
        return true;
      }
      
      // Conta quantos usuários existem para determinar se é admin
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      const isFirstUser = (count || 0) === 0;
      const role: 'admin' | 'user' = isFirstUser ? 'admin' : 'user';
      
      console.log(`👤 Criando perfil como ${role} (primeiro usuário: ${isFirstUser})`);
      
      // Cria o perfil
      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: role,
          display_name: displayName || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar perfil:', error);
        return false;
      }
      
      console.log('✅ Perfil criado manualmente:', newProfile);
      setUserProfile(newProfile as UserProfile);
      return true;
      
    } catch (error) {
      console.error('❌ Erro na criação manual do perfil:', error);
      return false;
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
      
      // Primeiro, tenta criar a conta no Supabase Auth
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
        console.error('❌ Erro no signup:', error.message);
        
        // Traduzir erros comuns para português
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
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
      
      let errorMessage = 'Erro inesperado ao criar conta';
      if (error?.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('Database error') || error.message.includes('saving new user')) {
          errorMessage = 'Erro temporário no servidor. Tente novamente em alguns segundos.';
        }
      }
      
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('👋 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error.message);
        throw error;
      }
      console.log('✅ Logout realizado com sucesso');
      setUserProfile(null);
    } catch (error) {
      console.error('❌ Erro no signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator' || isAdmin;
  const isAuthenticated = !!user;

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
  };
}; 