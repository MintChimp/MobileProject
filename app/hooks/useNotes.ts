import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../_lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type Note = {
  id: string;
  title: string;
  desc: string;
};

export type QueueOp = {
  op: 'insert' | 'update' | 'delete';
  note: Note;
};

// Local storage keys

const STORAGE_KEY = '@offline_notes';
const QUEUE_KEY = '@offline_notes_queue';

export function useNotes(userId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [queue, setQueue] = useState<QueueOp[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadNotesFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      console.warn('Failed to parse offline notes');
    }
  };

  const loadQueueFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) setQueue(JSON.parse(raw));
    } catch {
      console.warn('Failed to parse offline queue');
    }
  };

  useEffect(() => {
    loadNotesFromStorage();
    loadQueueFromStorage();
  }, []);

  const saveNotesToStorage = useCallback(async (data: Note[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const saveQueueToStorage = useCallback(async (data: QueueOp[]) => {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(data));
  }, []);

  const enqueue = useCallback(
    async (item: QueueOp) => {
      setQueue(prev => {
        const updated = [...prev, item];
        saveQueueToStorage(updated);
        return updated;
      });
    },
    [saveQueueToStorage]
  );

  const drainQueue = useCallback(async () => {
    let nextQueue = [...queue];
        for (const { op, note } of queue) {
          try {
            if (op === 'insert') {
              const { error } = await supabase.from('notes').insert({
                id: note.id,
                title: note.title,
                desc: note.desc,
                user_id: userId,
              });
              if (!error) {
                nextQueue = nextQueue.filter(q => !(q.op === op && q.note.id === note.id));
              } else {
                console.warn('Insert failed:', error.message);
              }
            } else if (op === 'update') {
              const { error } = await supabase
                .from('notes')
                .update({ title: note.title, desc: note.desc })
                .eq('id', note.id)
                .eq('user_id', userId);
              if (!error) {
                nextQueue = nextQueue.filter(q => !(q.op === op && q.note.id === note.id));
              }
            } else if (op === 'delete') {
              const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', note.id)
                .eq('user_id', userId);
              if (!error) {
                nextQueue = nextQueue.filter(q => !(q.op === op && q.note.id === note.id));
              }
            }
          } catch (error: any) {
            console.warn('Sync op failed', op, note.id, error.message);
          }
        }
    if (nextQueue.length !== queue.length) {
      setQueue(nextQueue);
      await saveQueueToStorage(nextQueue);
    }
  }, [queue, saveQueueToStorage, userId]);
  
  const fetchNotesFromSupabase = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId);
    if (error) {
      console.warn('Supabase fetch error:', error.message);
    } else if (data) {
      setNotes(prev => {
        const localOnly = prev.filter(
          local => !data.some(remote => remote.id === local.id)
        );
        const merged = [...data, ...localOnly];
        saveNotesToStorage(merged);
        return merged;
      });
    }
  }, [userId, saveNotesToStorage]);

  const syncNotes = useCallback(async () => {
    const state = await NetInfo.fetch();
    const online = state.isConnected ?? false;
    setIsOnline(online);

    if (online) {
      await drainQueue();
      await fetchNotesFromSupabase();
      const now = new Date().toISOString();
      setLastSync(now);
    } else {
      await loadNotesFromStorage();
    }
  }, [drainQueue, fetchNotesFromSupabase]);

  const forceSync = useCallback(async () => {
    await drainQueue();
    await fetchNotesFromSupabase();
    const now = new Date().toISOString();
    setLastSync(now);
  }, [drainQueue, fetchNotesFromSupabase]);

  useEffect(() => {
    if (userId) syncNotes();
  }, [userId, syncNotes]);

  useEffect(() => {
    const onlineStatus = NetInfo.addEventListener(state => {
      if (state.isConnected) syncNotes();
    });
    return () => onlineStatus();
  }, [syncNotes]);

  const addNote = useCallback(
    async (title: string, desc: string) => {
      const newNote: Note = { id: uuidv4(), title, desc };
      const updated = [...notes, newNote];
      setNotes(updated);
      await saveNotesToStorage(updated);
      enqueue({ op: 'insert', note: newNote });
    },
    [notes, enqueue, saveNotesToStorage]
  );

  const updateNote = useCallback(
    async (id: string, newDesc: string) => {
      const updated = notes.map(n => n.id === id ? { ...n, desc: newDesc } : n);
      setNotes(updated);
      await saveNotesToStorage(updated);
      const note = updated.find(n => n.id === id)!;
      enqueue({ op: 'update', note });
    },
    [notes, enqueue, saveNotesToStorage]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      await saveNotesToStorage(updated);
      const note = notes.find(n => n.id === id);
      if (note) enqueue({ op: 'delete', note });
    },
    [notes, enqueue, saveNotesToStorage]
  );

  return { notes, isOnline, queue, addNote, updateNote, deleteNote, syncNotes, forceSync, lastSync };
}