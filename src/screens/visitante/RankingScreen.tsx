import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { mockDbService } from '../../services/mockDb.service';

export const RankingScreen = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await mockDbService.getLeaderboard();
    setLeaderboard(data);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Visitantes</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.municipality}>{item.municipality}</Text>
            </View>
            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loader: { flex: 1, justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3B32',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3B32',
    width: 40,
    textAlign: 'center',
  },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32' },
  municipality: { fontSize: 12, color: '#7A6B62', marginTop: 2 },
  points: { fontSize: 16, fontWeight: 'bold', color: '#E07A5F' },
});

export default RankingScreen;
