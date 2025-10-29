import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Termos de Uso e Política de Privacidade
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-8">
          {/* Termos de Uso */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Termos de Uso
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold mb-2">1.1. Aceitação dos Termos</h3>
                <p>
                  Ao acessar e usar a plataforma <strong>Atalaia - Global Vision</strong>, você concorda com estes Termos de Uso e nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">1.2. Descrição do Serviço</h3>
                <p>
                  A Atalaia - Global Vision é uma plataforma de intercessão profética global que conecta intercessores ao redor do mundo através de um sistema de mapeamento interativo, permitindo coordenação estratégica de oração, compartilhamento de palavras proféticas e ativação de territórios espirituais.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">1.3. Uso Adequado</h3>
                <p>Você concorda em:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Usar a plataforma apenas para fins de intercessão e oração</li>
                  <li>Não compartilhar conteúdo ofensivo, discriminatório ou ilegal</li>
                  <li>Respeitar outros usuários e suas crenças</li>
                  <li>Não usar a plataforma para fins comerciais sem autorização</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">1.4. Conteúdo do Usuário</h3>
                <p>
                  Ao compartilhar reflexões pessoais, palavras proféticas ou qualquer outro conteúdo na plataforma, você mantém a propriedade de seu conteúdo, mas nos concede uma licença não exclusiva para exibir, armazenar e processar esse conteúdo conforme necessário para operar o serviço.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">1.5. Suspensão e Cancelamento</h3>
                <p>
                  Reservamo-nos o direito de suspender ou cancelar sua conta se você violar estes termos ou usar a plataforma de forma inadequada.
                </p>
              </div>
            </div>
          </section>

          {/* Política de Privacidade - LGPD */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Política de Privacidade (LGPD)
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold mb-2">2.1. Dados Coletados</h3>
                <p>Coletamos os seguintes dados pessoais:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Dados de Cadastro:</strong> Nome, e-mail</li>
                  <li><strong>Dados de Uso:</strong> Sessões de oração, regiões oradas, tempo de oração, reflexões pessoais</li>
                  <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional (para segurança e melhorias)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.2. Finalidade do Tratamento</h3>
                <p>Utilizamos seus dados para:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Criar e gerenciar sua conta de usuário</li>
                  <li>Registrar e exibir suas sessões de oração e estatísticas</li>
                  <li>Gerar rankings de intercessores (sem expor dados pessoais sensíveis)</li>
                  <li>Melhorar a experiência do usuário e funcionalidades da plataforma</li>
                  <li>Enviar notificações relacionadas ao serviço (se autorizado)</li>
                  <li>Garantir a segurança e prevenir fraudes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.3. Base Legal (LGPD)</h3>
                <p>O tratamento de seus dados pessoais é baseado em:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Consentimento:</strong> Ao aceitar estes termos, você consente com o tratamento de seus dados</li>
                  <li><strong>Execução de Contrato:</strong> Para fornecer os serviços solicitados</li>
                  <li><strong>Legítimo Interesse:</strong> Para melhorias do serviço e segurança</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.4. Compartilhamento de Dados</h3>
                <p>
                  <strong>NÃO vendemos seus dados pessoais.</strong> Compartilhamos dados apenas:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Com provedores de serviços essenciais (hospedagem, banco de dados) sob acordos de confidencialidade</li>
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Dados anonimizados para estatísticas públicas (rankings, regiões mais oradas)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.5. Armazenamento e Segurança</h3>
                <p>
                  Seus dados são armazenados em servidores seguros com criptografia. Implementamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou destruição.
                </p>
                <p className="mt-2">
                  <strong>Localização:</strong> Dados armazenados em servidores na região da América do Sul (Brasil) através do Supabase.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.6. Seus Direitos (LGPD - Art. 18)</h3>
                <p>Você tem direito a:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Solicitar anonimização ou exclusão de dados desnecessários</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>Revogação do Consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                  <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em certas situações</li>
                </ul>
                <p className="mt-2">
                  Para exercer seus direitos, entre em contato através do e-mail: <strong>privacidade@atalaia.global</strong>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.7. Retenção de Dados</h3>
                <p>
                  Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços. Após a exclusão da conta, seus dados pessoais serão removidos em até 30 dias, exceto quando a retenção for exigida por lei.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.8. Cookies e Tecnologias Similares</h3>
                <p>
                  Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Você pode gerenciar cookies através das configurações do seu navegador.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.9. Menores de Idade</h3>
                <p>
                  Nossos serviços são destinados a maiores de 18 anos. Se você tiver menos de 18 anos, deve obter consentimento de seus pais ou responsáveis antes de usar a plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2.10. Alterações na Política</h3>
                <p>
                  Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por e-mail.
                </p>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Contato
            </h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Controlador de Dados:</strong> Atalaia - Global Vision
              </p>
              <p>
                <strong>E-mail para Privacidade:</strong> privacidade@atalaia.global
              </p>
              <p>
                <strong>E-mail para Suporte:</strong> suporte@atalaia.global
              </p>
            </div>
          </section>

          {/* Aceitação */}
          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Ao criar uma conta na plataforma Atalaia - Global Vision, você declara que leu, compreendeu e concorda com estes Termos de Uso e Política de Privacidade, incluindo o tratamento de seus dados pessoais conforme descrito acima, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

