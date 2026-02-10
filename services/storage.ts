
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { HistoryItem, Post } from '../types';

const HISTORY_COLLECTION = 'history';
const POSTS_COLLECTION = 'posts';

export const storageService = {
  // --- AI 작업 히스토리 관련 ---
  saveItem: async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
        ...item,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });
      return { ...item, id: docRef.id, timestamp: Date.now() } as HistoryItem;
    } catch (e) {
      console.error("Error adding history: ", e);
      throw e;
    }
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    try {
      const q = query(collection(db, HISTORY_COLLECTION), orderBy("timestamp", "desc"), limit(50));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
    } catch (e) {
      console.error("Error getting history: ", e);
      return [];
    }
  },

  deleteItem: async (id: string) => {
    await deleteDoc(doc(db, HISTORY_COLLECTION, id));
  },

  // --- 사용자 게시판(Posts) 관련 ---
  savePost: async (post: Omit<Post, 'id' | 'timestamp'>) => {
    try {
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...post,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });
      return { ...post, id: docRef.id, timestamp: Date.now() } as Post;
    } catch (e) {
      console.error("Error saving post: ", e);
      throw e;
    }
  },

  getPosts: async (): Promise<Post[]> => {
    try {
      const q = query(collection(db, POSTS_COLLECTION), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
    } catch (e) {
      console.error("Error getting posts: ", e);
      return [];
    }
  },

  deletePost: async (id: string) => {
    await deleteDoc(doc(db, POSTS_COLLECTION, id));
  }
};
