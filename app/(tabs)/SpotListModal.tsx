import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SpotListModal({ visible, onClose, spots }: any) {
  const renderItem = ({ item }: any) => (
    <View style={styles.spotCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>★</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.spotTitle}>{item.title}</Text>
          <Text style={styles.spotDesc} numberOfLines={1}>{item.description}</Text>
        </View>
        <View style={styles.starRow}>
          <Text style={styles.starText}>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</Text>
        </View>
      </View>
      
      <View style={styles.tagRow}>
        {item.tags?.map((tag: string) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.dateText}>{item.createdAt?.toDate().toLocaleDateString() || "2026年1月5日"}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>我的避難所清單</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
          </View>
          <FlatList
            data={spots}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListEmptyComponent={<Text style={styles.emptyText}>還沒有新增任何避難所喔...</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#F8F9FA', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.85, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontFamily: 'Zen' },
  spotCard: { backgroundColor: 'white', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#FFB74D', justifyContent: 'center', alignItems: 'center' },
  iconText: { color: 'white', fontSize: 20, fontFamily: 'Zen' },
  spotTitle: { fontSize: 17,  color: '#333', fontFamily: 'Zen' },
  spotDesc: { fontSize: 13, color: '#888', marginTop: 2, fontFamily: 'Zen' },
  starRow: { alignItems: 'flex-end' },
  starText: { color: '#FFB74D', fontSize: 12 },
  tagRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  tagBadge: { backgroundColor: '#E0F2F1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: '#00A896', fontSize: 12, fontFamily: 'Zen' },
  dateText: { fontSize: 12, color: '#BBB', marginTop: 10, fontFamily: 'Caveat' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});