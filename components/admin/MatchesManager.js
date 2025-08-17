import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet, Switch } from 'react-native';

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
    if (errors.length) { alert(errors.join('\n')); return; }
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
    if (error) { alert('Не удалось создать матч'); return; }
    setNewMatch({ home_team: '', away_team: '', match_date: '', match_time: '', league: 'РПЛ', tour: '', status: 'upcoming', is_visible: true, home_score: null, away_score: null });
    setShowAddMatchModal(false);
    fetchMatches();
  };

  const updateMatch = async () => {
    const errors = validateMatchData(editData);
    if (errors.length) { alert(errors.join('\n')); return; }
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
    if (error) { alert('Не удалось обновить матч'); return; }
    setShowEditMatchModal(false);
    setEditingMatch(null);
    setEditData({});
    fetchMatches();
  };

  const deleteMatch = async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) { alert('Не удалось удалить матч'); return; }
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
  const formatTime = (s) => { try { return s ? s.slice(0, 5) : ''; } catch { return s; } };

  const renderItem = ({ item, index }) => {
    const matchNumber = (matchesPage - 1) * matchesPerPage + index + 1;
    return (
      <View style={styles.matchItem}>
        <View style={styles.matchHeader}>
          <View style={styles.matchNumberContainer}>
            <Text style={styles.matchNumber}>{matchNumber}</Text>
          </View>
          <View style={styles.matchInfo}>
            <Text style={styles.matchTeams}>{item.home_team} — {item.away_team}</Text>
            <View style={styles.matchMeta}>
              <Text style={styles.matchMetaText}>{formatDate(item.match_date)} • {formatTime(item.match_time)}</Text>
              {item.league ? <Text style={styles.matchMetaText}> • {item.league}</Text> : null}
              {item.tour ? <Text style={styles.matchMetaText}> • Тур {item.tour}</Text> : null}
            </View>
            {(item.home_score !== null && item.away_score !== null) && (
              <Text style={styles.matchScore}>{item.home_score} : {item.away_score}</Text>
            )}
          </View>
          <View style={styles.matchBadges}>
            <View style={styles.badgeRow}>
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
        <View style={styles.matchActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => openEditMatch(item)}>
            <Text style={styles.iconBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => deleteMatch(item.id)}>
            <Text style={styles.iconBtnText}>✕</Text>
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
        <Text style={styles.pageBtnText}>‹</Text>
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
        <Text style={styles.pageBtnText}>›</Text>
      </TouchableOpacity>
    );
    return <View style={styles.pagination}>{buttons}</View>;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>УПРАВЛЕНИЕ МАТЧАМИ</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowAddMatchModal(true)}>
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={fetchMatches}>
            <Text style={styles.iconText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {matchesLoading ? (
        <Text style={styles.loadingText}>Загрузка матчей...</Text>
      ) : (
        <>
          <FlatList
            data={paginatedMatches}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
          <Pagination />
        </>
      )}

      <Modal visible={showAddMatchModal} animationType="slide" transparent onRequestClose={() => setShowAddMatchModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>НОВЫЙ МАТЧ</Text>

            <Text style={styles.inputLabel}>Домашняя команда *</Text>
            <TextInput style={styles.textInput} value={newMatch.home_team} onChangeText={(t) => setNewMatch((p) => ({ ...p, home_team: t }))} placeholder="Название команды" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Гостевая команда *</Text>
            <TextInput style={styles.textInput} value={newMatch.away_team} onChangeText={(t) => setNewMatch((p) => ({ ...p, away_team: t }))} placeholder="Название команды" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
            <TextInput style={styles.textInput} value={newMatch.match_date} onChangeText={(t) => setNewMatch((p) => ({ ...p, match_date: t }))} placeholder="2024-01-01" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
            <TextInput style={styles.textInput} value={newMatch.match_time} onChangeText={(t) => setNewMatch((p) => ({ ...p, match_time: t }))} placeholder="21:00" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Лига</Text>
            <TextInput style={styles.textInput} value={newMatch.league} onChangeText={(t) => setNewMatch((p) => ({ ...p, league: t }))} placeholder="РПЛ" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Тур</Text>
            <TextInput style={styles.textInput} value={newMatch.tour} onChangeText={(t) => setNewMatch((p) => ({ ...p, tour: t }))} placeholder="1" placeholderTextColor="#666" keyboardType="numeric" />

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Показывать игрокам</Text>
              <Switch value={!!newMatch.is_visible} onValueChange={(v) => setNewMatch((p) => ({ ...p, is_visible: v }))} trackColor={{ false: '#333', true: '#fff' }} thumbColor={newMatch.is_visible ? '#000' : '#666'} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setShowAddMatchModal(false)}>
                <Text style={styles.btnSecondaryText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={createMatch}>
                <Text style={styles.btnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditMatchModal} animationType="slide" transparent onRequestClose={() => setShowEditMatchModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>РЕДАКТИРОВАНИЕ МАТЧА</Text>

            <Text style={styles.inputLabel}>Домашняя команда *</Text>
            <TextInput style={styles.textInput} value={editData.home_team || ''} onChangeText={(t) => setEditData((p) => ({ ...p, home_team: t }))} placeholder="Название команды" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Гостевая команда *</Text>
            <TextInput style={styles.textInput} value={editData.away_team || ''} onChangeText={(t) => setEditData((p) => ({ ...p, away_team: t }))} placeholder="Название команды" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
            <TextInput style={styles.textInput} value={editData.match_date || ''} onChangeText={(t) => setEditData((p) => ({ ...p, match_date: t }))} placeholder="2024-01-01" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Время (ЧЧ:ММ) *</Text>
            <TextInput style={styles.textInput} value={editData.match_time || ''} onChangeText={(t) => setEditData((p) => ({ ...p, match_time: t }))} placeholder="21:00" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Лига</Text>
            <TextInput style={styles.textInput} value={editData.league || ''} onChangeText={(t) => setEditData((p) => ({ ...p, league: t }))} placeholder="РПЛ" placeholderTextColor="#666" />

            <Text style={styles.inputLabel}>Тур</Text>
            <TextInput style={styles.textInput} value={editData.tour || ''} onChangeText={(t) => setEditData((p) => ({ ...p, tour: t }))} placeholder="1" placeholderTextColor="#666" keyboardType="numeric" />

            <Text style={styles.inputLabel}>Голы домашней команды</Text>
            <TextInput style={styles.textInput} value={editData.home_score || ''} onChangeText={(t) => setEditData((p) => ({ ...p, home_score: t }))} placeholder="0" placeholderTextColor="#666" keyboardType="numeric" />

            <Text style={styles.inputLabel}>Голы гостевой команды</Text>
            <TextInput style={styles.textInput} value={editData.away_score || ''} onChangeText={(t) => setEditData((p) => ({ ...p, away_score: t }))} placeholder="0" placeholderTextColor="#666" keyboardType="numeric" />

            <Text style={styles.inputLabel}>Статус</Text>
            <View style={{ flexDirection: 'row' }}>
              {['upcoming', 'live', 'finished'].map((status) => (
                <TouchableOpacity key={status} style={[styles.roleBtn, editData.status === status && styles.roleBtnActive]} onPress={() => setEditData((p) => ({ ...p, status }))}>
                  <Text style={[styles.roleBtnText, editData.status === status && styles.roleBtnTextActive]}>{getStatusText(status)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Показывать игрокам</Text>
              <Switch value={!!editData.is_visible} onValueChange={(v) => setEditData((p) => ({ ...p, is_visible: v }))} trackColor={{ false: '#333', true: '#fff' }} thumbColor={editData.is_visible ? '#000' : '#666'} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setShowEditMatchModal(false)}>
                <Text style={styles.btnSecondaryText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={updateMatch}>
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
  matchItem: { borderBottomWidth: 1, borderBottomColor: '#111', paddingVertical: 15 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  matchNumberContainer: { width: 30, marginRight: 15 },
  matchNumber: { fontSize: 12, color: '#666', fontWeight: '300' },
  matchInfo: { flex: 1 },
  matchTeams: { fontSize: 16, color: '#fff', fontWeight: '300', marginBottom: 5 },
  matchMeta: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  matchMetaText: { fontSize: 10, color: '#888' },
  matchScore: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  matchBadges: { alignItems: 'flex-end' },
  badgeRow: { flexDirection: 'row', gap: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 8, color: '#000', fontWeight: 'bold', letterSpacing: 1 },
  hiddenBadge: { backgroundColor: '#666', paddingHorizontal: 8, paddingVertical: 4 },
  hiddenText: { fontSize: 8, color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  matchActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  iconBtn: { width: 28, height: 28, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { borderColor: '#666' },
  iconBtnText: { color: '#fff', fontSize: 12 },
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
})
