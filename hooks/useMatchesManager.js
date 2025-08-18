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
    if (!m.match_time?.trim()) errors.push('Введите время матча');
    return errors;
  };

  const isValidDate = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [yyyy, mm, dd] = s.split('-').map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
  };

  const isValidTime = (s) => {
    const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
    if (!t) return false;
    const hh = Number(t[1]);
    const mm = Number(t[2]);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  };

  const toIsoTime = (s) => {
    const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s.trim());
    if (!t) return s;
    const hh = t[1];
    const mm = t[2];
    const ss = t[3] ?? '00';
    return `${hh}:${mm}:${ss}`;
  };

  const createMatch = async () => {
    const errors = validateMatchData(newMatch);
    if (newMatch.match_date && !isValidDate(newMatch.match_date.trim())) errors.push('Введите дату в формате ГГГГ-ММ-ДД');
    if (newMatch.match_time && !isValidTime(newMatch.match_time.trim())) errors.push('Введите время в формате ЧЧ:ММ');
    if (errors.length) { return false; }

    const payload = {};
    const raw = {
      home_team: newMatch.home_team?.trim(),
      away_team: newMatch.away_team?.trim(),
      match_date: newMatch.match_date?.trim(),
      match_time: newMatch.match_time ? toIsoTime(newMatch.match_time) : undefined,
      league: (newMatch.league?.trim() || 'РПЛ'),
      tour: newMatch.tour,
      status: newMatch.status || 'upcoming',
      is_visible: !!newMatch.is_visible,
      home_score: newMatch.home_score,
      away_score: newMatch.away_score,
    };
    Object.entries(raw).forEach(([k, v]) => {
      if (v === undefined) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (k === 'home_score' || k === 'away_score') {
        if (v === '') return;
        if (v === null) { payload[k] = null; return; }
        const num = Number(v); payload[k] = Number.isNaN(num) ? undefined : num; return;
      }
      if (k === 'tour') {
        if (v === '' || v === null || v === undefined) { payload[k] = null; return; }
        const num = Number(v); payload[k] = Number.isNaN(num) ? null : num; return;
      }
      payload[k] = v;
    });

    const { error } = await supabase.from('matches').insert([payload]);
    if (error) { return false; }
    setNewMatch({ home_team: '', away_team: '', match_date: '', match_time: '', league: 'РПЛ', tour: '', status: 'upcoming', is_visible: true, home_score: null, away_score: null });
    setShowAddMatchModal(false);
    await fetchMatches();
    return true;
  };

  const updateMatch = async () => {
    const errors = validateMatchData(editData);
    if (editData.match_date && !isValidDate(editData.match_date.trim())) errors.push('Введите дату в формате ГГГГ-ММ-ДД');
    if (editData.match_time && !isValidTime(editData.match_time.trim())) errors.push('Введите время в формате ЧЧ:ММ');
    if (errors.length) { return false; }

    const payload = {};
    const raw = {
      home_team: editData.home_team?.trim(),
      away_team: editData.away_team?.trim(),
      match_date: editData.match_date?.trim(),
      match_time: editData.match_time ? toIsoTime(editData.match_time) : undefined,
      league: editData.league?.trim(),
      tour: editData.tour,
      status: editData.status,
      is_visible: editData.is_visible,
      home_score: editData.home_score,
      away_score: editData.away_score,
    };
    Object.entries(raw).forEach(([k, v]) => {
      if (v === undefined) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (k === 'home_score' || k === 'away_score') {
        if (v === '') return;
        if (v === null) { payload[k] = null; return; }
        const num = Number(v); payload[k] = Number.isNaN(num) ? undefined : num; return;
      }
      if (k === 'tour') {
        if (v === '' || v === null || v === undefined) { payload[k] = null; return; }
        const num = Number(v); payload[k] = Number.isNaN(num) ? null : num; return;
      }
      payload[k] = v;
    });

    const { error } = await supabase.from('matches').update(payload).eq('id', editingMatch.id);
    if (error) { return false; }
    setShowEditMatchModal(false);
    setEditingMatch(null);
    setEditData({});
    await fetchMatches();
    return true;
  };

  const deleteMatch = async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) { return false; }
    await fetchMatches();
    return true;
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
    getStatusColor: (status) => {
      switch (status) { case 'live': return '#F87171'; case 'finished': return '#4ADE80'; default: return '#F59E0B'; }
    },
    getStatusText: (status) => {
      switch (status) { case 'live': return 'В ЭФИРЕ'; case 'finished': return 'ЗАВЕРШЕН'; default: return 'ПРЕДСТОЯЩИЙ'; }
    },
    formatDate,
    formatTime,
  };
}
