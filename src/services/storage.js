// Persiste en localStorage pero expuesto como window.storage
const NAMESPACE = 'linkedin_app';

function read() {
  try {
    const raw = localStorage.getItem(NAMESPACE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(NAMESPACE, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

const storage = {
  get(key) {
    return read()[key];
  },
  set(key, value) {
    const data = read();
    data[key] = value;
    write(data);
  },
  remove(key) {
    const data = read();
    delete data[key];
    write(data);
  },
  getAll() {
    return read();
  },
  clear() {
    localStorage.removeItem(NAMESPACE);
  },
};

if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;
