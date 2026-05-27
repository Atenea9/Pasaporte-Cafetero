const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface VisitorStats {
  points: number;
  stamps: string[];
  level: string;
}

export const mockDbService = {
  // --- MÉTODOS DE VISITANTE ---
  async getHomeStats() {
    await delay(300);
    return { visitorCount: 1420, activeStands: 45, happyHour: true };
  },

  async getLeaderboard() {
    await delay(300);
    return [
      { id: '1', name: 'Carlos M.', points: 2500, municipality: 'Planadas' },
      { id: '2', name: 'Laura G.', points: 2100, municipality: 'Chaparral' },
      { id: '3', name: 'Andrés F.', points: 1850, municipality: 'Ibagué' },
    ];
  },

  async getUserStats(uid: string): Promise<VisitorStats> {
    await delay(300);
    return { points: 1250, stamps: ['Chaparral', 'Planadas', 'Génova'], level: 'Degustador' };
  },

  // --- MÉTODOS DE EXPOSITOR (PASO 4) ---
  async getStandStats(expositorUid: string) {
    await delay(300);
    return {
      standName: 'Café Las Palmas',
      municipality: 'Planadas',
      todaySalesCOP: 245000,
      stampsIssued: 32,
    };
  },

  async registerSale(expositorUid: string, visitorUid: string, amountCOP: number) {
    await delay(600);
    // Lógica de puntos: 1 punto por cada $1,000 COP
    const pointsAwarded = Math.floor(amountCOP / 1000);
    return {
      success: true,
      pointsAwarded,
      message: `Se otorgaron ${pointsAwarded} puntos y un sello de visitante.`,
    };
  },
};
