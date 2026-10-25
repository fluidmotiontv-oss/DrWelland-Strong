import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function syncBiometricLog(userId: string, biometrics: any, report: any, journal?: any): Promise<void> {
  const logId = `bio_${Date.now()}`;
  const logRef = doc(db, 'users', userId, 'biometricLogs', logId);
  await setDoc(logRef, {
    logId,
    ownerId: userId,
    heartRate: biometrics.heartRate,
    hrv: biometrics.hrv,
    neuralCoherence: biometrics.neuralCoherence,
    cellularVitality: biometrics.cellularVitality,
    stressIndex: biometrics.stressIndex,
    triageLevel: report?.triageLevel || 'OPTIMAL',
    overallVitality: report?.overallVitality || 90,
    timestamp: new Date().toISOString(),
    journal: journal || null,
  });
}

export async function fetchCloudBiometricLogs(userId: string): Promise<any[]> {
  const logsRef = collection(db, 'users', userId, 'biometricLogs');
  const q = query(logsRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}
