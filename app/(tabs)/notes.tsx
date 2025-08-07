
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
import { useNotes } from '../hooks/useNotes'; // adjust path if needed
import { supabase } from '../_lib/supabaseClient';
import { useEffect } from 'react';

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
    if (data?.user?.id) {
      setUserId(data.user.id);
    } else {
      console.warn('No user found or error fetching user:', error?.message);
    }
  };

  fetchUser();
}, []);

const { notes, addNote, updateNote, lastSync } = useNotes(userId);


  const handleAddNote = () => {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#c2b9d6' }]}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={28} color="black" />
      </TouchableOpacity>
      
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    backgroundColor: '#f9f9f9',
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
