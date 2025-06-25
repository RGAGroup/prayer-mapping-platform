
import { LocationData, PropheticWord, PrayerTarget, SpiritualAlert, Testimony, MissionBase } from '@/types/Location';

export const generateMockLocations = (): LocationData[] => {
  return [
    {
      id: '1',
      name: 'São Paulo',
      type: 'city',
      coordinates: [35, 65],
      level: 4,
      parentId: 'brazil',
      intercessorCount: 234,
      lastActivity: 'há 2 minutos',
      propheticWords: [
        {
          id: 'pw1',
          content: 'Vejo um mover poderoso de restauração sobre esta cidade. Deus está levantando uma geração de adoradores que transformará o centro financeiro em centro espiritual.',
          author: 'Profeta Ana Silva',
          date: '15 de Junho, 2024',
          isVerified: true
        },
        {
          id: 'pw2',
          content: 'O Senhor diz: "Eu quebrarei as cadeias de mamom sobre esta cidade e estabelecerei Minha justiça nas empresas e instituições."',
          author: 'Pr. João Santos',
          date: '10 de Junho, 2024',
          isVerified: false
        }
      ],
      prayerTargets: [
        {
          id: 'pt1',
          title: 'Quebra de Espírito de Mamom',
          description: 'Orar pela libertação do centro financeiro de fortalezas econômicas malignas',
          urgency: 'high',
          category: 'spiritual'
        },
        {
          id: 'pt2',
          title: 'Avivamento nas Periferias',
          description: 'Clamar por visitação divina nas comunidades carentes',
          urgency: 'critical',
          category: 'social'
        }
      ],
      spiritualAlerts: [
        {
          id: 'sa1',
          type: 'warfare',
          title: 'Intensificação de Atividade Demoníaca',
          description: 'Relatos de opressão espiritual no centro da cidade',
          severity: 'warning',
          reportedAt: 'há 1 hora'
        }
      ],
      testimonies: [
        {
          id: 't1',
          title: 'Empresário Convertido no Centro',
          content: 'Executivo de multinacional teve encontro com Jesus durante horário de almoço na Avenida Paulista',
          author: 'Missionária Rosa',
          date: '12 de Junho, 2024',
          category: 'salvation'
        }
      ],
      missionBases: [
        {
          id: 'mb1',
          name: 'Centro de Missões Urbanas',
          organization: 'Jovens com uma Missão',
          contact: 'contato@jocum-sp.org',
          focus: ['evangelismo', 'ação social', 'plantação de igrejas'],
          established: '1998'
        }
      ]
    },
    {
      id: '2',
      name: 'Lagos',
      type: 'city',
      coordinates: [48, 45],
      level: 4,
      parentId: 'nigeria',
      intercessorCount: 189,
      lastActivity: 'há 5 minutos',
      propheticWords: [
        {
          id: 'pw3',
          content: 'Lagos será porta de avivamento para toda a África. Vejo ondas de glória partindo desta cidade para todas as nações.',
          author: 'Prophet Michael Adebayo',
          date: '18 de Junho, 2024',
          isVerified: true
        }
      ],
      prayerTargets: [
        {
          id: 'pt3',
          title: 'Transformação da Indústria do Entretenimento',
          description: 'Orar por Nollywood e influência cristã na mídia africana',
          urgency: 'medium',
          category: 'social'
        }
      ],
      spiritualAlerts: [
        {
          id: 'sa2',
          type: 'breakthrough',
          title: 'Movimento de Oração 24/7',
          description: 'Jovens iniciaram vigília contínua de intercessão',
          severity: 'info',
          reportedAt: 'há 30 minutos'
        }
      ],
      testimonies: [
        {
          id: 't2',
          title: 'Milagre Financeiro na Bolsa de Lagos',
          content: 'Intercessor viu visão profética que evitou crash financeiro, salvando milhares de empregos',
          author: 'Apostle John Okoli',
          date: '16 de Junho, 2024',
          category: 'miracle'
        }
      ],
      missionBases: []
    },
    {
      id: '3',
      name: 'Jerusalém',
      type: 'city',
      coordinates: [52, 48],
      level: 4,
      parentId: 'israel',
      intercessorCount: 156,
      lastActivity: 'há 1 minuto',
      propheticWords: [
        {
          id: 'pw4',
          content: 'O Senhor está preparando Jerusalém para a maior colheita de almas da história. Judeus e árabes adorarão juntos.',
          author: 'Rabbi Messianic David',
          date: '20 de Junho, 2024',
          isVerified: true
        }
      ],
      prayerTargets: [
        {
          id: 'pt4',
          title: 'Paz entre Judeus e Palestinos',
          description: 'Intercessão pela reconciliação e amor mútuo',
          urgency: 'critical',
          category: 'political'
        },
        {
          id: 'pt5',
          title: 'Despertar Espiritual em Israel',
          description: 'Orar pelo reconhecimento de Yeshua como Messias',
          urgency: 'high',
          category: 'spiritual'
        }
      ],
      spiritualAlerts: [],
      testimonies: [
        {
          id: 't3',
          title: 'Soldado Israelense Encontra Yeshua',
          content: 'Durante serviço militar, jovem teve visão de Jesus na Cidade Velha',
          author: 'Messianic Leader Sarah',
          date: '19 de Junho, 2024',
          category: 'salvation'
        }
      ],
      missionBases: [
        {
          id: 'mb2',
          name: 'Casa Internacional de Oração',
          organization: 'IHOP Jerusalem',
          contact: 'info@ihop-jerusalem.org',
          focus: ['intercessão 24/7', 'adoração', 'reconciliação'],
          established: '2005'
        }
      ]
    },
    {
      id: '4',
      name: 'Manila',
      type: 'city',
      coordinates: [75, 58],
      level: 4,
      parentId: 'philippines',
      intercessorCount: 201,
      lastActivity: 'há 3 minutos',
      propheticWords: [
        {
          id: 'pw5',
          content: 'As Filipinas serão Antioquia dos últimos dias, enviando missionários para toda a Ásia.',
          author: 'Pastor Rico Villanueva',
          date: '17 de Junho, 2024',
          isVerified: true
        }
      ],
      prayerTargets: [
        {
          id: 'pt6',
          title: 'Proteção Contra Tufões',
          description: 'Orar por proteção divina durante temporada de tempestades',
          urgency: 'high',
          category: 'natural'
        }
      ],
      spiritualAlerts: [
        {
          id: 'sa3',
          type: 'revival',
          title: 'Derramamento do Espírito nas Universidades',
          description: 'Estudantes relatam sonhos proféticos e conversões em massa',
          severity: 'info',
          reportedAt: 'há 15 minutos'
        }
      ],
      testimonies: [
        {
          id: 't4',
          title: 'Cura Sobrenatural em Hospital',
          content: 'Paciente desenganado foi curado instantaneamente após oração de estudantes cristãos',
          author: 'Dr. Maria Santos',
          date: '18 de Junho, 2024',
          category: 'healing'
        }
      ],
      missionBases: []
    },
    {
      id: '5',
      name: 'Londres',
      type: 'city',
      coordinates: [47, 35],
      level: 4,
      parentId: 'uk',
      intercessorCount: 178,
      lastActivity: 'há 8 minutos',
      propheticWords: [
        {
          id: 'pw6',
          content: 'Vejo um novo movimento apostólico emergindo do Reino Unido, que alcançará toda a Europa com sinais e maravilhas.',
          author: 'Prophet Emma Johnson',
          date: '14 de Junho, 2024',
          isVerified: false
        }
      ],
      prayerTargets: [
        {
          id: 'pt7',
          title: 'Avivamento nas Universidades Seculares',
          description: 'Clamar por visitação do Espírito Santo em Oxford e Cambridge',
          urgency: 'medium',
          category: 'spiritual'
        }
      ],
      spiritualAlerts: [],
      testimonies: [],
      missionBases: [
        {
          id: 'mb3',
          name: 'Centro Missionário Europeu',
          organization: 'OM International',
          contact: 'europe@om.org',
          focus: ['missões europeias', 'refugiados', 'plantação de igrejas'],
          established: '1967'
        }
      ]
    }
  ];
};
