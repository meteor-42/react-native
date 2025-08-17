import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalAdmins: 0,
    onlinePlayers: 0,
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить список игроков');
        return;
      }

      setPlayers(data || []);

      // Подсчет статистики
      const totalPlayers = data?.filter(p => p.role === 'player').length || 0;
      const totalAdmins = data?.filter(p => p.role === 'admin').length || 0;

      setStats({
        totalPlayers,
        totalAdmins,
        onlinePlayers: Math.floor(totalPlayers * 0.7), // Симуляция онлайн игроков
      });
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlayer = ({ item }) => (
    <View style={styles.playerItem}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerEmail}>{item.email}</Text>
        <View style={styles.playerStats}>
          <Text style={styles.playerStatText}>
            Очки: {item.points} • Прогнозы: {item.correct_predictions}/{item.total_predictions}
          </Text>
          {item.rank_position > 0 && (
            <Text style={styles.playerStatText}>Ранг: #{item.rank_position}</Text>
          )}
        </View>
      </View>
      <View style={[styles.roleTag, item.role === 'admin' && styles.adminTag]}>
        <Text style={[styles.roleTagText, item.role === 'admin' && styles.adminTagText]}>
          {item.role.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ПАНЕЛЬ АДМИНИСТРАТОРА</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalPlayers}</Text>
            <Text style={styles.statLabel}>ИГРОКОВ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalAdmins}</Text>
            <Text style={styles.statLabel}>АДМИНОВ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.onlinePlayers}</Text>
            <Text style={styles.statLabel}>ОНЛАЙН</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</Text>

        <TouchableOpacity style={styles.actionButton} onPress={fetchPlayers}>
          <Text style={styles.actionButtonText}>ОБНОВИТЬ СПИСОК</Text>
        </TouchableOpacity>

        {loading ? (
          <Text style={styles.loadingText}>Загрузка...</Text>
        ) : (
          <FlatList
            data={players}
            renderItem={renderPlayer}
            keyExtractor={(item) => item.id.toString()}
            style={styles.playersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '300',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '100',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '300',
  },
  playersList: {
    maxHeight: 400,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 3,
  },
  playerEmail: {
    fontSize: 12,
    color: '#666',
  },
  roleTag: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adminTag: {
    backgroundColor: '#fff',
  },
  roleTagText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '500',
  },
  adminTagText: {
    color: '#000',
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playerStats: {
    marginTop: 5,
  },
  playerStatText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
});
