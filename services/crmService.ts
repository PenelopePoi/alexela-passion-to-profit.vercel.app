/**
 * CRM Service — XELA Creative Branding Studio
 *
 * Firestore CRUD for client contacts, deals, activities, and documents.
 * Supports optional client-side encryption for sensitive contact data.
 * Uses existing Firebase infrastructure — zero new dependencies.
 */

import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, getDocs,
  serverTimestamp, Timestamp, onSnapshot, Unsubscribe
} from '@firebase/firestore';
import { getClientKey, encryptData, decryptData, isEncryptionEnabled } from './clientEncryption';
import {
  ClientContact, Deal, Activity, ClientDocument,
  ClientStatus, DealStage, ActivityType, PipelineMetrics, CRMFilters
} from '../types/crm';

// ─── Collections ────────────────────────────────────────────────────────────

const CLIENTS_COL = 'crm_clients';
const DEALS_COL = 'crm_deals';
const ACTIVITIES_COL = 'crm_activities';
const DOCS_COL = 'crm_documents';

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => auth.currentUser?.uid;

const now = () => Date.now();

const genId = () => crypto.randomUUID();

// ─── Client CRUD ────────────────────────────────────────────────────────────

export const createClient = async (client: Omit<ClientContact, 'id' | 'createdAt' | 'updatedAt' | 'encrypted'>): Promise<ClientContact> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');

  const id = genId();
  const record: ClientContact = {
    ...client,
    id,
    createdAt: now(),
    updatedAt: now(),
    encrypted: false,
  };

  let firestoreData: any = { ...record, uid: userId };

  if (isEncryptionEnabled()) {
    const key = await getClientKey(false);
    if (key) {
      const sensitiveFields = {
        email: record.email,
        phone: record.phone,
        address: record.address,
        notes: record.notes,
        socialLinks: record.socialLinks,
      };
      firestoreData.encryptedFields = await encryptData(sensitiveFields, key);
      firestoreData.email = '***encrypted***';
      firestoreData.phone = '***encrypted***';
      firestoreData.address = '***encrypted***';
      firestoreData.notes = '***encrypted***';
      firestoreData.socialLinks = {};
      firestoreData.encrypted = true;
      record.encrypted = true;
    }
  }

  try {
    await setDoc(doc(db, CLIENTS_COL, id), firestoreData);
    return record;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, `${CLIENTS_COL}/${id}`);
    throw e;
  }
};

export const getClient = async (id: string): Promise<ClientContact | null> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  try {
    const snap = await getDoc(doc(db, CLIENTS_COL, id));
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    if (data.uid !== userId) throw new Error('Not authorized');

    if (data.encrypted && data.encryptedFields) {
      const key = await getClientKey(false);
      if (key) {
        const decrypted = await decryptData(data.encryptedFields, key);
        Object.assign(data, decrypted);
      }
    }

    delete data.uid;
    delete data.encryptedFields;
    return data as ClientContact;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `${CLIENTS_COL}/${id}`);
    return null;
  }
};

