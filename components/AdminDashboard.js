import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { supabase } from '../lib/supabase';

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

  const validatePlayerData = (playerData) => {
    const errors = [];

    if (!playerData.name?.trim()) {
      errors.push('Введите имя игрока');
    }

    if (!playerData.email?.trim()) {
      errors.push('Введите email');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(playerData.email.trim())) {
        errors.push('Введите корректный email');
      }
    }

    return errors;
  };

  const createPlayer = async () => {
    const errors = validatePlayerData(newPlayer);
    if (errors.length > 0) {
      Alert.alert('Ошибка валидации', errors.join('\n'));
      return;
    }

    try {
      const payload = {
        name: newPlayer.name.trim(),
        email: newPlayer.email.trim().toLowerCase(),
        role: newPlayer.role,
        points: parseInt(newPlayer.points) || 0,
        correct_predictions: parseInt(newPlayer.correct_predictions) || 0,
        total_predictions: parseInt(newPlayer.total_predictions) || 0,
        rank_position: 0,
      };

      const { error } = await supabase
        .from('players')
        .insert([payload]);

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Ошибка', 'Игрок с таким email уже существует');
        } else {
          Alert.alert('Ошибка', 'Не удалось создать игрока');
        }
        return;
      }

      Alert.alert('Успех', 'Игрок создан');
      setNewPlayer({
        name: '',
        email: '',
        role: 'player',
        points: 0,
        correct_predictions: 0,
        total_predictions: 0,
      });
      setShowAddPlayerModal(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании игрока');
    }
  };

  const updatePlayer = async () => {
    const errors = validatePlayerData(editPlayerData);
    if (errors.length > 0) {
      Alert.alert('Ошибка валидации', errors.join('\n'));
      return;
    }

    try {
      const payload = {
        name: editPlayerData.name?.trim(),
        email: editPlayerData.email?.trim().toLowerCase(),
        role: editPlayerData.role,
        points: parseInt(editPlayerData.points) || 0,
        correct_predictions: parseInt(editPlayerData.correct_predictions) || 0,
        total_predictions: parseInt(editPlayerData.total_predictions) || 0,
      };

      const { error } = await supabase
        .from('players')
        .update(payload)
        .eq('id', editingPlayer.id);

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Ошибка', 'Игрок с таким email уже существует');
        } else {
          Alert.alert('Ошибка', 'Не удалось обновить игрока');
        }
        return;
      }

      Alert.alert('Успех', 'Игрок обновлен');
      setShowEditPlayerModal(false);
      setEditingPlayer(null);
      setEditPlayerData({});
      fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при обновлении игрока');
    }
  };

  const deletePlayer = async (playerId, playerName) => {
    Alert.alert(
      'Удаление игрока',
      `Вы уверены, что хотите удалить игрока "${playerName}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', playerId);

              if (error) {
                Alert.alert('Ошибка', 'Не удалось удалить игрока');
                return;
              }

              Alert.alert('Успех', 'Игрок удален');
              fetchPlayers();
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении игрока');
            }
          },
        },
      ]
    );
  };

  const openEditPlayer = (player) => {
    setEditingPlayer(player);
    setEditPlayerData({
      name: player.name,
      email: player.email,
      role: player.role,
      points: player.points.toString(),
      correct_predictions: player.correct_predictions.toString(),
      total_predictions: player.total_predictions.toString(),
    });
    setShowEditPlayerModal(true);
  };

  // Пагинация игроков
  const totalPlayersPages = Math.ceil(players.length / playersPerPage);
  const paginatedPlayers = players.slice(
    (playersPage - 1) * playersPerPage,
    playersPage * playersPerPage
  );

  const goToPlayersPage = (page) => {
    if (page >= 1 && page <= totalPlayersPages) {
      setPlayersPage(page);
    }
  };

  // Пагинация матчей
  const totalMatchesPages = Math.ceil(matches.length / matchesPerPage);
  const paginatedMatches = matches.slice(
    (matchesPage - 1) * matchesPerPage,
    matchesPage * matchesPerPage
  );

  const goToMatchesPage = (page) => {
    if (page >= 1 && page <= totalMatchesPages) {
      setMatchesPage(page);
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

  const validateMatchData = (matchData) => {
    const errors = [];

    if (!matchData.home_team?.trim()) {
      errors.push('Введите домашнюю команду');
    }

    if (!matchData.away_team?.trim()) {
      errors.push('Введите гостевую команду');
    }

    if (!matchData.match_date?.trim()) {
      errors.push('Введите дату матча');
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(matchData.match_date.trim())) {
        errors.push('Введите дату в формате ГГГГ-ММ-ДД');
      }
    }

    if (!matchData.match_time?.trim()) {
      errors.push('Введите время матча');
    } else {
      const timeRegex = /^(\d{2}):(\d{2})$/;
      const match = timeRegex.exec(matchData.match_time.trim());
      if (!match) {
        errors.push('Введите время в формате ЧЧ:ММ');
      } else {
        const [, hh, mm] = match;
        const hours = Number(hh);
        const minutes = Number(mm);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          errors.push('Часы 00-23, минуты 00-59');
        }
      }
    }

    return errors;
  };

  const createMatch = async () => {
    const errors = validateMatchData(newMatch);
    if (errors.length > 0) {
      Alert.alert('Ошибка валидации', errors.join('\n'));
      return;
    }

    try {
      const matchTime = newMatch.match_time.includes(':')
        ? `${newMatch.match_time}:00`
        : newMatch.match_time;

      const payload = {
        home_team: newMatch.home_team.trim(),
        away_team: newMatch.away_team.trim(),
        match_date: newMatch.match_date.trim(),
        match_time: matchTime,
        league: newMatch.league.trim() || 'РПЛ',
        tour: newMatch.tour ? parseInt(newMatch.tour) : null,
        status: newMatch.status,
        is_visible: newMatch.is_visible,
        home_score: newMatch.home_score,
        away_score: newMatch.away_score,
      };

      const { error } = await supabase
        .from('matches')
        .insert([payload]);

      if (error) {
        Alert.alert('Ошибка', 'Не удалось создать матч');
        return;
      }

      Alert.alert('Успех', 'Матч создан');
      setNewMatch({
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
      setShowAddMatchModal(false);
      fetchMatches();
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании матча');
    }
  };

  const updateMatch = async () => {
    const errors = validateMatchData(editData);
    if (errors.length > 0) {
      Alert.alert('Ошибка валидации', errors.join('\n'));
      return;
    }

    try {
      const matchTime = editData.match_time && editData.match_time.includes(':')
        ? `${editData.match_time}:00`
        : editData.match_time;

      const payload = {
        home_team: editData.home_team?.trim(),
        away_team: editData.away_team?.trim(),
        match_date: editData.match_date?.trim(),
        match_time: matchTime,
        league: editData.league?.trim() || 'РПЛ',
        tour: editData.tour ? parseInt(editData.tour) : null,
        status: editData.status,
        is_visible: editData.is_visible,
        home_score: editData.home_score !== '' ? (editData.home_score ? parseInt(editData.home_score) : null) : null,
        away_score: editData.away_score !== '' ? (editData.away_score ? parseInt(editData.away_score) : null) : null,
      };

      const { error } = await supabase
        .from('matches')
        .update(payload)
        .eq('id', editingMatch.id);

      if (error) {
        Alert.alert('Ошибка', 'Не удалось обновить матч');
        return;
      }

      Alert.alert('Успех', 'Матч обновлен');
      setShowEditMatchModal(false);
      setEditingMatch(null);
      setEditData({});
      fetchMatches();
    } catch (error) {
      console.error('Error updating match:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при обновлении матча');
    }
  };

  const deleteMatch = async (matchId) => {
    Alert.alert(
      'Удаление матча',
      'Вы уверены, что хотите удалить этот матч?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchId);

              if (error) {
                Alert.alert('Ошибка', 'Не удалось удалить матч');
                return;
              }

              Alert.alert('Успех', 'Матч удален');
              fetchMatches();
            } catch (error) {
              console.error('Error deleting match:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении матча');
            }
          },
        },
      ]
    );
  };

  const openEditMatch = (match) => {
    setEditingMatch(match);
    setEditData({
      home_team: match.home_team,
      away_team: match.away_team,
      match_date: match.match_date,
      match_time: match.match_time ? match.match_time.slice(0, 5) : '',
      league: match.league,
      tour: match.tour ? match.tour.toString() : '',
      status: match.status,
      is_visible: match.is_visible,
      home_score: match.home_score !== null ? match.home_score.toString() : '',
      away_score: match.away_score !== null ? match.away_score.toString() : '',
    });
    setShowEditMatchModal(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      return timeString ? timeString.slice(0, 5) : '';
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return '#ff4444';
      case 'finished':
        return '#44ff44';
      default:
        return '#ffff44';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live':
        return 'В ЭФИРЕ';
      case 'finished':
        return 'ЗАВЕРШЕН';
      default:
        return 'ПРЕДСТОЯЩИЙ';
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
      <View style={styles.playerActions}>
        <View style={[styles.roleTag, item.role === 'admin' && styles.adminTag]}>
          <Text style={[styles.roleTagText, item.role === 'admin' && styles.adminTagText]}>
            {item.role.toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerActionButtons}>
          <TouchableOpacity
            style={styles.editPlayerButton}
            onPress={() => openEditPlayer(item)}
          >
            <Text style={styles.editPlayerButtonText}>РЕДАКТИРОВАТЬ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deletePlayerButton}
            onPress={() => deletePlayer(item.id, item.name)}
          >
            <Text style={styles.deletePlayerButtonText}>УДАЛИТЬ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMatch = ({ item }) => (
    <View style={styles.matchItem}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTeams}>{item.home_team} — {item.away_team}</Text>
          <View style={styles.matchMeta}>
            <Text style={styles.matchMetaText}>
              {formatDate(item.match_date)} • {formatTime(item.match_time)}
            </Text>
            {item.league && (
              <Text style={styles.matchMetaText}> • {item.league}</Text>
            )}
            {item.tour && (
              <Text style={styles.matchMetaText}> • Тур {item.tour}</Text>
            )}
          </View>
          {(item.home_score !== null && item.away_score !== null) && (
            <Text style={styles.matchScore}>{item.home_score} : {item.away_score}</Text>
          )}
        </View>
        <View style={styles.matchStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {!item.is_visible && (
            <View style={styles.hiddenBadge}>
              <Text style={styles.hiddenText}>СКРЫТ</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.matchActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditMatch(item)}
        >
          <Text style={styles.editButtonText}>РЕДАКТИРОВАТЬ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMatch(item.id)}
        >
          <Text style={styles.deleteButtonText}>УДАЛИТЬ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationButton = (page, label = null, currentPage, onGo) => (
    <TouchableOpacity
      key={`${label || page}-${page}`}
      style={[
        styles.paginationButton,
        currentPage === page && styles.paginationButtonActive
      ]}
      onPress={() => onGo(page)}
    >
      <Text style={[
        styles.paginationButtonText,
        currentPage === page && styles.paginationButtonTextActive
      ]}>
        {label || page}
      </Text>
    </TouchableOpacity>
  );

  const renderPlayersPagination = () => {
    if (totalPlayersPages <= 1) return null;

    const buttons = [];

    // Кнопка "Предыдущая"
    if (playersPage > 1) {
      buttons.push(renderPaginationButton(playersPage - 1, '‹', playersPage, goToPlayersPage));
    }

    // Номера страниц
    for (let i = 1; i <= totalPlayersPages; i++) {
      if (i === 1 || i === totalPlayersPages || (i >= playersPage - 1 && i <= playersPage + 1)) {
        buttons.push(renderPaginationButton(i, null, playersPage, goToPlayersPage));
      } else if (i === playersPage - 2 || i === playersPage + 2) {
        buttons.push(
          <Text key={`dots-players-${i}`} style={styles.paginationDots}>...</Text>
        );
      }
    }

    // Кнопка "Следующая"
    if (playersPage < totalPlayersPages) {
      buttons.push(renderPaginationButton(playersPage + 1, '›', playersPage, goToPlayersPage));
    }

    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationInfo}>
          Страница {playersPage} из {totalPlayersPages} • Всего игроков: {players.length}
        </Text>
        <View style={styles.paginationButtons}>
          {buttons}
        </View>
      </View>
    );
  };

  const renderMatchesPagination = () => {
    if (totalMatchesPages <= 1) return null;
    const buttons = [];
    if (matchesPage > 1) {
      buttons.push(renderPaginationButton(matchesPage - 1, '‹', matchesPage, goToMatchesPage));
    }
    for (let i = 1; i <= totalMatchesPages; i++) {
      if (i === 1 || i === totalMatchesPages || (i >= matchesPage - 1 && i <= matchesPage + 1)) {
        buttons.push(renderPaginationButton(i, null, matchesPage, goToMatchesPage));
      } else if (i === matchesPage - 2 || i === matchesPage + 2) {
        buttons.push(
          <Text key={`dots-matches-${i}`} style={styles.paginationDots}>...</Text>
        );
      }
    }
    if (matchesPage < totalMatchesPages) {
      buttons.push(renderPaginationButton(matchesPage + 1, '›', matchesPage, goToMatchesPage));
    }
    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationInfo}>
          Страница {matchesPage} из {totalMatchesPages} • Всего матчей: {matches.length}
        </Text>
        <View style={styles.paginationButtons}>
          {buttons}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
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
          <Text style={[styles.tabButtonText, activeTab === 'players' && styles.tabButtonTextActive]}>Игроки</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'matches' && styles.tabButtonTextActive]}>Матчи</Text>
        </TouchableOpacity>
      </View>

      {/* Управление пользователями */}
      {activeTab === 'players' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddPlayerModal(true)}
          >
            <Text style={styles.actionButtonText}>ДОБАВИТЬ ИГРОКА</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={fetchPlayers}>
            <Text style={styles.actionButtonText}>ОБНОВИТЬ СПИСОК</Text>
          </TouchableOpacity>

          {playersLoading ? (
            <Text style={styles.loadingText}>Загрузка игроков...</Text>
          ) : (
            <>
              <FlatList
                data={paginatedPlayers}
                renderItem={renderPlayer}
                keyExtractor={(item) => item.id.toString()}
                style={styles.playersList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              />
              {renderPlayersPagination()}
            </>
          )}
        </View>
      )}

      {/* Управление матчами */}
      {activeTab === 'matches' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ МАТЧАМИ</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddMatchModal(true)}
          >
            <Text style={styles.actionButtonText}>ДОБАВИТЬ МАТЧ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={fetchMatches}>
            <Text style={styles.actionButtonText}>ОБНОВИТЬ СПИСОК</Text>
          </TouchableOpacity>

          {matchesLoading ? (
            <Text style={styles.loadingText}>Загрузка матчей...</Text>
          ) : (
            <>
              <FlatList
                data={paginatedMatches}
                renderItem={renderMatch}
                keyExtractor={(item) => item.id.toString()}
                style={styles.matchesList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              />
              {renderMatchesPagination()}
            </>
          )}
        </View>
      )}

      {/* Модальные окна остаются доступными вне зависимости от вкладки */}
      <Modal
        visible={showAddPlayerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddPlayerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>НОВЫЙ ИГРОК</Text>

              <Text style={styles.inputLabel}>Имя *</Text>
              <TextInput
                style={styles.textInput}
                value={newPlayer.name}
                onChangeText={(text) => setNewPlayer(prev => ({...prev, name: text}))}
                placeholder="Имя игрока"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={newPlayer.email}
                onChangeText={(text) => setNewPlayer(prev => ({...prev, email: text}))}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Роль</Text>
              <View style={styles.roleButtons}>
                {['player', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      newPlayer.role === role && styles.roleButtonActive
                    ]}
                    onPress={() => setNewPlayer(prev => ({...prev, role}))}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      newPlayer.role === role && styles.roleButtonTextActive
                    ]}>
                      {role === 'player' ? 'ИГРОК' : 'АДМИН'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Очки</Text>
              <TextInput
                style={styles.textInput}
                value={newPlayer.points.toString()}
                onChangeText={(text) => setNewPlayer(prev => ({...prev, points: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Правильные прогнозы</Text>
              <TextInput
                style={styles.textInput}
                value={newPlayer.correct_predictions.toString()}
                onChangeText={(text) => setNewPlayer(prev => ({...prev, correct_predictions: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Всего прогнозов</Text>
              <TextInput
                style={styles.textInput}
                value={newPlayer.total_predictions.toString()}
                onChangeText={(text) => setNewPlayer(prev => ({...prev, total_predictions: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddPlayerModal(false)}>
                  <Text style={styles.cancelButtonText}>ОТМЕНА</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={createPlayer}>
                  <Text style={styles.saveButtonText}>СОЗДАТЬ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно редактирования игрока */}
      <Modal
        visible={showEditPlayerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditPlayerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ ИГРОКА</Text>

              <Text style={styles.inputLabel}>Имя *</Text>
              <TextInput
                style={styles.textInput}
                value={editPlayerData.name || ''}
                onChangeText={(text) => setEditPlayerData(prev => ({...prev, name: text}))}
                placeholder="Имя игрока"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={editPlayerData.email || ''}
                onChangeText={(text) => setEditPlayerData(prev => ({...prev, email: text}))}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Роль</Text>
              <View style={styles.roleButtons}>
                {['player', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      editPlayerData.role === role && styles.roleButtonActive
                    ]}
                    onPress={() => setEditPlayerData(prev => ({...prev, role}))}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      editPlayerData.role === role && styles.roleButtonTextActive
                    ]}>
                      {role === 'player' ? 'ИГРОК' : 'АДМИН'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Очки</Text>
              <TextInput
                style={styles.textInput}
                value={editPlayerData.points || ''}
                onChangeText={(text) => setEditPlayerData(prev => ({...prev, points: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Правильные прогнозы</Text>
              <TextInput
                style={styles.textInput}
                value={editPlayerData.correct_predictions || ''}
                onChangeText={(text) => setEditPlayerData(prev => ({...prev, correct_predictions: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Всего прогнозов</Text>
              <TextInput
                style={styles.textInput}
                value={editPlayerData.total_predictions || ''}
                onChangeText={(text) => setEditPlayerData(prev => ({...prev, total_predictions: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditPlayerModal(false)}>
                  <Text style={styles.cancelButtonText}>ОТМЕНА</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={updatePlayer}>
                  <Text style={styles.saveButtonText}>СОХРАНИТЬ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно создания матча */}
      <Modal
        visible={showAddMatchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMatchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>НОВЫЙ МАТЧ</Text>

              <Text style={styles.inputLabel}>Домашняя команда *</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.home_team}
                onChangeText={(text) => setNewMatch(prev => ({...prev, home_team: text}))}
                placeholder="Название команды"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Гостевая команда *</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.away_team}
                onChangeText={(text) => setNewMatch(prev => ({...prev, away_team: text}))}
                placeholder="Название команды"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.match_date}
                onChangeText={(text) => setNewMatch(prev => ({...prev, match_date: text}))}
                placeholder="2024-01-01"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.match_time}
                onChangeText={(text) => setNewMatch(prev => ({...prev, match_time: text}))}
                placeholder="21:00"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Лига</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.league}
                onChangeText={(text) => setNewMatch(prev => ({...prev, league: text}))}
                placeholder="РПЛ"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Тур</Text>
              <TextInput
                style={styles.textInput}
                value={newMatch.tour}
                onChangeText={(text) => setNewMatch(prev => ({...prev, tour: text}))}
                placeholder="1"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>Показывать игрокам</Text>
                <Switch
                  value={newMatch.is_visible}
                  onValueChange={(value) => setNewMatch(prev => ({...prev, is_visible: value}))}
                  trackColor={{ false: '#333', true: '#fff' }}
                  thumbColor={newMatch.is_visible ? '#000' : '#666'}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddMatchModal(false)}>
                  <Text style={styles.cancelButtonText}>ОТМЕНА</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={createMatch}>
                  <Text style={styles.saveButtonText}>СОЗДАТЬ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно редактирования матча */}
      <Modal
        visible={showEditMatchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditMatchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ МАТЧА</Text>

              <Text style={styles.inputLabel}>Домашняя команда *</Text>
              <TextInput
                style={styles.textInput}
                value={editData.home_team || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, home_team: text}))}
                placeholder="Название команды"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Гостевая команда *</Text>
              <TextInput
                style={styles.textInput}
                value={editData.away_team || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, away_team: text}))}
                placeholder="Название команды"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
              <TextInput
                style={styles.textInput}
                value={editData.match_date || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, match_date: text}))}
                placeholder="2024-01-01"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
              <TextInput
                style={styles.textInput}
                value={editData.match_time || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, match_time: text}))}
                placeholder="21:00"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Лига</Text>
              <TextInput
                style={styles.textInput}
                value={editData.league || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, league: text}))}
                placeholder="РПЛ"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Тур</Text>
              <TextInput
                style={styles.textInput}
                value={editData.tour || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, tour: text}))}
                placeholder="1"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Голы домашней команды</Text>
              <TextInput
                style={styles.textInput}
                value={editData.home_score || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, home_score: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Голы гостевой команды</Text>
              <TextInput
                style={styles.textInput}
                value={editData.away_score || ''}
                onChangeText={(text) => setEditData(prev => ({...prev, away_score: text}))}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Статус</Text>
              <View style={styles.statusButtons}>
                {['upcoming', 'live', 'finished'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      editData.status === status && styles.statusButtonActive
                    ]}
                    onPress={() => setEditData(prev => ({...prev, status}))}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      editData.status === status && styles.statusButtonTextActive
                    ]}>
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>Показывать игрокам</Text>
                <Switch
                  value={editData.is_visible || false}
                  onValueChange={(value) => setEditData(prev => ({...prev, is_visible: value}))}
                  trackColor={{ false: '#333', true: '#fff' }}
                  thumbColor={editData.is_visible ? '#000' : '#666'}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditMatchModal(false)}>
                  <Text style={styles.cancelButtonText}>ОТМЕНА</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={updateMatch}>
                  <Text style={styles.saveButtonText}>СОХРАНИТЬ</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  matchesList: {
    maxHeight: 600,
  },
  playerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  playerInfo: {
    marginBottom: 10,
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
    marginBottom: 5,
  },
  playerStats: {
    marginBottom: 10,
  },
  playerStatText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  playerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  playerActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editPlayerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editPlayerButtonText: {
    color: '#fff',
    fontSize: 9,
    letterSpacing: 1,
  },
  deletePlayerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deletePlayerButtonText: {
    color: '#666',
    fontSize: 9,
    letterSpacing: 1,
  },
  // Пагинация
  paginationContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  paginationInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paginationButton: {
    minWidth: 30,
    height: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  paginationButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  paginationButtonText: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  paginationButtonTextActive: {
    color: '#000',
  },
  paginationDots: {
    fontSize: 10,
    color: '#666',
    marginHorizontal: 5,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Стили для матчей
  matchItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingVertical: 15,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 5,
  },
  matchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  matchMetaText: {
    fontSize: 10,
    color: '#888',
  },
  matchScore: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  matchStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hiddenBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hiddenText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
  },
  // Стили модальных окон
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '300',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    backgroundColor: '#111',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  roleButtonTextActive: {
    color: '#000',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statusButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  statusButtonTextActive: {
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
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
  // Стили для матчей
  matchItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingVertical: 15,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 5,
  },
  matchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  matchMetaText: {
    fontSize: 10,
    color: '#888',
  },
  matchScore: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  matchStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 8,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hiddenBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hiddenText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
  },
  // Стили модальных окон
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '300',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    backgroundColor: '#111',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  roleButtonTextActive: {
    color: '#000',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statusButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 1,
  },
  statusButtonTextActive: {
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
  },
});
