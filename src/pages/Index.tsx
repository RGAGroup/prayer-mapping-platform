import { useState, useEffect } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import ContributionModal from '@/components/ContributionModal';
import LocationPanel from '@/components/LocationPanel';
import RegionalMapComponent from '@/components/map/RegionalMapComponent';
import ApiKeyInput from '@/components/map/ApiKeyInput';

import { LocationData } from '@/types/Location';
import { useLocations } from '@/hooks/useLocations';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const { isAuthenticated } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<{ name: string; type: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0');
  const [showApiInput, setShowApiInput] = useState(false);

  
  const { data: locations = [] } = useLocations();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('google-maps-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Configurar API key padrão
      localStorage.setItem('google-maps-api-key', 'AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0');
    }
    setShowApiInput(false);
  }, []);

  const handleApiKeySubmit = (newApiKey: string) => {
    localStorage.setItem('google-maps-api-key', newApiKey);
    setApiKey(newApiKey);
    setShowApiInput(false);
  };

  const handleRegionSelect = (regionName: string, regionType: string) => {
    console.log('🎯 Região selecionada:', regionName, regionType);
    setSelectedRegion({ name: regionName, type: regionType });
    // O popup com dados espirituais é mostrado automaticamente pelo RegionalMapComponent
  };

  if (showApiInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <Header 
          onAuthClick={() => setShowAuthModal(true)}
          isAuthenticated={isAuthenticated}
        />
        <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header 
        onAuthClick={() => setShowAuthModal(true)}
        isAuthenticated={isAuthenticated}
      />
      
      <main className="relative h-screen">
        {/* Wrapper do Google Maps */}
        <Wrapper apiKey={apiKey} version="beta" libraries={["marker", "geometry", "places"]}>
          <RegionalMapComponent onRegionSelect={handleRegionSelect} />
        </Wrapper>
        
        {/* Location Panel */}
        {selectedLocation && (
          <LocationPanel
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onContribute={() => setShowContributionModal(true)}
            isAuthenticated={isAuthenticated}
          />
        )}


      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {/* Contribution Modal */}
      {showContributionModal && selectedLocation && (
        <ContributionModal
          location={selectedLocation}
          isOpen={showContributionModal}
          onClose={() => setShowContributionModal(false)}
          onSuccess={() => setShowContributionModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
