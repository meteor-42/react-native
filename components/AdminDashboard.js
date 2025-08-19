import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PlayersManager from './admin/PlayersManager';
import MatchesManager from './admin/MatchesManager';
import { lists, layout } from '../styles';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const state = useAdminDashboard();

  return (
    <View style={layout.flex1}>
      <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#333', marginBottom: 10 }}>
        <TouchableOpacity
          style={[{ flex: 1, paddingVertical: 12, alignItems: 'center' }, state.activeTab === 'matches' && { backgroundColor: '#fff', borderColor: '#fff' }]}
          onPress={() => state.setActiveTab('matches')}
        >
          <Text style={[{ color: '#fff', fontSize: 12, letterSpacing: 1 }, state.activeTab === 'matches' && { color: '#000' }]}>
            Матчи ({state.matches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ flex: 1, paddingVertical: 12, alignItems: 'center' }, state.activeTab === 'players' && { backgroundColor: '#fff', borderColor: '#fff' }]}
          onPress={() => state.setActiveTab('players')}
        >
          <Text style={[{ color: '#fff', fontSize: 12, letterSpacing: 1 }, state.activeTab === 'players' && { color: '#000' }]}>
            Игроки ({state.players.length})
          </Text>
        </TouchableOpacity>
      </View>

      {state.activeTab === 'matches' && (
        <MatchesManager
          matches={state.matches}
          setMatches={state.setMatches}
          matchesLoading={state.matchesLoading}
          setMatchesLoading={state.setMatchesLoading}
          fetchMatches={state.fetchMatches}
          showAddMatchModal={state.showAddMatchModal}
          setShowAddMatchModal={state.setShowAddMatchModal}
          editingMatch={state.editingMatch}
          setEditingMatch={state.setEditingMatch}
          showEditMatchModal={state.showEditMatchModal}
          setShowEditMatchModal={state.setShowEditMatchModal}
          matchesPage={state.matchesPage}
          setMatchesPage={state.setMatchesPage}
          matchesPerPage={state.matchesPerPage}
          newMatch={state.newMatch}
          setNewMatch={state.setNewMatch}
          editData={state.editData}
          setEditData={state.setEditData}
          supabase={supabase}
        />
      )}

      {state.activeTab === 'players' && (
        <PlayersManager
          players={state.players}
          setPlayers={state.setPlayers}
          loading={state.loading}
          playersLoading={state.playersLoading}
          setPlayersLoading={state.setPlayersLoading}
          fetchPlayers={state.fetchPlayers}
          showAddPlayerModal={state.showAddPlayerModal}
          setShowAddPlayerModal={state.setShowAddPlayerModal}
          editingPlayer={state.editingPlayer}
          setEditingPlayer={state.setEditingPlayer}
          showEditPlayerModal={state.showEditPlayerModal}
          setShowEditPlayerModal={state.setShowEditPlayerModal}
          playersPage={state.playersPage}
          setPlayersPage={state.setPlayersPage}
          playersPerPage={state.playersPerPage}
          newPlayer={state.newPlayer}
          setNewPlayer={state.setNewPlayer}
          editPlayerData={state.editPlayerData}
          setEditPlayerData={state.setEditPlayerData}
          supabase={supabase}
        />
      )}
    </View>
  );
}
