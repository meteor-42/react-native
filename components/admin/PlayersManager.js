import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
          <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.playerEmail} numberOfLines={1} ellipsizeMode="tail">{item.email}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.playerStatText}>Очки: {item.points}</Text>
            <Text style={styles.playerStatText}>Прогнозы: {item.correct_predictions}/{item.total_predictions}</Text>
          </View>
        </View>
        <View style={styles.playerActionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => openEditPlayer(item)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => deletePlayer(item.id)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="delete" size={18} color="#fff" />
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
        <Icon name="chevron-left" size={16} color="#fff" />
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
        <Icon name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    );
    return <View style={styles.pagination}>{buttons}</View>;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowAddPlayerModal(true)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={fetchPlayers}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {playersLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка игроков...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedPlayers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          <Pagination />
        </>
      )}

      <Modal visible={showAddPlayerModal} animationType="slide" transparent onRequestClose={() => setShowAddPlayerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>НОВЫЙ ИГРОК</Text>
              <TouchableOpacity onPress={() => setShowAddPlayerModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput 
              style={styles.textInput} 
              value={newPlayer.name} 
              onChangeText={(t) => setNewPlayer((p) => ({ ...p, name: t }))} 
              placeholder="Имя игрока" 
              placeholderTextColor="#666" 
            />

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput 
              style={styles.textInput} 
              value={newPlayer.email} 
              onChangeText={(t) => setNewPlayer((p) => ({ ...p, email: t }))} 
              placeholder="email@example.com" 
              placeholderTextColor="#666" 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />

            <Text style={styles.inputLabel}>Роль</Text>
            <View style={styles.roleContainer}>
              {['player', 'admin'].map((role) => (
                <TouchableOpacity 
                  key={role} 
                  style={[styles.roleBtn, newPlayer.role === role && styles.roleBtnActive]} 
                  onPress={() => setNewPlayer((p) => ({ ...p, role }))}
                >
                  <Text style={[styles.roleBtnText, newPlayer.role === role && styles.roleBtnTextActive]}>
                    {role === 'player' ? 'ИГРОК' : 'АДМИН'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Очки</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={String(newPlayer.points)} 
                  onChangeText={(t) => setNewPlayer((p) => ({ ...p, points: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Правильные</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={String(newPlayer.correct_predictions)} 
                  onChangeText={(t) => setNewPlayer((p) => ({ ...p, correct_predictions: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Всего</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={String(newPlayer.total_predictions)} 
                  onChangeText={(t) => setNewPlayer((p) => ({ ...p, total_predictions: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddPlayerModal(false)}>
                <Text style={styles.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={createPlayer}>
                <Text style={styles.saveBtnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditPlayerModal} animationType="slide" transparent onRequestClose={() => setShowEditPlayerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ ИГРОКА</Text>
              <TouchableOpacity onPress={() => setShowEditPlayerModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Имя *</Text>
            <TextInput 
              style={styles.textInput} 
              value={editPlayerData.name || ''} 
              onChangeText={(t) => setEditPlayerData((p) => ({ ...p, name: t }))} 
              placeholder="Имя игрока" 
              placeholderTextColor="#666" 
            />

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput 
              style={styles.textInput} 
              value={editPlayerData.email || ''} 
              onChangeText={(t) => setEditPlayerData((p) => ({ ...p, email: t }))} 
              placeholder="email@example.com" 
              placeholderTextColor="#666" 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />

            <Text style={styles.inputLabel}>Роль</Text>
            <View style={styles.roleContainer}>
              {['player', 'admin'].map((role) => (
                <TouchableOpacity 
                  key={role} 
                  style={[styles.roleBtn, editPlayerData.role === role && styles.roleBtnActive]} 
                  onPress={() => setEditPlayerData((p) => ({ ...p, role }))}
                >
                  <Text style={[styles.roleBtnText, editPlayerData.role === role && styles.roleBtnTextActive]}>
                    {role === 'player' ? 'ИГРОК' : 'АДМИН'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Очки</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={editPlayerData.points || ''} 
                  onChangeText={(t) => setEditPlayerData((p) => ({ ...p, points: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Правильные</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={editPlayerData.correct_predictions || ''} 
                  onChangeText={(t) => setEditPlayerData((p) => ({ ...p, correct_predictions: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
              <View style={styles.statInputContainer}>
                <Text style={styles.inputLabel}>Всего</Text>
                <TextInput 
                  style={styles.statInput} 
                  value={editPlayerData.total_predictions || ''} 
                  onChangeText={(t) => setEditPlayerData((p) => ({ ...p, total_predictions: t }))} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  placeholderTextColor="#666" 
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditPlayerModal(false)}>
                <Text style={styles.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={updatePlayer}>
                <Text style={styles.saveBtnText}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 1,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  playerNumberContainer: {
    width: 24,
    marginRight: 12,
  },
  playerNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '300',
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  playerStatText: {
    fontSize: 10,
    color: '#888',
  },
  playerActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  pagination: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  pageBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  pageBtnTextActive: {
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#000',
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '300',
  },
  textInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  roleBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '300',
  },
  roleBtnTextActive: {
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statInputContainer: {
    flex: 1,
  },
  statInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 1,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 1,
  },
});