export const updateClient = async (id: string, updates: Partial<ClientContact>): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');

  const updateData: any = { ...updates, updatedAt: now() };

  if (isEncryptionEnabled()) {
    const key = await getClientKey(false);
    if (key) {
      const sensitiveKeys = ['email', 'phone', 'address', 'notes', 'socialLinks'];
      const sensitiveUpdates: Record<string, any> = {};
      for (const k of sensitiveKeys) {
        if (k in updateData) {
          sensitiveUpdates[k] = updateData[k];
          updateData[k] = '***encrypted***';
        }
      }
      if (Object.keys(sensitiveUpdates).length > 0) {
        updateData.encryptedFields = await encryptData(sensitiveUpdates, key);
        updateData.encrypted = true;
      }
    }
  }

  try {
    await updateDoc(doc(db, CLIENTS_COL, id), updateData);
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `${CLIENTS_COL}/${id}`);
    throw e;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  // Verify ownership before delete
  const snap = await getDoc(doc(db, CLIENTS_COL, id));
  if (!snap.exists() || (snap.data() as any).uid !== userId) throw new Error('Not authorized');
  try {
    await deleteDoc(doc(db, CLIENTS_COL, id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${CLIENTS_COL}/${id}`);
    throw e;
  }
};

export const listClients = async (filters?: CRMFilters): Promise<ClientContact[]> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');

  try {
    const q = query(collection(db, CLIENTS_COL), where('uid', '==', userId));
    const snap = await getDocs(q);
    let clients: ClientContact[] = [];

    const key = isEncryptionEnabled() ? await getClientKey(false) : null;

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as any;
      if (data.encrypted && data.encryptedFields && key) {
        const decrypted = await decryptData(data.encryptedFields, key);
        Object.assign(data, decrypted);
      }
      delete data.uid;
      delete data.encryptedFields;
      clients.push(data as ClientContact);
    }

    if (filters) {
      if (filters.status !== 'all') {
        clients = clients.filter(c => c.status === filters.status);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        clients = clients.filter(c =>
          c.firstName.toLowerCase().includes(s) ||
          c.lastName.toLowerCase().includes(s) ||
          c.companyName.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s)
        );
      }
      if (filters.tags.length > 0) {
        clients = clients.filter(c => filters.tags.some(t => c.tags.includes(t)));
      }
      clients.sort((a, b) => {
        const dir = filters.sortDir === 'asc' ? 1 : -1;
        switch (filters.sortBy) {
          case 'name': return dir * a.firstName.localeCompare(b.firstName);
          case 'revenue': return dir * (a.totalRevenue - b.totalRevenue);
          case 'lastContact': return dir * ((a.lastContactedAt || 0) - (b.lastContactedAt || 0));
          case 'created': return dir * (a.createdAt - b.createdAt);
          default: return 0;
        }
      });
    }

    return clients;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, CLIENTS_COL);
    return [];
  }
};

// ─── Deal CRUD ──────────────────────────────────────────────────────────────

export const createDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const id = genId();
  const record: Deal = { ...deal, id, createdAt: now(), updatedAt: now() };
  await setDoc(doc(db, DEALS_COL, id), { ...record, uid: userId });
  return record;
};

export const updateDeal = async (id: string, updates: Partial<Deal>): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  // Verify ownership before update
  const snap = await getDoc(doc(db, DEALS_COL, id));
  if (!snap.exists() || (snap.data() as any).uid !== userId) throw new Error('Not authorized');
  await updateDoc(doc(db, DEALS_COL, id), { ...updates, updatedAt: now() });
};

export const listDeals = async (clientId?: string): Promise<Deal[]> => {
  const userId = uid();
  if (!userId) return [];
  const constraints = [where('uid', '==', userId)];
  if (clientId) constraints.push(where('clientId', '==', clientId));
  const q = query(collection(db, DEALS_COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => { const data = d.data(); delete (data as any).uid; return data as Deal; });
};

export const deleteDeal = async (id: string): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const snap = await getDoc(doc(db, DEALS_COL, id));
  if (!snap.exists() || (snap.data() as any).uid !== userId) throw new Error('Not authorized');
  await deleteDoc(doc(db, DEALS_COL, id));
};

// ─── Activity CRUD ──────────────────────────────────────────────────────────

export const createActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'createdBy'>): Promise<Activity> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const id = genId();
  const record: Activity = { ...activity, id, createdAt: now(), createdBy: userId };
  await setDoc(doc(db, ACTIVITIES_COL, id), { ...record, uid: userId });
  return record;
};

export const listActivities = async (clientId: string): Promise<Activity[]> => {
  const userId = uid();
  if (!userId) return [];
  const q = query(collection(db, ACTIVITIES_COL), where('uid', '==', userId), where('clientId', '==', clientId));
  const snap = await getDocs(q);
  return snap.docs.map(d => { const data = d.data(); delete (data as any).uid; return data as Activity; })
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteActivity = async (id: string): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const snap = await getDoc(doc(db, ACTIVITIES_COL, id));
  if (!snap.exists() || (snap.data() as any).uid !== userId) throw new Error('Not authorized');
  await deleteDoc(doc(db, ACTIVITIES_COL, id));
};

// ─── Document CRUD ──────────────────────────────────────────────────────────

export const createDocument = async (document: Omit<ClientDocument, 'id' | 'createdAt'>): Promise<ClientDocument> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const id = genId();
  const record: ClientDocument = { ...document, id, createdAt: now() };
  await setDoc(doc(db, DOCS_COL, id), { ...record, uid: userId });
  return record;
};

export const listDocuments = async (clientId: string): Promise<ClientDocument[]> => {
  const userId = uid();
  if (!userId) return [];
  const q = query(collection(db, DOCS_COL), where('uid', '==', userId), where('clientId', '==', clientId));
  const snap = await getDocs(q);
  return snap.docs.map(d => { const data = d.data(); delete (data as any).uid; return data as ClientDocument; })
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteDocument = async (id: string): Promise<void> => {
  const userId = uid();
  if (!userId) throw new Error('Not authenticated');
  const snap = await getDoc(doc(db, DOCS_COL, id));
  if (!snap.exists() || (snap.data() as any).uid !== userId) throw new Error('Not authorized');
  await deleteDoc(doc(db, DOCS_COL, id));
};

// ─── Pipeline Metrics ───────────────────────────────────────────────────────

export const calculatePipelineMetrics = (clients: ClientContact[], deals: Deal[]): PipelineMetrics => {
  const totalLeads = clients.filter(c => c.status === ClientStatus.LEAD || c.status === ClientStatus.PROSPECT).length;
  const totalActive = clients.filter(c => c.status === ClientStatus.ACTIVE || c.status === ClientStatus.VIP).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const wonDeals = deals.filter(d => d.stage === DealStage.CLOSED_WON);
  const lostDeals = deals.filter(d => d.stage === DealStage.CLOSED_LOST);
  const closedDeals = wonDeals.length + lostDeals.length;
  const avgDealValue = wonDeals.length > 0 ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length : 0;
  const conversionRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;
  const openDeals = deals.filter(d => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST);
  const pipelineValue = openDeals.reduce((s, d) => s + (d.value * d.probability / 100), 0);
  const overdueFollowUps = clients.filter(c => c.nextFollowUp && c.nextFollowUp < now()).length;

  return {
    totalLeads,
    totalActive,
    totalRevenue,
    avgDealValue: Math.round(avgDealValue),
    conversionRate: Math.round(conversionRate * 10) / 10,
    pipelineValue: Math.round(pipelineValue),
    monthlyRecurring: 0, // Would come from subscription data
    overdueFollowUps,
  };
};

// ─── Real-time Subscription ─────────────────────────────────────────────────

export const subscribeToClients = (callback: (clients: ClientContact[]) => void): Unsubscribe => {
  const userId = uid();
  if (!userId) return () => {};
  const q = query(collection(db, CLIENTS_COL), where('uid', '==', userId));
  return onSnapshot(q, async (snap) => {
    const key = isEncryptionEnabled() ? await getClientKey(false) : null;
    const clients: ClientContact[] = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as any;
      if (data.encrypted && data.encryptedFields && key) {
        const decrypted = await decryptData(data.encryptedFields, key);
        Object.assign(data, decrypted);
      }
      delete data.uid;
      delete data.encryptedFields;
      clients.push(data as ClientContact);
    }
    callback(clients);
  });
};
