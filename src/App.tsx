import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import AuthModal from "./components/AuthModal";
import { useState, useEffect } from "react";
import { Shield, Globe, Sparkles } from "lucide-react";

const queryClient = new QueryClient();

const LoginScreen = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-ios-blue/5 dark:from-ios-dark-bg via-ios-dark-bg2 to-ios-dark-bg3 flex items-center justify-center p-4">
      {/* Background Pattern - mais sutil */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-20 w-32 h-32 bg-ios-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-ios-purple/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-ios-green/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-ios-orange/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-ios-2xl bg-gradient-to-br from-ios-blue via-ios-purple to-ios-indigo flex items-center justify-center shadow-ios-2xl">
              <Globe className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-ios-green rounded-full flex items-center justify-center shadow-ios-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Text - cores mais fortes */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mapa Global de Intercessão
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Conecte-se com intercessores ao redor do mundo e participe da rede global de oração estratégica
          </p>
        </div>

        {/* Features - background mais opaco */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-ios rounded-ios-xl p-4 border border-slate-200 dark:border-slate-700 shadow-ios-sm">
            <div className="w-10 h-10 bg-ios-blue/15 rounded-ios-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="h-5 w-5 text-ios-blue" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Seguro</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Acesso restrito e protegido</p>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-ios rounded-ios-xl p-4 border border-slate-200 dark:border-slate-700 shadow-ios-sm">
            <div className="w-10 h-10 bg-ios-purple/15 rounded-ios-lg flex items-center justify-center mx-auto mb-2">
              <Globe className="h-5 w-5 text-ios-purple" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Global</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Conecte-se mundialmente</p>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-ios rounded-ios-xl p-4 border border-slate-200 dark:border-slate-700 shadow-ios-sm">
            <div className="w-10 h-10 bg-ios-green/15 rounded-ios-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-5 w-5 text-ios-green" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Espiritual</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Palavras proféticas e IA</p>
          </div>
        </div>

        {/* Call to Action - cor mais forte */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
          Entre ou registre-se para acessar o sistema
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {}} // Não permite fechar quando é obrigatório
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Loading state with iOS design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-ios-2xl bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 flex items-center justify-center mb-6 animate-ios-bounce shadow-ios-lg">
            <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-ios-dark-text mb-2">
            Verificando autenticação
          </h3>
          <p className="text-ios-gray dark:text-ios-dark-text2 font-medium">
            Aguarde um momento...
          </p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Se estiver autenticado, mostrar o app normal
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
