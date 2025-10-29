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
import { useTranslation } from '@/hooks/useTranslation';

interface ContributionModalProps {
  location: LocationData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ContributionModal = ({ location, isOpen, onClose, onSuccess }: ContributionModalProps) => {
  const { t } = useTranslation();
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
        description: t('contribution.prophetic.errorRequired'),
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
        description: t('contribution.prophetic.errorSubmit'),
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
        description: t('contribution.prayer.errorRequired'),
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
        description: t('contribution.prayer.errorSubmit'),
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
        description: t('contribution.testimony.errorRequired'),
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
        description: t('contribution.testimony.errorSubmit'),
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
        description: t('contribution.mission.errorRequired'),
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
        description: t('contribution.mission.errorSubmit'),
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
              {t('contribution.tabs.prophetic')}
            </TabsTrigger>
            <TabsTrigger value="prayer" className="text-xs">
              <Sword className="h-3 w-3 mr-1" />
              {t('contribution.tabs.prayer')}
            </TabsTrigger>
            <TabsTrigger value="testimony" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              {t('contribution.tabs.testimony')}
            </TabsTrigger>
            <TabsTrigger value="mission" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {t('contribution.tabs.mission')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prophetic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  {t('contribution.prophetic.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prophetic-content">{t('contribution.prophetic.content')} *</Label>
                  <Textarea
                    id="prophetic-content"
                    value={propheticContent}
                    onChange={(e) => setPropheticContent(e.target.value)}
                    placeholder={t('contribution.prophetic.contentPlaceholder')}
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="prophetic-author">{t('contribution.prophetic.author')} *</Label>
                  <Input
                    id="prophetic-author"
                    value={propheticAuthor}
                    onChange={(e) => setPropheticAuthor(e.target.value)}
                    placeholder={t('contribution.prophetic.authorPlaceholder')}
                  />
                </div>
                <Button
                  onClick={handleSubmitProphetic}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {isSubmitting ? t('contribution.prophetic.submitting') : t('contribution.prophetic.submit')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prayer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sword className="h-5 w-5 mr-2 text-blue-500" />
                  {t('contribution.prayer.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prayer-title">{t('contribution.prayer.target')} *</Label>
                  <Input
                    id="prayer-title"
                    value={prayerTitle}
                    onChange={(e) => setPrayerTitle(e.target.value)}
                    placeholder={t('contribution.prayer.targetPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="prayer-description">{t('contribution.prayer.target')} *</Label>
                  <Textarea
                    id="prayer-description"
                    value={prayerDescription}
                    onChange={(e) => setPrayerDescription(e.target.value)}
                    placeholder={t('contribution.prayer.targetPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('contribution.prayer.urgency')} *</Label>
                    <Select value={prayerUrgency} onValueChange={setPrayerUrgency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contribution.prayer.urgencyPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('contribution.prayer.urgencyLow')}</SelectItem>
                        <SelectItem value="medium">{t('contribution.prayer.urgencyMedium')}</SelectItem>
                        <SelectItem value="high">{t('contribution.prayer.urgencyHigh')}</SelectItem>
                        <SelectItem value="critical">{t('contribution.prayer.urgencyCritical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('contribution.prayer.category')} *</Label>
                    <Select value={prayerCategory} onValueChange={setPrayerCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contribution.prayer.categoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spiritual">{t('contribution.prayer.categorySpiritual')}</SelectItem>
                        <SelectItem value="social">{t('contribution.prayer.categorySocial')}</SelectItem>
                        <SelectItem value="political">{t('contribution.prayer.categoryPolitical')}</SelectItem>
                        <SelectItem value="economic">{t('contribution.prayer.categoryEconomic')}</SelectItem>
                        <SelectItem value="natural">{t('contribution.prayer.categoryNatural')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitPrayer}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isSubmitting ? t('contribution.prayer.submitting') : t('contribution.prayer.submit')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimony" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  {t('contribution.testimony.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testimony-title">{t('contribution.testimony.content')} *</Label>
                  <Input
                    id="testimony-title"
                    value={testimonyTitle}
                    onChange={(e) => setTestimonyTitle(e.target.value)}
                    placeholder={t('contribution.testimony.contentPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="testimony-content">{t('contribution.testimony.content')} *</Label>
                  <Textarea
                    id="testimony-content"
                    value={testimonyContent}
                    onChange={(e) => setTestimonyContent(e.target.value)}
                    placeholder={t('contribution.testimony.contentPlaceholder')}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testimony-author">{t('contribution.testimony.author')} *</Label>
                    <Input
                      id="testimony-author"
                      value={testimonyAuthor}
                      onChange={(e) => setTestimonyAuthor(e.target.value)}
                      placeholder={t('contribution.testimony.authorPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('contribution.testimony.category')} *</Label>
                    <Select value={testimonyCategory} onValueChange={setTestimonyCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contribution.testimony.categoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healing">{t('contribution.testimony.categoryHealing')}</SelectItem>
                        <SelectItem value="salvation">{t('contribution.testimony.categorySalvation')}</SelectItem>
                        <SelectItem value="breakthrough">{t('contribution.testimony.categoryBreakthrough')}</SelectItem>
                        <SelectItem value="revival">{t('contribution.testimony.categoryRevival')}</SelectItem>
                        <SelectItem value="miracle">{t('contribution.testimony.categoryMiracle')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmitTestimony}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {isSubmitting ? t('contribution.testimony.submitting') : t('contribution.testimony.submit')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-500" />
                  {t('contribution.mission.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mission-name">{t('contribution.mission.name')} *</Label>
                    <Input
                      id="mission-name"
                      value={missionName}
                      onChange={(e) => setMissionName(e.target.value)}
                      placeholder={t('contribution.mission.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mission-organization">{t('contribution.mission.leader')} *</Label>
                    <Input
                      id="mission-organization"
                      value={missionOrganization}
                      onChange={(e) => setMissionOrganization(e.target.value)}
                      placeholder={t('contribution.mission.leaderPlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mission-contact">{t('contribution.mission.contact')} *</Label>
                  <Input
                    id="mission-contact"
                    value={missionContact}
                    onChange={(e) => setMissionContact(e.target.value)}
                    placeholder={t('contribution.mission.contactPlaceholder')}
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
                  <Label htmlFor="mission-established">{t('contribution.mission.established')} *</Label>
                  <Input
                    id="mission-established"
                    value={missionEstablished}
                    onChange={(e) => setMissionEstablished(e.target.value)}
                    placeholder={t('contribution.mission.establishedPlaceholder')}
                  />
                </div>
                <Button
                  onClick={handleSubmitMission}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {isSubmitting ? t('contribution.mission.submitting') : t('contribution.mission.submit')}
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