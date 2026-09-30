import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON_PATH = path.join(__dirname, 'db.json');

// Detection logic
let firebaseConfig: any = null;
let useFirebase = false;

// 1. Check local file
const localConfigPath = path.join(__dirname, 'firebase-applet-config.json');
if (fs.existsSync(localConfigPath)) {
  try {
    const raw = fs.readFileSync(localConfigPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.projectId && parsed.apiKey) {
      firebaseConfig = parsed;
    }
  } catch (e) {
    console.warn("Could not read local firebase config file:", e);
  }
}

// 2. Check process.env.FIREBASE_CONFIG or individual process.env keys (Vercel/Production)
if (process.env.FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (e) {
    console.warn("Could not parse process.env.FIREBASE_CONFIG:", e);
  }
} else if (process.env.FIREBASE_PROJECT_ID) {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };
}

let dbInstance: any = null;

if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    useFirebase = true;
    console.log(`🚀 DATABASE CONNECTED: Firebase Firestore successfully initialized (Project: ${firebaseConfig.projectId})`);
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Firestore, falling back to local storage:", error);
  }
}

if (!useFirebase) {
  console.warn("\n==========================================================");
  console.warn("⚠️ DATABASE: NOT PRODUCTION CONFIGURED warning");
  console.warn("Falling back to local db.json storage engine.");
  console.warn("==========================================================\n");
}

function readDbJson(): any {
  try {
    if (fs.existsSync(DB_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading db.json:", e);
  }
  return { contracts: {}, deals: {}, invoices: {}, users: {} };
}

function writeDbJson(data: any) {
  try {
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}

export async function getCollection(collectionName: string): Promise<any[]> {
  if (useFirebase && dbInstance) {
    try {
      const colRef = collection(dbInstance, collectionName);
      const snapshot = await getDocs(colRef);
      const results: any[] = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error(`Error listing collection ${collectionName} from firestore:`, error);
    }
  }
  
  const local = readDbJson();
  const collectionDict = local[collectionName] || {};
  return Object.keys(collectionDict).map(key => ({ id: key, ...collectionDict[key] }));
}

export async function getDocument(collectionName: string, id: string): Promise<any | null> {
  if (useFirebase && dbInstance) {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from firestore:`, error);
    }
  }

  const local = readDbJson();
  const collectionDict = local[collectionName] || {};
  return collectionDict[id] ? { id, ...collectionDict[id] } : null;
}

export async function setDocument(collectionName: string, id: string, data: any): Promise<void> {
  if (useFirebase && dbInstance) {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      const cleanData = { ...data };
      delete cleanData.id;
      await setDoc(docRef, cleanData);
      return;
    } catch (error) {
      console.error(`Error writing document ${id} to firestore:`, error);
    }
  }

  const local = readDbJson();
  local[collectionName] = local[collectionName] || {};
  const cleanData = { ...data };
  delete cleanData.id;
  local[collectionName][id] = cleanData;
  writeDbJson(local);
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (useFirebase && dbInstance) {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      console.error(`Error deleting document ${id} from firestore:`, error);
    }
  }

  const local = readDbJson();
  if (local[collectionName] && local[collectionName][id]) {
    delete local[collectionName][id];
    writeDbJson(local);
  }
}

export function isDatabaseConfigured(): boolean {
  return useFirebase;
}
