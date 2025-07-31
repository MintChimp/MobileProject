import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  type Note = {
    id: string;
    title: string;
    desc: string;
  };

  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDesc, setNewNoteDesc] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editedDesc, setEditedDesc] = useState('');

  const addNote = () => {
    if (!newNoteTitle) {
      Alert.alert('Note title required');
      return;
    }
    setNotes([
      ...notes,
      { id: Date.now().toString(), title: newNoteTitle, desc: newNoteDesc },
    ]);
    setNewNoteTitle('');
    setNewNoteDesc('');
    setModalVisible(false);
  };

  const openNote = (note: Note) => {
    setActiveNote(note);
    setEditedDesc(note.desc);
    setEditModalVisible(true);
  };

  const saveEditedNote = () => {
    if (!activeNote) return;
    const updatedNotes = notes.map((note) =>
      note.id === activeNote.id ? { ...note, desc: editedDesc } : note
    );
    setNotes(updatedNotes);
    setEditModalVisible(false);
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity style={styles.noteBox} onPress={() => openNote(item)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.noteDesc}>{item.desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#c2b9d6' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notebooks</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.footer}>
        <Ionicons name="home-outline" size={24} />
        <Ionicons name="document-text-outline" size={24} />
        <Ionicons name="school-outline" size={24} />
        <Ionicons name="person-outline" size={24} />
      </View>

      {/* New Note Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Course Title"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              placeholder="Extra note on course"
              value={newNoteDesc}
              onChangeText={setNewNoteDesc}
            />
            <TouchableOpacity style={styles.addButton} onPress={addNote}>
              <Text style={styles.addButtonText}>Add Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Note Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '60%' }]}>
            <Text style={styles.headerTitle}>{activeNote?.title}</Text>
            <ScrollView>
              <TextInput
                style={[styles.input, { height: 200 }]}
                multiline
                value={editedDesc}
                onChangeText={setEditedDesc}
              />
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={saveEditedNote}>
              <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#9d93b5',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  noteBox: {
    margin: 12,
    padding: 16,
    backgroundColor: '#c2b9d6',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#000',
  },
  noteTitle: { fontWeight: 'bold', marginBottom: 4 },
  noteDesc: { color: '#444' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    backgroundColor: '#9d93b5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9'
  },
  addButton: {
    backgroundColor: '#6b5f84',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});