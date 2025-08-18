import { useMemo } from 'react';

export function useMatchesManager({
  matches,
  matchesPage,
  matchesPerPage,
  setMatchesPage,
  supabase,
  newMatch,
  setNewMatch,
  editData,
  setEditData,
  editingMatch,
  setEditingMatch,
  fetchMatches,
  setShowAddMatchModal,
  setShowEditMatchModal,
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
      case 'live': return '#F87171';
      case 'finished': return '#4ADE80';
      default: return '#F59E0B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'В ЭФИРЕ';
      case 'finished': return 'ЗАВЕРШЕН';
      default: return 'ПРЕДСТОЯЩИЙ';
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

  const goToMatchesPage = (p) => { if (p >= 1 && p <= totalMatchesPages) setMatchesPage(p); };

  const formatDate = (s) => { try { return new Date(s).toLocaleDateString('ru-RU'); } catch { return s; } };
  const formatTime = (s) => { try { return s ? s.slice(0, 5) : ''; } catch { return s; } };

  return {
    totalMatchesPages,
    paginatedMatches,
    createMatch,
    updateMatch,
    deleteMatch,
    openEditMatch,
    goToMatchesPage,
    getStatusColor,
    getStatusText,
    formatDate,
    formatTime,
  };
}