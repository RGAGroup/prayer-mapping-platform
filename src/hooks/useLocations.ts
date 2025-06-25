
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LocationData } from '@/types/Location';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<LocationData[]> => {
      console.log('Fetching locations from Supabase...');
      
      // Buscar localizações
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }

      if (!locations) {
        console.log('No locations found');
        return [];
      }

      console.log('Found locations:', locations.length);

      // Para cada localização, buscar os dados relacionados
      const locationsWithData = await Promise.all(
        locations.map(async (location) => {
          console.log(`Fetching data for location: ${location.name}`);
          
          // Buscar palavras proféticas
          const { data: propheticWords } = await supabase
            .from('prophetic_words')
            .select('*')
            .eq('location_id', location.id)
            .order('date', { ascending: false });

          // Buscar alvos de oração
          const { data: prayerTargets } = await supabase
            .from('prayer_targets')
            .select('*')
            .eq('location_id', location.id)
            .order('created_at', { ascending: false });

          // Buscar alertas espirituais
          const { data: spiritualAlerts } = await supabase
            .from('spiritual_alerts')
            .select('*')
            .eq('location_id', location.id)
            .order('reported_at', { ascending: false });

          // Buscar testemunhos
          const { data: testimonies } = await supabase
            .from('testimonies')
            .select('*')
            .eq('location_id', location.id)
            .order('date', { ascending: false });

          // Buscar bases missionárias
          const { data: missionBases } = await supabase
            .from('mission_bases')
            .select('*')
            .eq('location_id', location.id)
            .order('name');

          // Converter para o formato esperado pela interface
          const locationData: LocationData = {
            id: location.id,
            name: location.name,
            type: location.type as LocationData['type'],
            coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
            level: location.level,
            parentId: location.parent_id || undefined,
            propheticWords: (propheticWords || []).map(word => ({
              id: word.id,
              content: word.content,
              author: word.author,
              date: word.date,
              isVerified: word.is_verified || false
            })),
            prayerTargets: (prayerTargets || []).map(target => ({
              id: target.id,
              title: target.title,
              description: target.description,
              urgency: target.urgency as LocationData['prayerTargets'][0]['urgency'],
              category: target.category as LocationData['prayerTargets'][0]['category']
            })),
            spiritualAlerts: (spiritualAlerts || []).map(alert => ({
              id: alert.id,
              type: alert.type as LocationData['spiritualAlerts'][0]['type'],
              title: alert.title,
              description: alert.description,
              severity: alert.severity as LocationData['spiritualAlerts'][0]['severity'],
              reportedAt: alert.reported_at || alert.created_at
            })),
            testimonies: (testimonies || []).map(testimony => ({
              id: testimony.id,
              title: testimony.title,
              content: testimony.content,
              author: testimony.author,
              date: testimony.date,
              category: testimony.category as LocationData['testimonies'][0]['category']
            })),
            missionBases: (missionBases || []).map(base => ({
              id: base.id,
              name: base.name,
              organization: base.organization,
              contact: base.contact,
              focus: base.focus,
              established: base.established
            })),
            intercessorCount: location.intercessor_count || 0,
            lastActivity: location.last_activity || location.created_at
          };

          return locationData;
        })
      );

      console.log('Locations with full data loaded:', locationsWithData.length);
      return locationsWithData;
    },
  });
};
