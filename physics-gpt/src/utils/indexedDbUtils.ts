const DB_NAME = "ResearchHistoryDB";
const STORE_NAME = "researchHistory";
const DB_VERSION = 1;

export interface HistoryRecord {
  title: string; // Primary key
  docId: string;
  timestamp: number;
}

let db: IDBDatabase | null = null;

// Function to initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject("Error opening IndexedDB");
    };

    request.onsuccess = (event) => {
      db = request.result;
      console.log("IndexedDB initialized successfully.");
      resolve(db);
    };

    // This event only executes if the version changes
    // or the database is created for the first time.
    request.onupgradeneeded = (event) => {
      const tempDb = request.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        // Use 'title' as the key path (primary key)
        tempDb.createObjectStore(STORE_NAME, { keyPath: "title" });
        console.log("IndexedDB object store created.");
      }
    };
  });
};

export const addOrUpdateHistory = async (
  record: HistoryRecord
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentDb = await initDB();
      const transaction = currentDb.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => {
        console.log("History record saved:", record);
        resolve();
      };

      request.onerror = () => {
        console.error("Error saving history record:", request.error);
        reject("Error saving record");
      };

      transaction.oncomplete = () => {
        // Optional: Transaction completed
      };

      transaction.onerror = () => {
        console.error("Transaction error:", transaction.error);
        reject("Transaction error");
      };
    } catch (error) {
      console.error("Failed to initiate DB transaction:", error);
      reject(error);
    }
  });
};

// Function to get all history records, sorted by timestamp descending
export const getAllHistory = async (): Promise<HistoryRecord[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentDb = await initDB();
      const transaction = currentDb.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp descending before resolving
        const sortedResults = request.result.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        resolve(sortedResults);
      };

      request.onerror = () => {
        console.error("Error fetching all history:", request.error);
        reject("Error fetching history");
      };
    } catch (error) {
      console.error("Failed to initiate DB transaction:", error);
      reject(error);
    }
  });
};

// Function to get a specific record by title (if needed later)
export const getHistoryByTitle = async (
  title: string
): Promise<HistoryRecord | undefined> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentDb = await initDB();
      const transaction = currentDb.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(title);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error fetching record by title:", request.error);
        reject("Error fetching record");
      };
    } catch (error) {
      console.error("Failed to initiate DB transaction:", error);
      reject(error);
    }
  });
};

// Initialize DB on load (optional, can also be lazy)
initDB().catch((err) => console.error("Initial DB init failed:", err));
