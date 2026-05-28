import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockDbService } from '../../services/mockDb.service';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0',
};

export const RankingScreen = () => {
  const nav = useNavigation();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockDbService.getLeaderboard().then(data => {
      setLeaderboard(data);
      setLoading(false);
    });
  }, []);

  const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={T.gold} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>RANKING DE VISITANTES</Text>
          <Text style={s.subtitle}>Top coleccionistas de la feria</Text>
        </View>
      </View>

      {/* Podium */}
      {leaderboard.length >= 3 && (
        <View style={s.podium}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((item, i) => {
            const positions = [1, 0, 2];
            const pos = positions[i];
            const isFirst = pos === 0;
            return (
              <View key={item.id} style={[s.podiumCol, isFirst && s.podiumColFirst]}>
                <Text style={s.podiumMedal}>{MEDAL[pos]}</Text>
                <View style={[s.podiumAvatar, isFirst && s.podiumAvatarFirst, { backgroundColor: [T.gold, '#C0C0C0', '#CD7F32'][pos] }]}>
                  <Text style={s.podiumAvatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
                <Text style={s.podiumName} numberOfLines={1}>{item.name?.split(' ')[0]}</Text>
                <Text style={s.podiumPts}>{item.points} pts</Text>
                <View style={[s.podiumBar, { height: [60, 40, 30][pos], backgroundColor: [T.gold + '40', '#C0C0C030', '#CD7F3230'][pos] }]} />
              </View>
            );
          })}
        </View>
      )}

      <FlatList
        data={leaderboard.slice(3)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={s.card}>
            <View style={s.rankBox}>
              <Text style={s.rank}>#{index + 4}</Text>
            </View>
            <View style={s.cardAvatar}>
              <Text style={s.cardAvatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.cardStamps}>{item.stampsCount ?? 0} sellos</Text>
            </View>
            <View style={s.cardPtsBox}>
              <Text style={s.cardPts}>{item.points}</Text>
              <Text style={s.cardPtsLbl}>pts</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Sé el primero en el ranking 🏆</Text>}
      />
    </SafeAreaView>
  );
};

export default RankingScreen;

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:           { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: 12 },
  backIcon:          { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:          { fontSize: 15, color: T.green, fontWeight: '600' },
  title:             { fontSize: 14, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },
  subtitle:          { fontSize: 10, color: T.muted, marginTop: 2 },
  podium:            { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 4 },
  podiumCol:         { flex: 1, alignItems: 'center' },
  podiumColFirst:    { marginBottom: 0 },
  podiumMedal:       { fontSize: 24, marginBottom: 4 },
  podiumAvatar:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  podiumAvatarFirst: { width: 56, height: 56, borderRadius: 28 },
  podiumAvatarText:  { fontSize: 20, fontWeight: '900', color: '#FFF' },
  podiumName:        { fontSize: 11, fontWeight: '800', color: T.dark, marginBottom: 2 },
  podiumPts:         { fontSize: 12, fontWeight: '900', color: T.gold, marginBottom: 4 },
  podiumBar:         { width: '80%', borderRadius: 6 },
  list:              { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  card:              { backgroundColor: T.card, borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: T.border },
  rankBox:           { width: 28, alignItems: 'center' },
  rank:              { fontSize: 12, fontWeight: '900', color: T.muted },
  cardAvatar:        { width: 38, height: 38, borderRadius: 19, backgroundColor: T.greenPale, alignItems: 'center', justifyContent: 'center' },
  cardAvatarText:    { fontSize: 18, fontWeight: '900', color: T.green },
  cardInfo:          { flex: 1 },
  cardName:          { fontSize: 14, fontWeight: '800', color: T.dark },
  cardStamps:        { fontSize: 11, color: T.muted, marginTop: 2 },
  cardPtsBox:        { alignItems: 'flex-end' },
  cardPts:           { fontSize: 18, fontWeight: '900', color: T.gold },
  cardPtsLbl:        { fontSize: 10, color: T.muted },
  empty:             { textAlign: 'center', color: T.muted, paddingVertical: 40, fontSize: 14 },
});
