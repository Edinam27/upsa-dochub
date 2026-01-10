
const DB_NAME = 'upsa-dochub-store';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export interface StoredFile {
  id: string;
  file: File;
  options: any;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveFileToStore = async (file: File, options: any): Promise<string> => {
  const db = await openDB();
  const id = crypto.randomUUID();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({
      id,
      file,
      options,
      timestamp: Date.now()
    });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

export const getFileFromStore = async (id: string): Promise<StoredFile | undefined> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearFileStore = async (id: string): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
