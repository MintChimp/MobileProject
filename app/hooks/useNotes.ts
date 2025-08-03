
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../_lib/supabaseClient';
import { Alert } from 'react-native';

export type Note = {
  id: string;
  title: string;
  desc: string;
};

const STORAGE_KEY = '@offline_notes';

export function useNotes(userId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const loadNotesFromStorage = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setNotes(JSON.parse(raw));
      } catch {
        console.warn('Failed to parse offline notes');
      }
    }
  };

  const saveNotesToStorage = async (data: Note[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const fetchNotesFromSupabase = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase fetch error:', error.message);
    } else {
      setNotes(data);
      await saveNotesToStorage(data);
    }
  };

  const syncNotes = async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected ?? true);

    if (state.isConnected) {
      await fetchNotesFromSupabase();
    } else {
      await loadNotesFromStorage();
    }
  };

  const addNote = async (title: string, desc: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      desc,
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    await saveNotesToStorage(updatedNotes);

    if (isOnline && userId) {
      const { error } = await supabase.from('notes').insert({
        id: newNote.id,
        title,
        desc,
        user_id: userId,
      });

      if (error) {
        Alert.alert('Sync failed', error.message);
      }
    }
  };

  const updateNote = async (id: string, newDesc: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, desc: newDesc } : note
    );
    setNotes(updatedNotes);
    await saveNotesToStorage(updatedNotes);

    if (isOnline && userId) {
      const { error } = await supabase
        .from('notes')
        .update({ desc: newDesc })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        Alert.alert('Update failed', error.message);
      }
    }
  };

  useEffect(() => {
    syncNotes();
  }, [userId]);

  return {
    notes,
    addNote,
    updateNote,
    refreshNotes: syncNotes,
  };
}
