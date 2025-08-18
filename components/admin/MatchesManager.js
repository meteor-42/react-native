import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MatchesManager({
  matches,
  setMatches,
  matchesLoading,
  setMatchesLoading,
  fetchMatches,
  showAddMatchModal,
  setShowAddMatchModal,
  editingMatch,
  setEditingMatch,
  showEditMatchModal,
  setShowEditMatchModal,
  matchesPage,
  setMatchesPage,
  matchesPerPage,
  newMatch,
  setNewMatch,
  editData,
  setEditData,
  supabase,
}) {
  const totalMatchesPages = Math.ceil(matches.length / matchesPerPage) || 1;
  const paginatedMatches = useMemo(
    () => matches.slice((matchesPage - 1) * matchesPerPage, matchesPage * matchesPerPage),
    [matches, matchesPage, matchesPerPage]
  );

  const validateMatchData = (m) => {
    const errors = [];
    if (!m.home_team?.trim()) errors.push('Введите домашнюю команду');
    if (!m.away_team?.trim()) errors.push('Введите гостевую команду');
    if (!m.match_date?.trim()) errors.push('Введите дату матча');
    const timeRegex = /^(\d{2}):(\d{2})$/;
    if (!m.match_time?.trim() || !timeRegex.test(m.match_time.trim())) errors.push('Введите время в формате ЧЧ:ММ');
    return errors;
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

  const createMatch = async () => {
    const errors = validateMatchData(newMatch);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const payload = {
      home_team: newMatch.home_team.trim(),
      away_team: newMatch.away_team.trim(),
      match_date: newMatch.match_date.trim(),
      match_time: newMatch.match_time.includes(':') ? `${newMatch.match_time}:00` : newMatch.match_time,
      league: newMatch.league?.trim() || 'РПЛ',
      tour: newMatch.tour ? parseInt(newMatch.tour) : null,
      status: newMatch.status,
      is_visible: !!newMatch.is_visible,
      home_score: newMatch.home_score,
      away_score: newMatch.away_score,
    };
    const { error } = await supabase.from('matches').insert([payload]);
    if (error) {
      alert('Не удалось создать матч');
      return;
    }
    setNewMatch({ home_team: '', away_team: '', match_date: '', match_time: '', league: 'РПЛ', tour: '', status: 'upcoming', is_visible: true, home_score: null, away_score: null });
    setShowAddMatchModal(false);
    fetchMatches();
  };

  const updateMatch = async () => {
    const errors = validateMatchData(editData);
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }
    const payload = {
      home_team: editData.home_team?.trim(),
      away_team: editData.away_team?.trim(),
      match_date: editData.match_date?.trim(),
      match_time: editData.match_time?.includes(':') ? `${editData.match_time}:00` : editData.match_time,
      league: editData.league?.trim() || 'РПЛ',
      tour: editData.tour ? parseInt(editData.tour) : null,
      status: editData.status,
      is_visible: !!editData.is_visible,
      home_score: editData.home_score !== '' ? (editData.home_score ? parseInt(editData.home_score) : null) : null,
      away_score: editData.away_score !== '' ? (editData.away_score ? parseInt(editData.away_score) : null) : null,
    };
    const { error } = await supabase.from('matches').update(payload).eq('id', editingMatch.id);
    if (error) {
      alert('Не удалось обновить матч');
      return;
    }
    setShowEditMatchModal(false);
    setEditingMatch(null);
    setEditData({});
    fetchMatches();
  };

  const deleteMatch = async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) {
      alert('Не удалось удалить матч');
      return;
    }
    fetchMatches();
  };

  const openEditMatch = (match) => {
    setEditingMatch(match);
    setEditData({
      home_team: match.home_team,
      away_team: match.away_team,
      match_date: match.match_date,
      match_time: match.match_time ? match.match_time.slice(0, 5) : '',
      league: match.league,
      tour: match.tour ? String(match.tour) : '',
      status: match.status,
      is_visible: match.is_visible,
      home_score: match.home_score !== null ? String(match.home_score) : '',
      away_score: match.away_score !== null ? String(match.away_score) : '',
    });
    setShowEditMatchModal(true);
  };

  const goToMatchesPage = (p) => {
    if (p >= 1 && p <= totalMatchesPages) setMatchesPage(p);
  };

  const formatDate = (s) => {
    try { return new Date(s).toLocaleDateString('ru-RU'); } catch { return s; }
  };

  const formatTime = (s) => {
    try { return s ? s.slice(0, 5) : ''; } catch { return s; }
  };

  const renderItem = ({ item, index }) => {
    const matchNumber = (matchesPage - 1) * matchesPerPage + index + 1;
    return (
      <View style={styles.matchItem}>
        <View style={styles.matchNumberContainer}>
          <Text style={styles.matchNumber}>{matchNumber}</Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchTeams} numberOfLines={2} ellipsizeMode="tail">
            {item.home_team} — {item.away_team}
          </Text>
          <View style={styles.matchMeta}>
            <Text style={styles.matchMetaText}>
              {formatDate(item.match_date)} • {formatTime(item.match_time)}
            </Text>
            {item.league && <Text style={styles.matchMetaText}> • {item.league}</Text>}
            {item.tour && <Text style={styles.matchMetaText}> • Тур {item.tour}</Text>}
          </View>
          <View style={styles.scoreContainer}>
            {(item.home_score !== null && item.away_score !== null) && (
              <Text style={styles.matchScore}>{item.home_score} : {item.away_score}</Text>
            )}
            <View style={styles.statusContainer}>
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
        </View>
        <View style={styles.matchActionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditMatch(item)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMatch(item.id)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const Pagination = () => {
    if (totalMatchesPages <= 1) return null;
    const buttons = [];
    if (matchesPage > 1) buttons.push(
      <TouchableOpacity key="prev" style={styles.pageBtn} onPress={() => goToMatchesPage(matchesPage - 1)}>
        <Icon name="chevron-left" size={16} color="#fff" />
      </TouchableOpacity>
    );
    for (let i = 1; i <= totalMatchesPages; i++) {
      const active = i === matchesPage;
      buttons.push(
        <TouchableOpacity key={i} style={[styles.pageBtn, active && styles.pageBtnActive]} onPress={() => goToMatchesPage(i)}>
          <Text style={[styles.pageBtnText, active && styles.pageBtnTextActive]}>{i}</Text>
        </TouchableOpacity>
      );
    }
    if (matchesPage < totalMatchesPages) buttons.push(
      <TouchableOpacity key="next" style={styles.pageBtn} onPress={() => goToMatchesPage(matchesPage + 1)}>
        <Icon name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    );
    return <View style={styles.pagination}>{buttons}</View>;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ МАТЧАМИ</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowAddMatchModal(true)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={fetchMatches}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {matchesLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка матчей...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedMatches}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          <Pagination />
        </>
      )}

      <Modal visible={showAddMatchModal} animationType="slide" transparent onRequestClose={() => setShowAddMatchModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>НОВЫЙ МАТЧ</Text>
              <TouchableOpacity onPress={() => setShowAddMatchModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Домашняя команда *</Text>
            <TextInput
              style={styles.textInput}
              value={newMatch.home_team}
              onChangeText={(t) => setNewMatch((p) => ({ ...p, home_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Гостевая команда *</Text>
            <TextInput
              style={styles.textInput}
              value={newMatch.away_team}
              onChangeText={(t) => setNewMatch((p) => ({ ...p, away_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={newMatch.match_date}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, match_date: t }))}
                  placeholder="2024-01-01"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={newMatch.match_time}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, match_time: t }))}
                  placeholder="21:00"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.leagueTourRow}>
              <View style={styles.leagueContainer}>
                <Text style={styles.inputLabel}>Лига</Text>
                <TextInput
                  style={styles.leagueInput}
                  value={newMatch.league}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, league: t }))}
                  placeholder="РПЛ"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.tourContainer}>
                <Text style={styles.inputLabel}>Тур</Text>
                <TextInput
                  style={styles.tourInput}
                  value={newMatch.tour}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, tour: t }))}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Показывать игрокам</Text>
              <Switch
                value={!!newMatch.is_visible}
                onValueChange={(v) => setNewMatch((p) => ({ ...p, is_visible: v }))}
                trackColor={{ false: '#333', true: '#fff' }}
                thumbColor={newMatch.is_visible ? '#000' : '#666'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddMatchModal(false)}>
                <Text style={styles.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={createMatch}>
                <Text style={styles.saveBtnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditMatchModal} animationType="slide" transparent onRequestClose={() => setShowEditMatchModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ МАТЧА</Text>
              <TouchableOpacity onPress={() => setShowEditMatchModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Домашняя команда *</Text>
            <TextInput
              style={styles.textInput}
              value={editData.home_team || ''}
              onChangeText={(t) => setEditData((p) => ({ ...p, home_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Гостевая команда *</Text>
            <TextInput
              style={styles.textInput}
              value={editData.away_team || ''}
              onChangeText={(t) => setEditData((p) => ({ ...p, away_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={editData.match_date || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, match_date: t }))}
                  placeholder="2024-01-01"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={editData.match_time || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, match_time: t }))}
                  placeholder="21:00"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.leagueTourRow}>
              <View style={styles.leagueContainer}>
                <Text style={styles.inputLabel}>Лига</Text>
                <TextInput
                  style={styles.leagueInput}
                  value={editData.league || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, league: t }))}
                  placeholder="РПЛ"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.tourContainer}>
                <Text style={styles.inputLabel}>Тур</Text>
                <TextInput
                  style={styles.tourInput}
                  value={editData.tour || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, tour: t }))}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreInputContainer}>
                <Text style={styles.inputLabel}>Голы домашней</Text>
                <TextInput
                  style={styles.scoreInput}
                  value={editData.home_score || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, home_score: t }))}
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.scoreInputContainer}>
                <Text style={styles.inputLabel}>Голы гостевой</Text>
                <TextInput
                  style={styles.scoreInput}
                  value={editData.away_score || ''}
                  onChangeText={(t) => setEditData((p) => ({ ...p, away_score: t }))}
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Статус</Text>
            <View style={styles.roleContainer}>
              {['upcoming', 'live', 'finished'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.roleBtn, editData.status === status && styles.roleBtnActive]}
                  onPress={() => setEditData((p) => ({ ...p, status }))}
                >
                  <Text style={[styles.roleBtnText, editData.status === status && styles.roleBtnTextActive]}>
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Показывать игрокам</Text>
              <Switch
                value={!!editData.is_visible}
                onValueChange={(v) => setEditData((p) => ({ ...p, is_visible: v }))}
                trackColor={{ false: '#333', true: '#fff' }}
                thumbColor={editData.is_visible ? '#000' : '#666'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditMatchModal(false)}>
                <Text style={styles.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={updateMatch}>
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
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  matchNumberContainer: {
    width: 24,
    marginRight: 12,
  },
  matchNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '300',
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchTeams: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 6,
  },
  matchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  matchMetaText: {
    fontSize: 10,
    color: '#888',
  },
  matchScore: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  matchActionButtons: {
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTimeInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  leagueTourRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  leagueContainer: {
    flex: 2,
  },
  tourContainer: {
    flex: 1,
  },
  leagueInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  tourInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  scoreInputContainer: {
    flex: 1,
  },
  scoreInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
});
