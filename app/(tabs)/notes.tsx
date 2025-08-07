import React, { useState, useEffect } from 'react';
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
import { supabase } from '../_lib/supabaseClient';
import { useNotes } from '../hooks/useNotes';

export default function NotesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDesc, setNewNoteDesc] = useState('');
  const [activeNote, setActiveNote] = useState<any>(null);
  const [editedDesc, setEditedDesc] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (user?.id) {
        console.log('✅ Authenticated user ID:', user.id);
        setUserId(user.id);
      } else {
        console.warn('❌ No user found or user is not authenticated');
      }
    };

    fetchUser();
  }, []);

  const notesHook = useNotes(userId);
  const { notes, addNote, updateNote, deleteNote, forceSync, lastSync } = notesHook || {};

  const handleAddNote = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }
    if (!newNoteTitle) {
      Alert.alert('Note title required');
      return;
    }
    addNote(newNoteTitle, newNoteDesc);
    setNewNoteTitle('');
    setNewNoteDesc('');
    setModalVisible(false);
  };

  const openNote = (note: any) => {
    setActiveNote(note);
    setEditedDesc(note.desc);
    setEditModalVisible(true);
  };

  const saveEditedNote = () => {
    if (!activeNote) return;
    updateNote(activeNote.id, editedDesc);
    setEditModalVisible(false);
  };

  const renderNote = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.noteBox} onPress={() => openNote(item)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.noteDesc}>{item.desc}</Text>
    </TouchableOpacity>
  );

  if (!notesHook) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>Loading notes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#c2b9d6' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={forceSync} style={{ padding: 10, alignSelf: 'flex-end', backgroundColor: '#6b5f84', borderRadius: 6, maxWidth: 300 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>🔁 Force Sync</Text>
        </TouchableOpacity>
      </View>
      {lastSync && (
        <Text style={styles.syncText}>
          Last synced at {new Date(lastSync).toLocaleTimeString()}
        </Text>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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
            <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
              <Text style={styles.addButtonText}>Add Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.addButton} onPress={saveEditedNote}>
                <Text style={styles.addButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.deleteButton]}
                onPress={()=> {
                deleteNote(activeNote.id);
                setEditModalVisible(false);
              }}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: '#6b5f84',  // purple accent fits the theme
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: { flex: 1 },
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '(0,0,0,0.3)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#ffffffff',
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#6b5f84',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  syncText: {
    textAlign: 'right',
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
});
