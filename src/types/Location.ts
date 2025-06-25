
export interface PropheticWord {
  id: string;
  content: string;
  author: string;
  date: string;
  isVerified: boolean;
}

export interface PrayerTarget {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'spiritual' | 'social' | 'political' | 'economic' | 'natural';
}

export interface SpiritualAlert {
  id: string;
  type: 'persecution' | 'idolatry' | 'warfare' | 'breakthrough' | 'revival';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  reportedAt: string;
}

export interface Testimony {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'healing' | 'salvation' | 'breakthrough' | 'revival' | 'miracle';
}

export interface MissionBase {
  id: string;
  name: string;
  organization: string;
  contact: string;
  focus: string[];
  established: string;
}

export interface LocationData {
  id: string;
  name: string;
  type: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  coordinates: [number, number];
  level: number;
  parentId?: string;
  propheticWords: PropheticWord[];
  prayerTargets: PrayerTarget[];
  spiritualAlerts: SpiritualAlert[];
  testimonies: Testimony[];
  missionBases: MissionBase[];
  intercessorCount: number;
  lastActivity: string;
}
