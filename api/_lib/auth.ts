import {firebaseConfiguration} from './firebaseConfig.js';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// The modular Firebase Admin API avoids CommonJS namespace interop errors on Node.js 24.
const app = getApps()[0] ?? initializeApp({
  projectId: firebaseConfiguration().projectId,
  credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    : applicationDefault(),
});

export const db = getFirestore(app);

export async function verifyAuth(authHeader: string | undefined): Promise<DecodedIdToken> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.slice('Bearer '.length);
  return getAuth(app).verifyIdToken(token);
}
