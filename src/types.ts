import { Timestamp } from 'firebase/firestore';

export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | Timestamp;
  isCompleted: boolean;
  createdAt: Date | Timestamp;
  userId: string;
}

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
