import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { lists, forms } from "../../styles";
import { useMatchesManager } from "../../hooks/useMatchesManager";

export default function MatchesManager(props) {
  const {
    matches,
    matchesLoading,
    fetchMatches,
    showAddMatchModal,
    setShowAddMatchModal,
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
    editingMatch,
    setEditingMatch,
  } = props;

  const {
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
  } = useMatchesManager({
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
  });

  const Pagination = () => {
    if (totalMatchesPages <= 1) return null;
    const buttons = [];
    if (matchesPage > 1)
      buttons.push(
        <TouchableOpacity
          key="prev"
          style={lists.pageBtn}
          onPress={() => goToMatchesPage(matchesPage - 1)}
        >
          <Icon name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
      );
    for (let i = 1; i <= totalMatchesPages; i++) {
      const active = i === matchesPage;
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[lists.pageBtn, active && lists.pageBtnActive]}
          onPress={() => goToMatchesPage(i)}
        >
          <Text style={[lists.pageBtnText, active && lists.pageBtnTextActive]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    if (matchesPage < totalMatchesPages)
      buttons.push(
        <TouchableOpacity
          key="next"
          style={lists.pageBtn}
          onPress={() => goToMatchesPage(matchesPage + 1)}
        >
          <Icon name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
      );
    return <View style={lists.pagination}>{buttons}</View>;
  };

  const renderItem = ({ item, index }) => {
    const matchNumber = (matchesPage - 1) * matchesPerPage + index + 1;
    return (
      <View style={lists.row}>
        <View style={lists.numberContainer}>
          <Text style={lists.number}>{matchNumber}</Text>
        </View>
        <View style={lists.info}>
          <Text style={lists.title} numberOfLines={2} ellipsizeMode="tail">
            {item.home_team} — {item.away_team}
          </Text>
          <View style={lists.metaRow}>
            <Text style={lists.subtitle}>
              {formatDate(item.match_date)} • {formatTime(item.match_time)}
            </Text>
            {item.league && (
              <Text style={lists.subtitle}> • {item.league}</Text>
            )}
            {item.tour && (
              <Text style={lists.subtitle}> • Тур {item.tour}</Text>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            {item.home_score !== null && item.away_score !== null && (
              <Text style={lists.score}>
                {item.home_score} : {item.away_score}
              </Text>
            )}
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <View
                style={[
                  lists.badge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={lists.badgeTextDark}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              {!item.is_visible && (
                <View style={lists.hiddenBadge}>
                  <Text style={lists.badgeTextLight}>СКРЫТ</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={lists.actionsRow}>
          <TouchableOpacity
            style={lists.actionBtn}
            onPress={() => openEditMatch(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={lists.actionBtn}
            onPress={() => deleteMatch(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={lists.section}>
      <View style={lists.sectionHeader}>
        <Text style={lists.sectionTitle}>УПРАВЛЕНИЕ МАТЧАМИ</Text>
        <View style={lists.actionIcons}>
          <TouchableOpacity
            style={lists.iconButton}
            onPress={() => setShowAddMatchModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={lists.iconButton}
            onPress={fetchMatches}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {matchesLoading ? (
        <View style={lists.loadingContainer}>
          <Text style={lists.loadingText}>Загрузка матчей...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedMatches}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={lists.listContent}
          />
          <Pagination />
        </>
      )}

      <Modal
        visible={showAddMatchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMatchModal(false)}
      >
        <View style={forms.modalContainer}>
          <View style={forms.modalContent}>
            <View style={forms.modalHeader}>
              <Text style={forms.modalTitle}>НОВЫЙ МАТЧ</Text>
              <TouchableOpacity onPress={() => setShowAddMatchModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={forms.inputLabel}>Домашняя команда *</Text>
            <TextInput
              style={forms.textInput}
              value={newMatch.home_team}
              onChangeText={(t) => setNewMatch((p) => ({ ...p, home_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <Text style={forms.inputLabel}>Гостевая команда *</Text>
            <TextInput
              style={forms.textInput}
              value={newMatch.away_team}
              onChangeText={(t) => setNewMatch((p) => ({ ...p, away_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
                <TextInput
                  style={forms.textInput}
                  value={newMatch.match_date}
                  onChangeText={(t) =>
                    setNewMatch((p) => ({ ...p, match_date: t }))
                  }
                  placeholder="2024-01-01"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Время (ЧЧ:ММ) *</Text>
                <TextInput
                  style={forms.textInput}
                  value={newMatch.match_time}
                  onChangeText={(t) =>
                    setNewMatch((p) => ({ ...p, match_time: t }))
                  }
                  placeholder="21:00"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 2 }}>
                <Text style={forms.inputLabel}>Лига</Text>
                <TextInput
                  style={forms.textInput}
                  value={newMatch.league}
                  onChangeText={(t) =>
                    setNewMatch((p) => ({ ...p, league: t }))
                  }
                  placeholder="РПЛ"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Тур</Text>
                <TextInput
                  style={forms.textInput}
                  value={newMatch.tour}
                  onChangeText={(t) => setNewMatch((p) => ({ ...p, tour: t }))}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={forms.switchRow}>
              <Text style={forms.inputLabel}>Показывать игрокам</Text>
              <Switch
                value={!!newMatch.is_visible}
                onValueChange={(v) =>
                  setNewMatch((p) => ({ ...p, is_visible: v }))
                }
                trackColor={{ false: "#333", true: "#fff" }}
                thumbColor={newMatch.is_visible ? "#000" : "#666"}
              />
            </View>

            <View style={forms.modalButtons}>
              <TouchableOpacity
                style={forms.cancelBtn}
                onPress={() => setShowAddMatchModal(false)}
              >
                <Text style={forms.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={forms.saveBtn} onPress={createMatch}>
                <Text style={forms.saveBtnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditMatchModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditMatchModal(false)}
      >
        <View style={forms.modalContainer}>
          <View style={forms.modalContent}>
            <View style={forms.modalHeader}>
              <Text style={forms.modalTitle}>РЕДАКТИРОВАНИЕ МАТЧА</Text>
              <TouchableOpacity onPress={() => setShowEditMatchModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={forms.inputLabel}>Домашняя команда *</Text>
            <TextInput
              style={forms.textInput}
              value={editData.home_team || ""}
              onChangeText={(t) => setEditData((p) => ({ ...p, home_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <Text style={forms.inputLabel}>Гостевая команда *</Text>
            <TextInput
              style={forms.textInput}
              value={editData.away_team || ""}
              onChangeText={(t) => setEditData((p) => ({ ...p, away_team: t }))}
              placeholder="Название команды"
              placeholderTextColor="#666"
            />

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Дата (ГГГГ-ММ-ДД) *</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.match_date || ""}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, match_date: t }))
                  }
                  placeholder="2024-01-01"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Время (ЧЧ:ММ) *</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.match_time || ""}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, match_time: t }))
                  }
                  placeholder="21:00"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 2 }}>
                <Text style={forms.inputLabel}>Лига</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.league || ""}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, league: t }))
                  }
                  placeholder="РПЛ"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Тур</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.tour || ""}
                  onChangeText={(t) => setEditData((p) => ({ ...p, tour: t }))}
                  placeholder="1"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Голы домашней</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.home_score || ""}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, home_score: t }))
                  }
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={forms.inputLabel}>Голы гостевой</Text>
                <TextInput
                  style={forms.textInput}
                  value={editData.away_score || ""}
                  onChangeText={(t) =>
                    setEditData((p) => ({ ...p, away_score: t }))
                  }
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={forms.inputLabel}>Статус</Text>
            <View style={forms.roleRow}>
              {["upcoming", "live", "finished"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    forms.roleBtn,
                    editData.status === status && forms.roleBtnActive,
                  ]}
                  onPress={() => setEditData((p) => ({ ...p, status }))}
                >
                  <Text
                    style={[
                      forms.roleBtnText,
                      editData.status === status && forms.roleBtnTextActive,
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={forms.switchRow}>
              <Text style={forms.inputLabel}>Показывать игрокам</Text>
              <Switch
                value={!!editData.is_visible}
                onValueChange={(v) =>
                  setEditData((p) => ({ ...p, is_visible: v }))
                }
                trackColor={{ false: "#333", true: "#fff" }}
                thumbColor={editData.is_visible ? "#000" : "#666"}
              />
            </View>

            <View style={forms.modalButtons}>
              <TouchableOpacity
                style={forms.cancelBtn}
                onPress={() => setShowEditMatchModal(false)}
              >
                <Text style={forms.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={forms.saveBtn} onPress={updateMatch}>
                <Text style={forms.saveBtnText}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
