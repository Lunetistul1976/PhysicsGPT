interface StoredPdf {
  id: number;
  filename: string;
  date: string;
  query: string;
  pdfData: Blob;
}

const DB_NAME = "DeepResearchDB";
const DB_VERSION = 1;
const STORE_NAME = "pdfs";

export const initDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject("Error opening IndexedDB");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("dateIndex", "date", { unique: false });
      }
    };
  });
};

export const savePdf = async (pdfData: {
  pdfBlob: Blob;
  filename: string;
  query: string;
}): Promise<number> => {
  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const pdf: Omit<StoredPdf, "id"> = {
      filename: pdfData.filename,
      date: new Date().toISOString(),
      query: pdfData.query,
      pdfData: pdfData.pdfBlob,
    };

    const request = store.add(pdf);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject("Error saving PDF to IndexedDB");
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getAllPdfs = async (): Promise<StoredPdf[]> => {
  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error getting PDFs from IndexedDB");
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getPdfById = async (id: number): Promise<StoredPdf> => {
  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(`PDF with id ${id} not found`);
      }
    };

    request.onerror = () => {
      reject("Error getting PDF from IndexedDB");
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const deletePdf = async (id: number): Promise<void> => {
  const db = await initDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Error deleting PDF from IndexedDB");
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};
