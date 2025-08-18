import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function useAdminDashboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [stats, setStats] = useState({ totalPlayers: 0, totalAdmins: 0, onlinePlayers: 0 });
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [playersPage, setPlayersPage] = useState(1);
  const playersPerPage = 8;
  const [matchesPage, setMatchesPage] = useState(1);
  const matchesPerPage = 8;
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '', role: 'player', points: 0, correct_predictions: 0, total_predictions: 0 });
  const [editPlayerData, setEditPlayerData] = useState({});

  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [newMatch, setNewMatch] = useState({ home_team: '', away_team: '', match_date: '', match_time: '', league: 'РПЛ', tour: '', status: 'upcoming', is_visible: true, home_score: null, away_score: null });
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (playersPage > Math.ceil(players.length / playersPerPage)) setPlayersPage(1);
  }, [players, playersPage]);

  useEffect(() => {
    if (matchesPage > Math.ceil(matches.length / matchesPerPage)) setMatchesPage(1);
  }, [matches, matchesPage]);

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  const fetchPlayers = async () => {
    try {
      setPlayersLoading(true);
      const { data, error } = await supabase.from('players').select('*').order('points', { ascending: false });
      if (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить список игроков');
        return;
      }
      setPlayers(data || []);
      const totalPlayers = data?.filter(p => p.role === 'player').length || 0;
      const totalAdmins = data?.filter(p => p.role === 'admin').length || 0;
      setStats({ totalPlayers, totalAdmins, onlinePlayers: Math.floor(totalPlayers * 0.7) });
    } catch (e) {
      console.error('Error fetching players:', e);
    } finally {
      setLoading(false);
      setPlayersLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const { data, error } = await supabase.from('matches').select('*');
      if (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить список матчей');
        return;
      }
      const sortedMatches = (data || []).sort((a, b) => {
        const dateTimeA = new Date(`${a.match_date}T${a.match_time || '00:00:00'}`);
        const dateTimeB = new Date(`${b.match_date}T${b.match_time || '00:00:00'}`);
        return dateTimeA - dateTimeB;
      });
      setMatches(sortedMatches);
    } catch (e) {
      console.error('Error fetching matches:', e);
    } finally {
      setMatchesLoading(false);
    }
  };

  return {
    // tabs
    activeTab, setActiveTab,
    // players state
    players, setPlayers, loading, playersLoading, setPlayersLoading, stats,
    showAddPlayerModal, setShowAddPlayerModal,
    editingPlayer, setEditingPlayer,
    showEditPlayerModal, setShowEditPlayerModal,
    playersPage, setPlayersPage, playersPerPage,
    newPlayer, setNewPlayer,
    editPlayerData, setEditPlayerData,
    fetchPlayers,
    // matches state
    matches, setMatches, matchesLoading, setMatchesLoading,
    showAddMatchModal, setShowAddMatchModal,
    editingMatch, setEditingMatch,
    showEditMatchModal, setShowEditMatchModal,
    matchesPage, setMatchesPage, matchesPerPage,
    newMatch, setNewMatch,
    editData, setEditData,
    fetchMatches,
  };
}