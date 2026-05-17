import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Task, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const taskService = {
  subscribeToTasks: (userId: string, callback: (tasks: Task[]) => void) => {
    const path = 'tasks';
    const q = query(
      collection(db, path), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  createTask: async (task: Omit<Task, 'id'>) => {
    const path = 'tasks';
    try {
      return await addDoc(collection(db, path), {
        ...task,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const path = `tasks/${taskId}`;
    try {
      const docRef = doc(db, 'tasks', taskId);
      return await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteTask: async (taskId: string) => {
    const path = `tasks/${taskId}`;
    try {
      const docRef = doc(db, 'tasks', taskId);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
