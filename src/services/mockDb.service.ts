const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface VisitorStats {
  points: number;
  stamps: string[];
  level: string;
}

export const mockDbService = {
  globalConfig: { happyHourActive: false },

  async getHomeStats() {
    await delay(300);
    return { visitorCount: 1420, activeStands: 45, happyHour: this.globalConfig.happyHourActive };
  },
  async getLeaderboard() {
    await delay(300);
    return [
      { id: '1', name: 'Carlos M.', points: 2500, municipality: 'Planadas' },
      { id: '2', name: 'Laura G.', points: 2100, municipality: 'Chaparral' },
    ];
  },
  async getUserStats(uid: string) {
    await delay(300);
    return { points: 1250, stamps: ['Chaparral', 'Planadas'], level: 'Degustador' };
  },
  async getStandStats(expositorUid: string) {
    await delay(300);
    return { standName: 'Café Las Palmas', municipality: 'Planadas', todaySalesCOP: 245000, stampsIssued: 32 };
  },

  async registerSale(expositorUid: string, visitorUid: string, amountCOP: number) {
    await delay(600);
    if (amountCOP <= 0) throw new Error('Monto inválido');
    let points = Math.floor(amountCOP / 1000);
    if (this.globalConfig.happyHourActive) points *= 2;
    return { success: true, pointsAwarded: points, message: `Venta registrada. Puntos: ${points}` };
  },

  async getAuctionLotStatus(expositorUid: string) {
    await delay(400);
    return { status: 'aprobado', scaScore: 88.5, farmName: 'Finca El Mirador' };
  },
  async saveAuctionProfile(uid: string, data: any) { await delay(600); return { success: true }; },
  async submitScaAnalysis(uid: string, data: any) { await delay(800); return { success: true }; },

  async getAuctionLots() {
    await delay(500);
    return [
      { id: 'lot_1', farmName: 'Finca El Mirador', municipality: 'Planadas', variety: 'Geisha', scaScore: 89.5, currentBidUSD: 15.50, lotSizeKg: 200 },
      { id: 'lot_2', farmName: 'Hacienda La Palma', municipality: 'Chaparral', variety: 'Caturra', scaScore: 86.0, currentBidUSD: 8.00, lotSizeKg: 350 },
    ];
  },
  async getLotDetails(lotId: string) {
    await delay(400);
    return {
      id: lotId,
      farmName: 'Finca El Mirador',
      owner: 'José Gómez',
      municipality: 'Planadas',
      altitude: '1850',
      variety: 'Geisha',
      process: 'Lavado',
      lotSizeKg: 200,
      scaScore: 89.5,
      currentBidUSD: 15.50,
      scaDetails: {
        aroma: 8.5, flavor: 9.0, aftertaste: 8.5, acidity: 9.0,
        body: 8.0, balance: 8.5, uniformity: 10, cleanCup: 10,
        sweetness: 10, overall: 8.0,
      },
    };
  },
  async placeBid(lotId: string, buyerUid: string, bidAmountUSD: number) {
    await delay(700);
    const currentLot = await this.getLotDetails(lotId);
    if (bidAmountUSD <= currentLot.currentBidUSD) throw new Error('La oferta debe ser mayor a la puja actual.');
    return { success: true, message: '¡Puja realizada con éxito!' };
  },
  async getCompradorStats(uid: string) {
    await delay(300);
    return { activeBids: 2, lotsWon: 0, stamps: ['Subasta VIP'] };
  },

  async getAdminKPIs() {
    await delay(400);
    return {
      totalVisitors: 1500,
      activeStands: 45,
      totalPoints: 125000,
      happyHour: this.globalConfig.happyHourActive,
    };
  },
  async toggleHappyHour() {
    await delay(300);
    this.globalConfig.happyHourActive = !this.globalConfig.happyHourActive;
    return this.globalConfig.happyHourActive;
  },

  async getCeoMetrics() {
    await delay(500);
    return {
      totalUsers: 2100,
      activeBuyers: 45,
      totalAuctionValueUSD: 12400,
      sysStatus: 'Operativo',
    };
  },
  async generateDatabaseExport() {
    await delay(1500);
    return { success: true, url: 'file://simulated/path/pasaporte_export.xlsx' };
  },

  async getAnalyticsData() {
    await delay(400);
    return {
      kpis: {
        totalAttendees: 1420,
        totalRevenueCOP: 24500000,
        avgRating: 4.7,
        activeLots: 12,
      },
      attendanceTrend: [
        { day: 'Lun', count: 180, max: 420 },
        { day: 'Mar', count: 245, max: 420 },
        { day: 'Mié', count: 310, max: 420 },
        { day: 'Jue', count: 290, max: 420 },
        { day: 'Vie', count: 420, max: 420 },
        { day: 'Sáb', count: 385, max: 420 },
        { day: 'Dom', count: 200, max: 420 },
      ],
      topStands: [
        { name: 'Café Las Palmas', visits: 245, municipality: 'Planadas' },
        { name: 'Hacienda El Roble', visits: 198, municipality: 'Chaparral' },
        { name: 'Finca El Mirador', visits: 176, municipality: 'Ibagué' },
        { name: 'La Reserva Cafetera', visits: 154, municipality: 'Líbano' },
        { name: 'Café de Altura', visits: 132, municipality: 'Murillo' },
      ],
      geographic: [
        { region: 'Centro (Ibagué)', count: 520, pct: 37 },
        { region: 'Norte (Líbano)', count: 340, pct: 24 },
        { region: 'Sur (Chaparral)', count: 280, pct: 20 },
        { region: 'Oriente', count: 168, pct: 12 },
        { region: 'Otros', count: 112, pct: 7 },
      ],
      revenueByCategory: [
        { label: 'Ventas Stands', amount: 18500000, pct: 76 },
        { label: 'Subasta Café', amount: 4200000, pct: 17 },
        { label: 'Entradas VIP', amount: 1800000, pct: 7 },
      ],
    };
  },
};
