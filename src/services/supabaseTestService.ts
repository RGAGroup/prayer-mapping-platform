import { supabase } from '@/integrations/supabase/client';

export class SupabaseTestService {
  // Teste básico de conexão
  public async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔍 Testando conexão com Supabase...');
      
      // Teste simples de SELECT na tabela spiritual_regions
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('id, name, region_type')
        .limit(5);

      if (error) {
        console.error('❌ Erro na consulta:', error);
        return { success: false, error: `${error.message} (Código: ${error.code || 'N/A'})` };
      }

      console.log('✅ Conexão bem-sucedida. Dados:', data);
      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na conexão:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Teste de inserção simples
  public async testInsert(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔍 Testando inserção no Supabase...');
      
      const testData = {
        name: 'Teste Connection ' + Date.now(),
        region_type: 'country',
        country_code: 'TEST',
        data_source: 'test',
        status: 'approved'
      };

      const { data: insertedData, error } = await supabase
        .from('spiritual_regions')
        .insert([testData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        return { success: false, error: `${error.message} (Código: ${error.code || 'N/A'})` };
      }

      console.log('✅ Inserção bem-sucedida. Dados:', insertedData);
      
      // Limpar o teste
      if (insertedData?.id) {
        const { error: deleteError } = await supabase
          .from('spiritual_regions')
          .delete()
          .eq('id', insertedData.id);

        if (deleteError) {
          console.warn('⚠️ Aviso: Falha ao limpar dado de teste:', deleteError.message);
        } else {
          console.log('🧹 Dado de teste removido com sucesso');
        }
      }

      return { success: true, data: insertedData };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na inserção:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Verificar estrutura da tabela
  public async testTableStructure(): Promise<{ success: boolean; error?: string; columns?: string[] }> {
    try {
      console.log('🔍 Verificando estrutura da tabela spiritual_regions...');
      
      // Fazer uma query que retorna erro se os campos não existirem
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro na verificação:', error);
        return { success: false, error: `${error.message} (Código: ${error.code || 'N/A'})` };
      }

      const columns = data ? Object.keys(data) : [];
      console.log('✅ Estrutura verificada. Colunas encontradas:', columns);
      return { success: true, columns };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na verificação:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Teste de consulta com filtros (similar ao que está falhando)
  public async testFilteredQuery(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Testando consulta com filtros (similar ao teste Brasil)...');
      
      // Simular a consulta que está falhando
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('id')
        .eq('region_type', 'country')
        .or('name.eq.Brasil,name.eq.Brazil')
        .maybeSingle();

      if (error) {
        console.error('❌ Erro na consulta filtrada:', error);
        return { success: false, error: `${error.message} (Código: ${error.code || 'N/A'})` };
      }

      console.log('✅ Consulta filtrada bem-sucedida. Dados:', data);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na consulta filtrada:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Execução completa de todos os testes
  public async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando diagnóstico completo do Supabase...');
    console.log('='.repeat(50));
    
    const connectionTest = await this.testConnection();
    const structureTest = await this.testTableStructure();
    const filteredQueryTest = await this.testFilteredQuery();
    const insertTest = await this.testInsert();

    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('='.repeat(50));
    console.log('🔗 Conexão básica:', connectionTest.success ? '✅ OK' : '❌ FALHA');
    if (!connectionTest.success) console.log('   ⚠️', connectionTest.error);
    
    console.log('🏗️ Estrutura da tabela:', structureTest.success ? '✅ OK' : '❌ FALHA');
    if (!structureTest.success) console.log('   ⚠️', structureTest.error);
    
    console.log('🔍 Consulta filtrada:', filteredQueryTest.success ? '✅ OK' : '❌ FALHA');
    if (!filteredQueryTest.success) console.log('   ⚠️', filteredQueryTest.error);
    
    console.log('📝 Inserção/Remoção:', insertTest.success ? '✅ OK' : '❌ FALHA');
    if (!insertTest.success) console.log('   ⚠️', insertTest.error);

    if (structureTest.columns && structureTest.columns.length > 0) {
      console.log('\n📋 COLUNAS DISPONÍVEIS:');
      console.log('='.repeat(50));
      structureTest.columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col}`);
      });
    }

    const allPassed = connectionTest.success && structureTest.success && 
                     filteredQueryTest.success && insertTest.success;

    console.log('\n🎯 RESULTADO GERAL:');
    console.log('='.repeat(50));
    console.log(allPassed ? '✅ TODOS OS TESTES PASSARAM!' : '❌ ALGUNS TESTES FALHARAM!');
    
    if (!allPassed) {
      console.log('\n💡 DICAS PARA RESOLUÇÃO:');
      console.log('1. Verifique se a tabela spiritual_regions existe');
      console.log('2. Verifique as políticas RLS (Row Level Security)');
      console.log('3. Verifique as permissões do usuário anônimo');
      console.log('4. Verifique a configuração da API key');
    }
  }
}

export const supabaseTestService = new SupabaseTestService(); 