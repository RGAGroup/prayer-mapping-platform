import { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { LocationData } from '@/types/Location';
import { useLocations } from '@/hooks/useLocations';
import MapComponent from './map/MapComponent';
import ApiKeyInput from './map/ApiKeyInput';
import MapLegend from './map/MapLegend';
import GlobalActivity from './map/GlobalActivity';
import ApiKeyReset from './map/ApiKeyReset';
import MapLoading from './map/MapLoading';
import MapError from './map/MapError';

interface GoogleMapComponentProps {
  onLocationSelect: (location: LocationData) => void;
}

const GoogleMapComponent = ({ onLocationSelect }: GoogleMapComponentProps) => {
  const { data: locations = [], isLoading, error } = useLocations();
  const [apiKey, setApiKey] = useState<string>('AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0');
  const [showApiInput, setShowApiInput] = useState(false);

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

  const handleApiKeyReset = () => {
    localStorage.removeItem('google-maps-api-key');
    setShowApiInput(true);
  };

  if (isLoading) {
    return <MapLoading />;
  }

  if (error) {
    return <MapError />;
  }

  if (showApiInput) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="relative h-screen w-full">
              <Wrapper apiKey={apiKey} version="beta" libraries={["marker", "geometry", "places"]}>
        <MapComponent locations={locations} onLocationSelect={onLocationSelect} />
      </Wrapper>

      <MapLegend />
      <GlobalActivity locations={locations} />
      <ApiKeyReset onReset={handleApiKeyReset} />
    </div>
  );
};

export default GoogleMapComponent;
