// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBhlSSOUVK19XPEiMB3IbifjRiOoxEGQo",
  authDomain: "brandpaint-784a0.firebaseapp.com",
  projectId: "brandpaint-784a0",
  storageBucket: "brandpaint-784a0.firebasestorage.app",
  messagingSenderId: "95796336272",
  appId: "1:95796336272:web:5b14f62bf621e6f015aa15",
  measurementId: "G-Q86CH40JVT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
function signOut() {
  return fbSignOut(auth);
}
function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

async function saveHistoryForUser(uid, payload) {
  if (!uid) return null;
  const col = collection(db, 'users', uid, 'history');
  const docRef = await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), 
    favorite: false
  });
  return docRef.id;
}


function subscribeHistory(uid, onUpdate) {
  if (!uid) return () => {};
  const col = collection(db, 'users', uid, 'history');

  return onSnapshot(col, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(items);
  });
}


async function toggleFavorite(uid, historyId, value) {
  if (!uid || !historyId) return;
  const ref = doc(db, 'users', uid, 'history', historyId);
  await updateDoc(ref, { favorite: value });
}

async function deleteHistoryItem(uid, historyId) {
  if (!uid || !historyId) return;
  const ref = doc(db, 'users', uid, 'history', historyId);
  await deleteDoc(ref);
}

async function fetchHistoryOnce(uid) {
  if (!uid) return [];
  const col = collection(db, 'users', uid, 'history');
  const q = query(col, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function updateHistoryForUser(uid, historyId, payload) {
  if (!uid || !historyId) return;
  const ref = doc(db, 'users', uid, 'history', historyId);
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp()
  });
}




export async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, 'users', uid, 'meta', 'profile'); 
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setUserProfile(uid, payload) {
  if (!uid) return;
  const ref = doc(db, 'users', uid, 'meta', 'profile');
  await setDoc(ref, payload, { merge: true });
}

export {
  auth, db,
  signup, login, signOut, onAuth,
  saveHistoryForUser, subscribeHistory, toggleFavorite, deleteHistoryItem, fetchHistoryOnce,
  updateHistoryForUser
};

