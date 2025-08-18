import { useMemo } from 'react';
import { Alert } from 'react-native';

export function usePlayersManager({
  players,
  playersPage,
  playersPerPage,
  setPlayersPage,
  supabase,
  newPlayer,
  setNewPlayer,
  editPlayerData,
  setEditPlayerData,
  editingPlayer,
  setEditingPlayer,
  fetchPlayers,
  setShowAddPlayerModal,
  setShowEditPlayerModal,
}) {
  const totalPlayersPages = Math.ceil(players.length / playersPerPage) || 1;
  const paginatedPlayers = useMemo(
    () => players.slice((playersPage - 1) * playersPerPage, playersPage * playersPerPage),
    [players, playersPage, playersPerPage]
  );

  const validatePlayerData = (playerData) => {
    const errors = [];
    if (!playerData.name?.trim()) errors.push('Введите имя игрока');
    if (!playerData.email?.trim()) {
      errors.push('Введите email');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(playerData.email.trim())) errors.push('Введите корректный email');
    }
    return errors;
  };

  const createPlayer = async () => {
    const errors = validatePlayerData(newPlayer);
    if (errors.length) { Alert.alert('Ошибка', errors.join('\n')); return; }
    const payload = {
      name: newPlayer.name.trim(),
      email: newPlayer.email.trim().toLowerCase(),
      role: newPlayer.role,
      points: parseInt(newPlayer.points) || 0,
      correct_predictions: parseInt(newPlayer.correct_predictions) || 0,
      total_predictions: parseInt(newPlayer.total_predictions) || 0,
      rank_position: 0,
    };
    const { error } = await supabase.from('players').insert([payload]);
    if (error) { Alert.alert('Ошибка', 'Не удалось создать игрока'); return; }
    setNewPlayer({ name: '', email: '', role: 'player', points: 0, correct_predictions: 0, total_predictions: 0 });
    setShowAddPlayerModal(false);
    fetchPlayers();
    Alert.alert('Успешно', 'Игрок создан и сохранен в базе');
  };

  const updatePlayer = async () => {
    const errors = validatePlayerData(editPlayerData);
    if (errors.length) { Alert.alert('Ошибка', errors.join('\n')); return; }
    const payload = {
      name: editPlayerData.name?.trim(),
      email: editPlayerData.email?.trim().toLowerCase(),
      role: editPlayerData.role,
      points: parseInt(editPlayerData.points) || 0,
      correct_predictions: parseInt(editPlayerData.correct_predictions) || 0,
      total_predictions: parseInt(editPlayerData.total_predictions) || 0,
    };
    const { error } = await supabase.from('players').update(payload).eq('id', editingPlayer.id);
    if (error) { Alert.alert('Ошибка', 'Не удалось обновить игрока'); return; }
    setShowEditPlayerModal(false);
    setEditingPlayer(null);
    setEditPlayerData({});
    fetchPlayers();
    Alert.alert('Успешно', 'Изменения сохранены в базе');
  };

  const deletePlayer = async (playerId) => {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) { Alert.alert('Ошибка', 'Не удалось удалить игрока'); return; }
    fetchPlayers();
    Alert.alert('Успешно', 'Игрок удален');
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

  const goToPlayersPage = (p) => { if (p >= 1 && p <= totalPlayersPages) setPlayersPage(p); };

  return {
    totalPlayersPages,
    paginatedPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    openEditPlayer,
    goToPlayersPage,
  };
}
