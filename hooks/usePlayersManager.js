import { useMemo } from 'react';

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
    if (!newPlayer.password?.trim()) errors.push('Введите пароль');
    if (errors.length) return { success: false, message: errors.join(', ') };

    const payload = {
      name: newPlayer.name.trim(),
      email: newPlayer.email.trim().toLowerCase(),
      password: newPlayer.password.trim(),
      role: newPlayer.role,
      points: parseInt(newPlayer.points) || 0,
      correct_predictions: parseInt(newPlayer.correct_predictions) || 0,
      total_predictions: parseInt(newPlayer.total_predictions) || 0,
      rank_position: 0,
    };

    const { error } = await supabase.from('players').insert([payload]);
    if (error) return { success: false, message: error.message };

    setNewPlayer({ name: '', email: '', role: 'player', points: 0, correct_predictions: 0, total_predictions: 0, password: '' });
    setShowAddPlayerModal(false);
    await fetchPlayers();

    return { success: true, message: 'Игрок успешно создан' };
  };

  const updatePlayer = async () => {
    const errors = validatePlayerData(editPlayerData);
    if (errors.length) return { success: false, message: errors.join(', ') };

    const payload = {
      name: editPlayerData.name?.trim(),
      email: editPlayerData.email?.trim().toLowerCase(),
      role: editPlayerData.role,
      points: parseInt(editPlayerData.points) || 0,
      correct_predictions: parseInt(editPlayerData.correct_predictions) || 0,
      total_predictions: parseInt(editPlayerData.total_predictions) || 0,
    };

    if (editPlayerData.password?.trim()) payload.password = editPlayerData.password.trim();

    const { error } = await supabase.from('players').update(payload).eq('id', editingPlayer.id);
    if (error) return { success: false, message: error.message };

    setShowEditPlayerModal(false);
    setEditingPlayer(null);
    setEditPlayerData({});
    await fetchPlayers();

    return { success: true, message: 'Игрок успешно обновлён' };
  };

  const deletePlayer = async (playerId) => {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) return { success: false, message: error.message };

    await fetchPlayers();
    return { success: true, message: 'Игрок удалён' };
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
      password: '',
    });
    setShowEditPlayerModal(true);
  };

  const goToPlayersPage = (p) => {
    if (p >= 1 && p <= totalPlayersPages) setPlayersPage(p);
  };

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
