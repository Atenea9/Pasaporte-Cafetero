import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Visitante: undefined;
  Expositor: undefined;
  Comprador: undefined;
  Admin: undefined;
  Ceo: undefined;
};

export type VisitanteStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registro: { cedula?: string; fromLogin?: boolean } | undefined;
  Inicio: undefined;
  Pasaporte: undefined;
  Ranking: undefined;
  Vendedor: undefined;
  Agenda: undefined;
  MapaFeria: undefined;
  Auspiciadores: undefined;
  Catalogo: undefined;
  Expositores: undefined;
  Catacion: undefined;
  Premiaciones: undefined;
  AgendaAcademica: undefined;
  FeriaAnterior: { fairKey: string };
};

export type ExpositorStackParamList = {
  Dashboard: undefined;
  StandDashboard: undefined;
  StandCatalog: undefined;
  FincaProfile: undefined;
  Scanner: undefined;
  Sale: { visitorUid: string };
  SubastaDashboard: undefined;
  SubastaProfile: undefined;
  ScaForm: undefined;
  NuevoLote: undefined;
};

export type CompradorStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registro: undefined;
  Dashboard: undefined;
  LotDetail: { lotId: string };
  CompradorPasaporte: undefined;
  AuctionLive: undefined;
  Agenda: undefined;
  MapaFeria: undefined;
  Auspiciadores: undefined;
  Catalogo: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UsersManagement: undefined;
  StandsManagement: undefined;
  HappyHourControl: undefined;
  SendNotification: undefined;
};

export type CeoStackParamList = {
  CeoDashboard: undefined;
  Reports: undefined;
  Analytics: undefined;
};

export type VisitanteNavProp = NativeStackNavigationProp<VisitanteStackParamList>;
export type ExpositorNavProp = NativeStackNavigationProp<ExpositorStackParamList>;
export type CompradorNavProp = NativeStackNavigationProp<CompradorStackParamList>;
export type AdminNavProp = NativeStackNavigationProp<AdminStackParamList>;
export type CeoNavProp = NativeStackNavigationProp<CeoStackParamList>;
