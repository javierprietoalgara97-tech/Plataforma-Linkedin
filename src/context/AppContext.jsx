import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import storage from '../services/storage';
import { buildSamplePosts, defaultCategories, sampleNews, defaultSettings } from '../data/sampleData';
import { fetchPosts, upsertPost, deletePostFromSupabase } from '../services/supabase';

const AppContext = createContext(null);

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function AppProvider({ children }) {
  const [section, setSection] = useState('dashboard');
  const [chatContext, setChatContext] = useState(null); // {type:'news'|'similar', data}

  // Inicializar datos si es la primera vez
  useEffect(() => {
    if (!storage.get('initialized')) {
      const cats = defaultCategories.map(c => ({ ...c, id: genId() }));
      storage.set('categories', cats);
      storage.set('posts', []);
      storage.set('settings', defaultSettings);
      storage.set('initialized', true);
    }
  }, []);

  // ── POSTS ──────────────────────────────────────────────
  const [posts, setPosts] = useState(() => storage.get('posts') || []);

  // Carga posts desde Supabase al iniciar
  useEffect(() => {
    fetchPosts().then(remotePosts => {
      if (remotePosts && remotePosts.length > 0) {
        storage.set('posts', remotePosts);
        setPosts(remotePosts);
      }
    }).catch(() => {});
  }, []);

  const savePosts = useCallback((newPosts) => {
    storage.set('posts', newPosts);
    setPosts(newPosts);
  }, []);

  const addPost = useCallback((post) => {
    const newPost = { ...post, id: genId(), actualizadoEn: new Date().toISOString() };
    savePosts([...posts, newPost]);
    upsertPost(newPost).catch(() => {});
    return newPost;
  }, [posts, savePosts]);

  const updatePost = useCallback((id, changes) => {
    const updated = posts.map(p => p.id === id
      ? { ...p, ...changes, actualizadoEn: new Date().toISOString() }
      : p
    );
    savePosts(updated);
    const updatedPost = updated.find(p => p.id === id);
    if (updatedPost) upsertPost(updatedPost).catch(() => {});
  }, [posts, savePosts]);

  const deletePost = useCallback((id) => {
    savePosts(posts.filter(p => p.id !== id));
    deletePostFromSupabase(id).catch(() => {});
  }, [posts, savePosts]);

  // ── CATEGORIES ─────────────────────────────────────────
  const [categories, setCategories] = useState(() => storage.get('categories') || defaultCategories);

  const saveCategories = useCallback((cats) => {
    storage.set('categories', cats);
    setCategories(cats);
  }, []);

  const addCategory = useCallback((cat) => {
    const newCat = { ...cat, id: genId() };
    saveCategories([...categories, newCat]);
    return newCat;
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id, changes) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, ...changes } : c));
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id) => {
    saveCategories(categories.filter(c => c.id !== id));
  }, [categories, saveCategories]);

  // ── SETTINGS ───────────────────────────────────────────
  const [settings, setSettings] = useState(() => storage.get('settings') || defaultSettings);

  const updateSettings = useCallback((changes) => {
    const updated = { ...settings, ...changes };
    storage.set('settings', updated);
    setSettings(updated);
  }, [settings]);

  // ── NAVIGATION ─────────────────────────────────────────
  const navigateTo = useCallback((sec, ctx = null) => {
    setChatContext(ctx);
    setSection(sec);
  }, []);

  const value = {
    section, navigateTo,
    chatContext, setChatContext,
    posts, addPost, updatePost, deletePost,
    categories, addCategory, updateCategory, deleteCategory,
    settings, updateSettings,
    genId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
