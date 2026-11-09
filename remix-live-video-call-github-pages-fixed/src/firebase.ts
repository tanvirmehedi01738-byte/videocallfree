import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CallConfig, DEFAULT_CALL_CONFIG } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  const testPath = 'settings/call_config';
  try {
    await getDocFromServer(doc(db, 'settings', 'call_config'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
    return false;
  }
}

export function subscribeToCallConfig(
  onUpdate: (config: CallConfig) => void,
  onError?: (err: Error) => void
) {
  const configDocRef = doc(db, 'settings', 'call_config');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as CallConfig;
        onUpdate({
          profileName: data.profileName || DEFAULT_CALL_CONFIG.profileName,
          profileImage: data.profileImage || DEFAULT_CALL_CONFIG.profileImage,
          adsterraLink: data.adsterraLink || DEFAULT_CALL_CONFIG.adsterraLink,
          headerBannerCode: data.headerBannerCode ?? '',
          socialBarCode: data.socialBarCode ?? '',
          popunderCode: data.popunderCode ?? '',
          inFeedBannerCode: data.inFeedBannerCode ?? '',
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      } else {
        // Document does not exist yet in Firestore
        onUpdate(DEFAULT_CALL_CONFIG);
      }
    },
    (err) => {
      console.warn('Snapshot subscription note:', err);
      if (onError) {
        onError(err);
      }
      try {
        handleFirestoreError(err, OperationType.GET, 'settings/call_config');
      } catch (formattedErr) {
        console.error(formattedErr);
      }
    }
  );
}

export async function saveCallConfig(config: CallConfig): Promise<void> {
  const path = 'settings/call_config';
  try {
    const configDocRef = doc(db, 'settings', 'call_config');
    await setDoc(
      configDocRef,
      {
        profileName: config.profileName.trim(),
        profileImage: config.profileImage.trim(),
        adsterraLink: config.adsterraLink.trim(),
        headerBannerCode: (config.headerBannerCode || '').trim(),
        socialBarCode: (config.socialBarCode || '').trim(),
        popunderCode: (config.popunderCode || '').trim(),
        inFeedBannerCode: (config.inFeedBannerCode || '').trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'admin',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getCallConfigOnce(): Promise<CallConfig> {
  const path = 'settings/call_config';
  try {
    const configDocRef = doc(db, 'settings', 'call_config');
    const snapshot = await getDoc(configDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as CallConfig;
    }
    return DEFAULT_CALL_CONFIG;
  } catch (error) {
    console.warn('Falling back to default config:', error);
    return DEFAULT_CALL_CONFIG;
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-in failed:', err);
    throw err;
  }
}

export async function logoutAdmin() {
  await signOut(auth);
}
