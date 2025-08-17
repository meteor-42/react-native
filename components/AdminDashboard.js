import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { supabase } from '../lib/supabase';
import PlayersManager from './admin/PlayersManager';
import MatchesManager from './admin/MatchesManager';

export default function AdminDashboard({ user }) {
  // Состояния для игроков
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalAdmins: 0,
    onlinePlayers: 0,
  });

  // Состояния для управления игроками
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);

  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState('players'); // 'players' | 'matches'

  // Пагинация для игроков
  const [playersPage, setPlayersPage] = useState(1);
  const playersPerPage = 8;

  // Пагинация для матчей
  const [matchesPage, setMatchesPage] = useState(1);
  const matchesPerPage = 8;

  // Состояние для нового игрока
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    email: '',
    role: 'player',
    points: 0,
    correct_predictions: 0,
    total_predictions: 0,
  });

  // Состояние для редактируемого игрока
  const [editPlayerData, setEditPlayerData] = useState({});

  // Состояния для матчей
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);

  // Состояние для нового матча
  const [newMatch, setNewMatch] = useState({
    home_team: '',
    away_team: '',
    match_date: '',
    match_time: '',
    league: 'РПЛ',
    tour: '',
    status: 'upcoming',
    is_visible: true,
    home_score: null,
    away_score: null,
  });

  // Состояние для редактируемого матча
  const [editData, setEditData] = useState({});

  // Пересчет страниц при обновлениях списков
  useEffect(() => {
    if (playersPage > Math.ceil(players.length / playersPerPage)) {
      setPlayersPage(1);
    }
  }, [players, playersPage]);

  useEffect(() => {
    if (matchesPage > Math.ceil(matches.length / matchesPerPage)) {
      setMatchesPage(1);
    }
  }, [matches, matchesPage]);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchPlayers = async () => {
    try {
      setPlayersLoading(true);
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
      setPlayersLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить список матчей');
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  // The rest of the logic and state is passed down to the subcomponents as needed

  return (
    <View style={styles.container}>
      {/* Статистика */}
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
            <Text style={styles.statNumber}>{matches.length}</Text>
            <Text style={styles.statLabel}>МАТЧЕЙ</Text>
          </View>
        </View>
      </View>

      {/* Вкладки */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'players' && styles.tabButtonActive]}
          onPress={() => setActiveTab('players')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'players' && styles.tabButtonTextActive]}>
            Игроки ({players.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'matches' && styles.tabButtonTextActive]}>
            Матчи ({matches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Управление пользователями */}
      {activeTab === 'players' && (
        <PlayersManager
          players={players}
          setPlayers={setPlayers}
          loading={loading}
          playersLoading={playersLoading}
          setPlayersLoading={setPlayersLoading}
          fetchPlayers={fetchPlayers}
          showAddPlayerModal={showAddPlayerModal}
          setShowAddPlayerModal={setShowAddPlayerModal}
          editingPlayer={editingPlayer}
          setEditingPlayer={setEditingPlayer}
          showEditPlayerModal={showEditPlayerModal}
          setShowEditPlayerModal={setShowEditPlayerModal}
          playersPage={playersPage}
          setPlayersPage={setPlayersPage}
          playersPerPage={playersPerPage}
          newPlayer={newPlayer}
          setNewPlayer={setNewPlayer}
          editPlayerData={editPlayerData}
          setEditPlayerData={setEditPlayerData}
          supabase={supabase}
        />
      )}

      {/* Управление матчами */}
      {activeTab === 'matches' && (
        <MatchesManager
          matches={matches}
          setMatches={setMatches}
          matchesLoading={matchesLoading}
          setMatchesLoading={setMatchesLoading}
          fetchMatches={fetchMatches}
          showAddMatchModal={showAddMatchModal}
          setShowAddMatchModal={setShowAddMatchModal}
          editingMatch={editingMatch}
          setEditingMatch={setEditingMatch}
          showEditMatchModal={showEditMatchModal}
          setShowEditMatchModal={setShowEditMatchModal}
          matchesPage={matchesPage}
          setMatchesPage={setMatchesPage}
          matchesPerPage={matchesPerPage}
          newMatch={newMatch}
          setNewMatch={setNewMatch}
          editData={editData}
          setEditData={setEditData}
          supabase={supabase}
        />
      )}
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
  // Стили для вкладок
  tabsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  tabButtonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
  },
  tabButtonTextActive: {
    color: '#000',
  },
});
