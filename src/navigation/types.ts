import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Visitante: undefined;
  Expositor: undefined;
  Comprador: undefined;
  Admin: undefined;
  Ceo: undefined;
};

export type VisitanteStackParamList = {
  Registro: undefined;
  Inicio: undefined;
  Pasaporte: undefined;
  Ranking: undefined;
  Vendedor: undefined;
};

export type ExpositorStackParamList = {
  Dashboard: undefined;
  Scanner: undefined;
  Sale: { visitorUid: string };
  SubastaDashboard: undefined;
  SubastaProfile: undefined;
  ScaForm: undefined;
};

export type CompradorStackParamList = {
  Dashboard: undefined;
  LotDetail: { lotId: string };
  CompradorPasaporte: undefined;
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
