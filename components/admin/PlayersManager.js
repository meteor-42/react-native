import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { lists, forms } from "../../styles";
import { usePlayersManager } from "../../hooks/usePlayersManager";

export default function PlayersManager(props) {
  const {
    players,
    playersLoading,
    showAddPlayerModal,
    setShowAddPlayerModal,
    showEditPlayerModal,
    setShowEditPlayerModal,
    newPlayer,
    setNewPlayer,
    editPlayerData,
    setEditPlayerData,
    fetchPlayers,
    playersPage,
    setPlayersPage,
    playersPerPage,
    supabase,
    editingPlayer,
    setEditingPlayer,
  } = props;

  const {
    totalPlayersPages,
    paginatedPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    openEditPlayer,
    goToPlayersPage,
  } = usePlayersManager({
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
  });

  const Pagination = () => {
    if (totalPlayersPages <= 1) return null;
    const buttons = [];
    if (playersPage > 1)
      buttons.push(
        <TouchableOpacity
          key="prev"
          style={lists.pageBtn}
          onPress={() => goToPlayersPage(playersPage - 1)}
        >
          <Icon name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
      );
    for (let i = 1; i <= totalPlayersPages; i++) {
      const active = i === playersPage;
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[lists.pageBtn, active && lists.pageBtnActive]}
          onPress={() => goToPlayersPage(i)}
        >
          <Text style={[lists.pageBtnText, active && lists.pageBtnTextActive]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    if (playersPage < totalPlayersPages)
      buttons.push(
        <TouchableOpacity
          key="next"
          style={lists.pageBtn}
          onPress={() => goToPlayersPage(playersPage + 1)}
        >
          <Icon name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
      );
    return <View style={lists.pagination}>{buttons}</View>;
  };

  const renderItem = ({ item, index }) => {
    const playerNumber = (playersPage - 1) * playersPerPage + index + 1;
    return (
      <View style={lists.row}>
        <View style={lists.numberContainer}>
          <Text style={lists.number}>{playerNumber}</Text>
        </View>
        <View style={lists.info}>
          <Text style={lists.title} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>

          <View style={lists.metaRow}>
            <Text
              style={[lists.subtitle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.email}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <View style={[lists.badge, { backgroundColor: "#4ADE80" }]}>
              <Text style={lists.badgeTextDark}>{item.points} ОЧКОВ</Text>
            </View>
            <View style={[lists.badge, { backgroundColor: "#F59E0B" }]}>
              <Text style={lists.badgeTextDark}>
                {item.correct_predictions}/{item.total_predictions}
              </Text>
            </View>
          </View>
        </View>
        <View style={lists.actionsRow}>
          <TouchableOpacity
            style={lists.actionBtn}
            onPress={() => openEditPlayer(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={lists.actionBtn}
            onPress={() => deletePlayer(item.id)}
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
        <Text style={lists.sectionTitle}>УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</Text>
        <View style={lists.actionIcons}>
          <TouchableOpacity
            style={lists.iconButton}
            onPress={() => setShowAddPlayerModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={lists.iconButton}
            onPress={fetchPlayers}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {playersLoading ? (
        <View style={lists.loadingContainer}>
          <Text style={lists.loadingText}>Загрузка игроков...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedPlayers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={lists.listContent}
          />
          <Pagination />
        </>
      )}

      <Modal
        visible={showAddPlayerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddPlayerModal(false)}
      >
        <View style={forms.modalContainer}>
          <View style={forms.modalContent}>
            <View style={forms.modalHeader}>
              <Text style={forms.modalTitle}>НОВЫЙ ИГРОК</Text>
              <TouchableOpacity onPress={() => setShowAddPlayerModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={forms.inputLabel}>Имя *</Text>
            <TextInput
              style={forms.textInput}
              value={newPlayer.name}
              onChangeText={(t) => setNewPlayer((p) => ({ ...p, name: t }))}
              placeholder="Имя игрока"
              placeholderTextColor="#666"
            />

            <Text style={forms.inputLabel}>Email *</Text>
            <TextInput
              style={forms.textInput}
              value={newPlayer.email}
              onChangeText={(t) => setNewPlayer((p) => ({ ...p, email: t }))}
              placeholder="email@example.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={forms.inputLabel}>Пароль *</Text>
            <TextInput
              style={forms.textInput}
              value={newPlayer.password || ""}
              onChangeText={(t) => setNewPlayer((p) => ({ ...p, password: t }))}
              placeholder="Пароль игрока"
              placeholderTextColor="#666"
              secureTextEntry
            />

            <Text style={forms.inputLabel}>Роль</Text>
            <View style={forms.roleRow}>
              {["player", "admin"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    forms.roleBtn,
                    newPlayer.role === role && forms.roleBtnActive,
                  ]}
                  onPress={() => setNewPlayer((p) => ({ ...p, role }))}
                >
                  <Text
                    style={[
                      forms.roleBtnText,
                      newPlayer.role === role && forms.roleBtnTextActive,
                    ]}
                  >
                    {role === "player" ? "ИГРОК" : "АДМИН"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={forms.statsRow}>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Очки</Text>
                <TextInput
                  style={forms.statInput}
                  value={String(newPlayer.points)}
                  onChangeText={(t) =>
                    setNewPlayer((p) => ({ ...p, points: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Правильные</Text>
                <TextInput
                  style={forms.statInput}
                  value={String(newPlayer.correct_predictions)}
                  onChangeText={(t) =>
                    setNewPlayer((p) => ({ ...p, correct_predictions: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Всего</Text>
                <TextInput
                  style={forms.statInput}
                  value={String(newPlayer.total_predictions)}
                  onChangeText={(t) =>
                    setNewPlayer((p) => ({ ...p, total_predictions: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={forms.modalButtons}>
              <TouchableOpacity
                style={forms.cancelBtn}
                onPress={() => setShowAddPlayerModal(false)}
              >
                <Text style={forms.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={forms.saveBtn} onPress={createPlayer}>
                <Text style={forms.saveBtnText}>СОЗДАТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditPlayerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditPlayerModal(false)}
      >
        <View style={forms.modalContainer}>
          <View style={forms.modalContent}>
            <View style={forms.modalHeader}>
              <Text style={forms.modalTitle}>РЕДАКТИРОВАНИЕ ИГРОКА</Text>
              <TouchableOpacity onPress={() => setShowEditPlayerModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={forms.inputLabel}>Имя *</Text>
            <TextInput
              style={forms.textInput}
              value={editPlayerData.name || ""}
              onChangeText={(t) =>
                setEditPlayerData((p) => ({ ...p, name: t }))
              }
              placeholder="Имя игрока"
              placeholderTextColor="#666"
            />

            <Text style={forms.inputLabel}>Email *</Text>
            <TextInput
              style={forms.textInput}
              value={editPlayerData.email || ""}
              onChangeText={(t) =>
                setEditPlayerData((p) => ({ ...p, email: t }))
              }
              placeholder="email@example.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={forms.inputLabel}>Новый пароль (необязательно)</Text>
            <TextInput
              style={forms.textInput}
              value={editPlayerData.password || ""}
              onChangeText={(t) =>
                setEditPlayerData((p) => ({ ...p, password: t }))
              }
              placeholder="Оставьте пустым, чтобы не менять"
              placeholderTextColor="#666"
              secureTextEntry
            />

            <Text style={forms.inputLabel}>Роль</Text>
            <View style={forms.roleRow}>
              {["player", "admin"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    forms.roleBtn,
                    editPlayerData.role === role && forms.roleBtnActive,
                  ]}
                  onPress={() => setEditPlayerData((p) => ({ ...p, role }))}
                >
                  <Text
                    style={[
                      forms.roleBtnText,
                      editPlayerData.role === role && forms.roleBtnTextActive,
                    ]}
                  >
                    {role === "player" ? "ИГРОК" : "АДМИН"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={forms.statsRow}>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Очки</Text>
                <TextInput
                  style={forms.statInput}
                  value={editPlayerData.points || ""}
                  onChangeText={(t) =>
                    setEditPlayerData((p) => ({ ...p, points: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Правильные</Text>
                <TextInput
                  style={forms.statInput}
                  value={editPlayerData.correct_predictions || ""}
                  onChangeText={(t) =>
                    setEditPlayerData((p) => ({ ...p, correct_predictions: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={forms.statInputContainer}>
                <Text style={forms.inputLabel}>Всего</Text>
                <TextInput
                  style={forms.statInput}
                  value={editPlayerData.total_predictions || ""}
                  onChangeText={(t) =>
                    setEditPlayerData((p) => ({ ...p, total_predictions: t }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={forms.modalButtons}>
              <TouchableOpacity
                style={forms.cancelBtn}
                onPress={() => setShowEditPlayerModal(false)}
              >
                <Text style={forms.cancelBtnText}>ОТМЕНА</Text>
              </TouchableOpacity>
              <TouchableOpacity style={forms.saveBtn} onPress={updatePlayer}>
                <Text style={forms.saveBtnText}>СОХРАНИТЬ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
