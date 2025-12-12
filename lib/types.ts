import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type {
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export interface StoredFirebaseProject {
  id: string;
  name: string;
  config: FirebaseConfig;
  createdAt: number;
}

export interface FirebaseProjectState {
  id: string;
  name: string;
  config: FirebaseConfig;
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  firestoreData: QueryDocumentSnapshot<DocumentData>[] | null;
  firestoreLoading: boolean;
  firestoreError: string | null;
  firestorePath: string;
}

export type AddConfigMode = "form" | "json";
