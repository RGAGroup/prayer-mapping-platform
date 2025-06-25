import { useState, useEffect, useMemo } from 'react';
import { useLocations } from './useLocations';
import { LocationData } from '@/types/Location';

export interface HierarchicalLevel {
  level: 'world' | 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  zoom: number;
  data: LocationData | null;
  children: LocationData[];
  aggregatedData: {
    totalIntercessors: number;
    totalPropheticWords: number;
    totalPrayerTargets: number;
    totalAlerts: number;
    totalTestimonies: number;
    totalMissionBases: number;
    criticalAlerts: LocationData[];
    revivalCenters: LocationData[];
  };
}

interface UseHierarchicalDataProps {
  currentZoom: number;
  currentCenter: { lat: number; lng: number };
  selectedLocationId?: string;
}

export const useHierarchicalData = ({ 
  currentZoom, 
  currentCenter, 
  selectedLocationId 
}: UseHierarchicalDataProps) => {
  const { data: allLocations = [], isLoading, error } = useLocations();
  const [currentLevel, setCurrentLevel] = useState<HierarchicalLevel['level']>('world');

  // Determinar nível hierárquico baseado no zoom
  const determineLevel = (zoom: number): HierarchicalLevel['level'] => {
    if (zoom <= 3) return 'world';
    if (zoom <= 5) return 'continent';
    if (zoom <= 8) return 'country';
    if (zoom <= 12) return 'state';
    if (zoom <= 15) return 'city';
    return 'neighborhood';
  };

  // Calcular distância entre dois pontos
  const getDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Encontrar localização mais próxima baseada no centro do mapa
  const findClosestLocation = (locations: LocationData[], center: { lat: number; lng: number }, level: string) => {
    const levelLocations = locations.filter(loc => loc.type === level);
    if (levelLocations.length === 0) return null;

    let closest = levelLocations[0];
    let minDistance = getDistance(center, { lat: closest.coordinates[1], lng: closest.coordinates[0] });

    levelLocations.forEach(location => {
      const distance = getDistance(center, { lat: location.coordinates[1], lng: location.coordinates[0] });
      if (distance < minDistance) {
        minDistance = distance;
        closest = location;
      }
    });

    return closest;
  };

  // Buscar filhos de uma localização
  const getChildren = (parentId: string | null, targetLevel: string) => {
    return allLocations.filter(loc => loc.parentId === parentId && loc.type === targetLevel);
  };

  // Buscar todos os descendentes de uma localização
  const getAllDescendants = (locationId: string): LocationData[] => {
    const directChildren = allLocations.filter(loc => loc.parentId === locationId);
    const allDescendants = [...directChildren];
    
    directChildren.forEach(child => {
      allDescendants.push(...getAllDescendants(child.id));
    });
    
    return allDescendants;
  };

  // Calcular dados agregados
  const calculateAggregatedData = (location: LocationData | null, children: LocationData[]) => {
    const allRelevantLocations = location ? [location, ...getAllDescendants(location.id)] : children;
    
    return {
      totalIntercessors: allRelevantLocations.reduce((sum, loc) => sum + loc.intercessorCount, 0),
      totalPropheticWords: allRelevantLocations.reduce((sum, loc) => sum + loc.propheticWords.length, 0),
      totalPrayerTargets: allRelevantLocations.reduce((sum, loc) => sum + loc.prayerTargets.length, 0),
      totalAlerts: allRelevantLocations.reduce((sum, loc) => sum + loc.spiritualAlerts.length, 0),
      totalTestimonies: allRelevantLocations.reduce((sum, loc) => sum + loc.testimonies.length, 0),
      totalMissionBases: allRelevantLocations.reduce((sum, loc) => sum + loc.missionBases.length, 0),
      criticalAlerts: allRelevantLocations.filter(loc => 
        loc.spiritualAlerts.some(alert => alert.severity === 'danger')
      ),
      revivalCenters: allRelevantLocations.filter(loc => 
        loc.spiritualAlerts.some(alert => alert.type === 'revival')
      )
    };
  };

  // Hook principal para dados hierárquicos
  const hierarchicalData = useMemo(() => {
    if (isLoading || !allLocations.length) return null;

    const level = determineLevel(currentZoom);
    let currentData: LocationData | null = null;
    let children: LocationData[] = [];

    // Se há uma localização selecionada, usar ela
    if (selectedLocationId) {
      currentData = allLocations.find(loc => loc.id === selectedLocationId) || null;
      if (currentData) {
        const childLevelMap: Record<string, string> = {
          continent: 'country',
          country: 'state', 
          state: 'city',
          city: 'neighborhood'
        };
        const childLevel = childLevelMap[currentData.type];
        if (childLevel) {
          children = getChildren(currentData.id, childLevel);
        }
      }
    } else {
      // Determinar localização baseada no zoom e centro
      switch (level) {
        case 'world':
          children = allLocations.filter(loc => loc.type === 'continent');
          break;
        case 'continent':
          currentData = findClosestLocation(allLocations, currentCenter, 'continent');
          if (currentData) {
            children = getChildren(currentData.id, 'country');
          }
          break;
        case 'country':
          currentData = findClosestLocation(allLocations, currentCenter, 'country');
          if (currentData) {
            children = getChildren(currentData.id, 'state');
          }
          break;
        case 'state':
          currentData = findClosestLocation(allLocations, currentCenter, 'state');
          if (currentData) {
            children = getChildren(currentData.id, 'city');
          }
          break;
        case 'city':
          currentData = findClosestLocation(allLocations, currentCenter, 'city');
          if (currentData) {
            children = getChildren(currentData.id, 'neighborhood');
          }
          break;
        case 'neighborhood':
          currentData = findClosestLocation(allLocations, currentCenter, 'neighborhood');
          children = [];
          break;
      }
    }

    const aggregatedData = calculateAggregatedData(currentData, children);

    return {
      level,
      zoom: currentZoom,
      data: currentData,
      children,
      aggregatedData
    };
  }, [allLocations, currentZoom, currentCenter, selectedLocationId, isLoading]);

  useEffect(() => {
    if (hierarchicalData) {
      setCurrentLevel(hierarchicalData.level);
    }
  }, [hierarchicalData]);

  return {
    hierarchicalData,
    currentLevel,
    isLoading,
    error,
    allLocations
  };
}; 