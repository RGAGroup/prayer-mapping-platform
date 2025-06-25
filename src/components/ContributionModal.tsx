import { useState } from 'react';
import { X, Crown, Sword, Heart, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LocationData } from '@/types/Location';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContributionModalProps {
  location: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ContributionModal = ({ location, isOpen, onClose, onSuccess }: ContributionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('prophetic');

  // Estados para Palavra Profética
  const [propheticContent, setPropheticContent] = useState('');
  const [propheticAuthor, setPropheticAuthor] = useState('');

  // Estados para Alvo de Oração
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [prayerUrgency, setPrayerUrgency] = useState('');
  const [prayerCategory, setPrayerCategory] = useState('');

  // Estados para Testemunho
  const [testimonyTitle, setTestimonyTitle] = useState('');
  const [testimonyContent, setTestimonyContent] = useState('');
  const [testimonyAuthor, setTestimonyAuthor] = useState('');
  const [testimonyCategory, setTestimonyCategory] = useState('');

  // Estados para Base Missionária
  const [missionName, setMissionName] = useState('');
  const [missionOrganization, setMissionOrganization] = useState('');
  const [missionContact, setMissionContact] = useState('');
  const [missionFocus, setMissionFocus] = useState('');
  const [missionEstablished, setMissionEstablished] = useState('');

  const handleSubmitProphetic = async () => {
    if (!propheticContent.trim() || !propheticAuthor.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o conteúdo da palavra profética e o autor.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('prophetic_words')
        .insert({
          location_id: location.id,
          content: propheticContent.trim(),
          author: propheticAuthor.trim(),
          date: new Date().toISOString().split('T')[0],
          is_verified: false
        });

      if (error) throw error;

      toast({
        title: "Palavra Profética Enviada! 🙏",
        description: "Sua contribuição será analisada por nossa equipe de moderação espiritual."
      });

      setPropheticContent('');
      setPropheticAuthor('');
      onSuccess();
    } catch (error) {
      console.error('Error submitting prophetic word:', error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao enviar sua palavra profética. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPrayer = async () => {
    if (!prayerTitle.trim() || !prayerDescription.trim() || !prayerUrgency || !prayerCategory) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do alvo de oração.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_targets')
        .insert({
          location_id: location.id,
          title: prayerTitle.trim(),
          description: prayerDescription.trim(),
          urgency: prayerUrgency,
          category: prayerCategory
        });

      if (error) throw error;

      toast({
        title: "Alvo de Oração Registrado! ⚡",
        description: "Sua solicitação de intercessão foi adicionada à lista de alvos espirituais."
      });

      setPrayerTitle('');
      setPrayerDescription('');
      setPrayerUrgency('');
      setPrayerCategory('');
      onSuccess();
    } catch (error) {
      console.error('Error submitting prayer target:', error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao registrar o alvo de oração. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTestimony = async () => {
    if (!testimonyTitle.trim() || !testimonyContent.trim() || !testimonyAuthor.trim() || !testimonyCategory) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do testemunho.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonies')
        .insert({
          location_id: location.id,
          title: testimonyTitle.trim(),
          content: testimonyContent.trim(),
          author: testimonyAuthor.trim(),
          date: new Date().toISOString().split('T')[0],
          category: testimonyCategory
        });

      if (error) throw error;

      toast({
        title: "Testemunho Compartilhado! ✨",
        description: "Sua experiência foi registrada para encorajar outros intercessores."
      });

      setTestimonyTitle('');
      setTestimonyContent('');
      setTestimonyAuthor('');
      setTestimonyCategory('');
      onSuccess();
    } catch (error) {
      console.error('Error submitting testimony:', error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao compartilhar o testemunho. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMission = async () => {
    if (!missionName.trim() || !missionOrganization.trim() || !missionContact.trim() || !missionFocus.trim() || !missionEstablished.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos da base missionária.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('mission_bases')
        .insert({
          location_id: location.id,
          name: missionName.trim(),
          organization: missionOrganization.trim(),
          contact: missionContact.trim(),
          focus: missionFocus.split(',').map(f => f.trim()),
          established: missionEstablished.trim()
        });

      if (error) throw error;

      toast({
        title: "Base Missionária Cadastrada! 🏛️",
        description: "As informações da base missionária foram registradas com sucesso."
      });

      setMissionName('');
      setMissionOrganization('');
      setMissionContact('');
      setMissionFocus('');
      setMissionEstablished('');
      onSuccess();
    } catch (error) {
      console.error('Error submitting mission base:', error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao cadastrar a base missionária. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>Contribuir para {location.name}</span>
              <p className="text-sm text-muted-foreground font-normal">
                Compartilhe palavras proféticas, alvos de oração, testemunhos ou bases missionárias
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="prophetic" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Profética
            </TabsTrigger>
            <TabsTrigger value="prayer" className="text-xs">
              <Sword className="h-3 w-3 mr-1" />
              Oração
            </TabsTrigger>
            <TabsTrigger value="testimony" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Testemunho
            </TabsTrigger>
            <TabsTrigger value="mission" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Missão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prophetic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  Compartilhar Palavra Profética
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prophetic-content">Conteúdo da Palavra *</Label>
                  <Textarea
                    id="prophetic-content"
                    value={propheticContent}
                    onChange={(e) => setPropheticContent(e.target.value)}
                    placeholder="Digite a palavra profética recebida para esta localização..."
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="prophetic-author">Seu Nome/Ministério *</Label>
                  <Input
                    id="prophetic-author"
                    value={propheticAuthor}
                    onChange={(e) => setPropheticAuthor(e.target.value)}
                    placeholder="Ex: Pr. João Silva, Profeta Ana, Ministério Palavra Viva"
                  />
                </div>
                <Button
                  onClick={handleSubmitProphetic}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {isSubmitting ? 'Enviando...' : 'Liberar Palavra Profética'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sword className="h-5 w-5 mr-2 text-blue-500" />
                  Cadastrar Alvo de Oração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prayer-title">Título do Alvo *</Label>
                  <Input
                    id="prayer-title"
                    value={prayerTitle}
                    onChange={(e) => setPrayerTitle(e.target.value)}
                    placeholder="Ex: Quebra de Fortaleza de Pobreza"
                  />
                </div>
                <div>
                  <Label htmlFor="prayer-description">Descrição Detalhada *</Label>
                  <Textarea
                    id="prayer-description"
                    value={prayerDescription}
                    onChange={(e) => setPrayerDescription(e.target.value)}
                    placeholder="Descreva específicamente o que precisa de intercessão..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Urgência *</Label>
                    <Select value={prayerUrgency} onValueChange={setPrayerUrgency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <Select value={prayerCategory} onValueChange={setPrayerCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spiritual">Espiritual</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="political">Político</SelectItem>
                        <SelectItem value="economic">Econômico</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitPrayer}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isSubmitting ? 'Enviando...' : 'Registrar Alvo de Oração'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimony" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Compartilhar Testemunho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testimony-title">Título do Testemunho *</Label>
                  <Input
                    id="testimony-title"
                    value={testimonyTitle}
                    onChange={(e) => setTestimonyTitle(e.target.value)}
                    placeholder="Ex: Cura Sobrenatural no Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="testimony-content">Relato do Testemunho *</Label>
                  <Textarea
                    id="testimony-content"
                    value={testimonyContent}
                    onChange={(e) => setTestimonyContent(e.target.value)}
                    placeholder="Conte detalhes de como Deus se moveu nesta localização..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testimony-author">Seu Nome *</Label>
                    <Input
                      id="testimony-author"
                      value={testimonyAuthor}
                      onChange={(e) => setTestimonyAuthor(e.target.value)}
                      placeholder="Seu nome ou iniciais"
                    />
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <Select value={testimonyCategory} onValueChange={setTestimonyCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healing">Cura</SelectItem>
                        <SelectItem value="salvation">Salvação</SelectItem>
                        <SelectItem value="breakthrough">Quebrantamento</SelectItem>
                        <SelectItem value="revival">Avivamento</SelectItem>
                        <SelectItem value="miracle">Milagre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitTestimony}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {isSubmitting ? 'Enviando...' : 'Compartilhar Testemunho'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-500" />
                  Cadastrar Base Missionária
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mission-name">Nome da Base *</Label>
                    <Input
                      id="mission-name"
                      value={missionName}
                      onChange={(e) => setMissionName(e.target.value)}
                      placeholder="Centro de Missões..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="mission-organization">Organização *</Label>
                    <Input
                      id="mission-organization"
                      value={missionOrganization}
                      onChange={(e) => setMissionOrganization(e.target.value)}
                      placeholder="JOCUM, OM, etc."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mission-contact">Contato *</Label>
                  <Input
                    id="mission-contact"
                    value={missionContact}
                    onChange={(e) => setMissionContact(e.target.value)}
                    placeholder="email@exemplo.com ou telefone"
                  />
                </div>
                <div>
                  <Label htmlFor="mission-focus">Áreas de Foco *</Label>
                  <Input
                    id="mission-focus"
                    value={missionFocus}
                    onChange={(e) => setMissionFocus(e.target.value)}
                    placeholder="evangelismo, plantação de igrejas, ação social (separado por vírgulas)"
                  />
                </div>
                <div>
                  <Label htmlFor="mission-established">Ano de Fundação *</Label>
                  <Input
                    id="mission-established"
                    value={missionEstablished}
                    onChange={(e) => setMissionEstablished(e.target.value)}
                    placeholder="2010"
                  />
                </div>
                <Button
                  onClick={handleSubmitMission}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {isSubmitting ? 'Enviando...' : 'Cadastrar Base Missionária'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionModal; 