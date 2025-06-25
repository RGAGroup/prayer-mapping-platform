import { useState, useEffect } from 'react';

interface AdminStats {
  totalRegions: number;
  pendingApprovals: number;
  totalUsers: number;
  activeIntercessors: number;
  aiGeneratedData: number;
  manualEntries: number;
}

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalRegions: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    activeIntercessors: 0,
    aiGeneratedData: 0,
    manualEntries: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Carregando dados do admin dashboard...');

        // Direct REST API access to spiritual_regions
        const response = await fetch(
          `https://cxibuehwbuobwruhzwka.supabase.co/rest/v1/spiritual_regions?select=*`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4'
            }
          }
        );
        
        if (response.ok) {
          const regionsData = await response.json();
          console.log('✅ Dados obtidos:', regionsData);
          
          const totalRegions = regionsData?.length || 0;
          const pendingApprovals = regionsData?.filter((r: any) => r.status === 'pending').length || 0;
          const aiGeneratedData = regionsData?.filter((r: any) => r.data_source === 'ai_generated').length || 0;
          const manualEntries = regionsData?.filter((r: any) => r.data_source === 'manual').length || 0;

          setStats({
            totalRegions: totalRegions,
            pendingApprovals: pendingApprovals,
            totalUsers: 1247, // Mock data for now
            activeIntercessors: Math.floor(1247 * 0.71),
            aiGeneratedData: aiGeneratedData,
            manualEntries: manualEntries
          });

          setIsConnected(true);
          console.log('📈 Stats calculadas:', {
            totalRegions,
            pendingApprovals,
            aiGeneratedData,
            manualEntries
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (err) {
        console.error('❌ Erro na conexão:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setIsConnected(false);
        
        // Set fallback mock data
        setStats({
          totalRegions: 3,
          pendingApprovals: 1,
          totalUsers: 1247,
          activeIntercessors: 890,
          aiGeneratedData: 1,
          manualEntries: 2
        });
      } finally {
        setLoading(false);
        console.log('🏁 Carregamento finalizado');
      }
    };

    fetchData();
  }, []);

  return { stats, loading, error, isConnected };
}; 