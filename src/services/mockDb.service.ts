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
    ];
  },

  async getUserStats(uid: string): Promise<VisitorStats> {
    await delay(300);
    return { points: 1250, stamps: ['Chaparral', 'Planadas'], level: 'Degustador' };
  },

  // --- MÉTODOS DE EXPOSITOR (STAND) ---
  async getStandStats(expositorUid: string) {
    await delay(300);
    return { standName: 'Café Las Palmas', municipality: 'Planadas', todaySalesCOP: 245000, stampsIssued: 32 };
  },

  async registerSale(expositorUid: string, visitorUid: string, amountCOP: number) {
    await delay(600);
    return { success: true, pointsAwarded: Math.floor(amountCOP / 1000), message: 'Venta y puntos registrados.' };
  },

  // --- MÉTODOS DE EXPOSITOR (SUBASTA - PASO 5) ---
  async getAuctionLotStatus(expositorUid: string) {
    await delay(400);
    // Estados posibles: 'no_registrado', 'borrador', 'pendiente_revision', 'aprobado'
    return { status: 'borrador', scaScore: 0, farmName: 'Finca El Mirador' };
  },

  async saveAuctionProfile(expositorUid: string, profileData: any) {
    await delay(600);
    return { success: true, message: 'Perfil de finca guardado correctamente.' };
  },

  async submitScaAnalysis(expositorUid: string, scaData: any) {
    await delay(800);
    return { success: true, message: 'Análisis SCA enviado a la Universidad del Tolima para revisión.' };
  },
};
