const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface VisitorStats {
  points: number;
  stamps: string[];
  level: string;
}

export const mockDbService = {
  async getHomeStats() {
    await delay(300);
    return {
      visitorCount: 1420,
      activeStands: 45,
      happyHour: true,
    };
  },

  async getLeaderboard() {
    await delay(300);
    return [
      { id: '1', name: 'Carlos M.', points: 2500, municipality: 'Planadas' },
      { id: '2', name: 'Laura G.', points: 2100, municipality: 'Chaparral' },
      { id: '3', name: 'Andrés F.', points: 1850, municipality: 'Ibagué' },
      { id: '4', name: 'Diana R.', points: 1600, municipality: 'Líbano' },
      { id: '5', name: 'Tú', points: 0, municipality: 'TBD' },
    ];
  },

  async getUserStats(uid: string): Promise<VisitorStats> {
    await delay(300);
    return {
      points: 1250,
      stamps: ['Chaparral', 'Planadas', 'Génova'],
      level: 'Degustador',
    };
  },
};
