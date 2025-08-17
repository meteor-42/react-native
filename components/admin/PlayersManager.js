import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet } from 'react-native';

export default function PlayersManager({
  players,
  setPlayers,
  loading,
  playersLoading,
  setPlayersLoading,
  fetchPlayers,
  showAddPlayerModal,
  setShowAddPlayerModal,
  editingPlayer,
  setEditingPlayer,
  showEditPlayerModal,
  setShowEditPlayerModal,
  playersPage,
  setPlayersPage,
  playersPerPage,
  newPlayer,
  setNewPlayer,
  editPlayerData,
  setEditPlayerData,
  supabase,
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
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
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
    if (error) {
      alert('Не удалось создать игрока');
      return;
    }
    setNewPlayer({ name: '', email: '', role: 'player', points: 0, correct_predictions: 0, total_predictions: 0 });
    setShowAddPlayerModal(false);
    fetchPlayers();
  };

  const updatePlayer = async () => {
    const errors = validatePlayerData(editPlayerData);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const payload = {
      name: editPlayerData.name?.trim(),
      email: editPlayerData.email?.trim().toLowerCase(),
      role: editPlayerData.role,
      points: parseInt(editPlayerData.points) || 0,
      correct_predictions: parseInt(editPlayerData.correct_predictions) || 0,
      total_predictions: parseInt(editPlayerData.total_predictions) || 0,
    };
    const { error } = await supabase.from('players').update(payload).eq('id', editingPlayer.id);
    if (error) {
      alert('Не удалось обновить игрока');
      return;
    }
    setShowEditPlayerModal(false);
    setEditingPlayer(null);
    setEditPlayerData({});
    fetchPlayers();
  };

  const deletePlayer = async (playerId) => {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) {
      alert('Не удалось удалить игрока');
      return;
    }
    fetchPlayers();
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

  const goToPlayersPage = (p) => {
    if (p >= 1 && p <= totalPlayersPages) setPlayersPage(p);
  };

  const renderItem = ({ item, index }) => {
    const playerNumber = (playersPage - 1) * playersPerPage + index + 1;
    return (
      <View style={styles.playerItem}>
        <View style={styles.playerNumberContainer}>
          <Text style={styles.playerNumber}>{playerNumber}</Text>
        </View>
        <View style={styles.playerInfo}>
          <View style={styles.playerMainInfo}>
            <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.roleContainer}>
              <Text style={[styles.roleText, item.role === 'admin' && styles.adminRoleText]}>
                {item.role === 'admin' ? 'АДМИН' : 'ИГРОК'}
              </Text>
            </View>
          </View>
          <Text style={styles.playerEmail} numberOfLines={1}>{item.email}</Text>
          <View style={styles.playerStats}>
            <Text style={styles.playerStatText}>Очки: {item.points}</Text>
            <Text style={styles.playerStatText}>Прогнозы: {item.correct_predictions}/{item.total_predictions}</Text>
          </View>
        </View>
        <View style={styles.playerActionButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => openEditPlayer(item)}>
            <Text style={styles.iconBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => deletePlayer(item.id)}>
            <Text style={styles.iconBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const Pagination = () => {
    if (totalPlayersPages <= 1) return null;
    const buttons = [];
    if (playersPage > 1) buttons.push(
      <TouchableOpacity key="prev" style={styles.pageBtn} onPress={() => goToPlayersPage(playersPage - 1)}>
        <Text style={styles.pageBtnText}>‹</Text>
      </TouchableOpacity>
    );
    for (let i = 1; i <= totalPlayersPages; i++) {
      const active = i === playersPage;
      buttons.push(
        <TouchableOpacity key={i} style={[styles.pageBtn, active && styles.pageBtnActive]} onPress={() => goToPlayersPage(i)}>
          <Text style={[styles.pageBtnText, active && styles.pageBtnTextActive]}>{i}</Text>
        </TouchableOpacity>
      );
    }
    if (playersPage < totalPlayersPages) buttons.push(
      <TouchableOpacity key="next" style={styles.pageBtn} onPress={() => goToPlayersPage(playersPage + 1)}>
        <Text style={styles.pageBtnText}>›</Text>
      </TouchableOpacity>
    );
    return <View style={styles.pagination}>{buttons}</View>;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowAddPlayerModal(true)}>
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={fetchPlayers}>
            <Text style={styles.iconText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {playersLoading ? (
        <Text style={styles.loadingText}>Загрузка игроков...</Text>
      ) : (
        <>
          <FlatList
            data={paginatedPlayers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
          <Pagination />
        </>
      )}

      <Modal visible={showAddPlayerModal} animationType="slide" transparent onRequestClose={() => setShowAddPlayerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>НОВЫЙ ИГРОК</Text>

            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput style={styles.textInput} value={newPlayer.name} onChangeText={(t) => setNewPlayer((p) => ({ ...p, name: t }))} placeholder="Имя игрока" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput style={styles.textInput} value={newPlayer.email} onChangeText={(t) => setNewPlayer((p) => ({ ...p, email: t }))} placeholder="email@example.com" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.inputLabel}>Роль</Text>
            <View style={{ flexDirection: 'row' }}>
              {['player', 'admin'].map((role) => (
                <TouchableOpacity key={role} style={[styles.roleBtn, newPlayer.role === role && styles.roleBtnActive]} onPress={() => setNewPlayer((p) => ({ ...p, role }))}>
                  <Text style={[styles.roleBtnText, newPlayer.role === role && styles.roleBtnTextActive]}>{role === 'player' ? 'ИГРОК' : 'АДМИН'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Очки</Text>
            <TextInput style={styles.textInput} value={String(newPlayer.points)} onChangeText={(t) => setNewPlayer((p) => ({ ...p, points: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Правильные прогнозы</Text>
            <TextInput style={styles.textInput} value={String(newPlayer.correct_predictions)} onChangeText={(t) => setNewPlayer((p) => ({ ...p, correct_predictions: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Всего прогнозов</Text>
            <TextInput style={styles.textInput} value={String(newPlayer.total_predictions)} onChangeText={(t) => setNewPlayer((p) => ({ ...p, total_predictions: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setShowAddPlayerModal(false)}>
                <Text style={styles.btnSecondaryText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={createPlayer}>
                <Text style={styles.btnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditPlayerModal} animationType="slide" transparent onRequestClose={() => setShowEditPlayerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ ИГРОКА</Text>

            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput style={styles.textInput} value={editPlayerData.name || ''} onChangeText={(t) => setEditPlayerData((p) => ({ ...p, name: t }))} placeholder="Имя игрока" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput style={styles.textInput} value={editPlayerData.email || ''} onChangeText={(t) => setEditPlayerData((p) => ({ ...p, email: t }))} placeholder="email@example.com" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.inputLabel}>Роль</Text>
            <View style={{ flexDirection: 'row' }}>
              {['player', 'admin'].map((role) => (
                <TouchableOpacity key={role} style={[styles.roleBtn, editPlayerData.role === role && styles.roleBtnActive]} onPress={() => setEditPlayerData((p) => ({ ...p, role }))}>
                  <Text style={[styles.roleBtnText, editPlayerData.role === role && styles.roleBtnTextActive]}>{role === 'player' ? 'ИГРОК' : 'АДМИН'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Очки</Text>
            <TextInput style={styles.textInput} value={editPlayerData.points || ''} onChangeText={(t) => setEditPlayerData((p) => ({ ...p, points: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Правильные прогнозы</Text>
            <TextInput style={styles.textInput} value={editPlayerData.correct_predictions || ''} onChangeText={(t) => setEditPlayerData((p) => ({ ...p, correct_predictions: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Всего прогнозов</Text>
            <TextInput style={styles.textInput} value={editPlayerData.total_predictions || ''} onChangeText={(t) => setEditPlayerData((p) => ({ ...p, total_predictions: t }))} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setShowEditPlayerModal(false)}>
                <Text style={styles.btnSecondaryText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={updatePlayer}>
                <Text style={styles.btnText}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 14, color: '#fff', letterSpacing: 2, fontWeight: '300' },
  actionIcons: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 30, height: 30, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 16, fontWeight: '300' },
  loadingText: { color: '#666', textAlign: 'center', fontStyle: 'italic' },
  playerItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#111' },
  playerNumberContainer: { width: 30, marginRight: 15, paddingTop: 2 },
  playerNumber: { fontSize: 12, color: '#666', fontWeight: '300' },
  playerInfo: { flex: 1, paddingRight: 10 },
  playerMainInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  playerName: { fontSize: 16, color: '#fff', fontWeight: '300', flex: 1, marginRight: 10 },
  roleContainer: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#333' },
  roleText: { fontSize: 8, color: '#fff', fontWeight: '500', letterSpacing: 0.5 },
  adminRoleText: { backgroundColor: '#fff', color: '#000' },
  playerEmail: { fontSize: 12, color: '#666', marginBottom: 6 },
  playerStats: { flexDirection: 'row', gap: 15 },
  playerStatText: { fontSize: 10, color: '#888' },
  playerActionButtons: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingTop: 2 },
  iconBtn: { width: 28, height: 28, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { borderColor: '#666' },
  iconBtnText: { color: '#fff', fontSize: 12 },
  btn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { color: '#fff', fontSize: 10, letterSpacing: 1 },
  btnSecondary: { borderColor: '#666' },
  btnSecondaryText: { color: '#666', fontSize: 10, letterSpacing: 1 },
  pagination: { marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  pageBtn: { minWidth: 30, height: 30, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  pageBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  pageBtnText: { color: '#fff', fontSize: 10 },
  pageBtnTextActive: { color: '#000' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { backgroundColor: '#000', width: '90%', maxHeight: '80%', padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { fontSize: 16, color: '#fff', letterSpacing: 2, fontWeight: '300', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, color: '#fff', marginBottom: 5, marginTop: 15 },
  textInput: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 10, color: '#fff', fontSize: 14, backgroundColor: '#111' },
  roleBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 5, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginHorizontal: 2 },
  roleBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  roleBtnText: { color: '#fff', fontSize: 10, letterSpacing: 1 },
  roleBtnTextActive: { color: '#000' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
})
