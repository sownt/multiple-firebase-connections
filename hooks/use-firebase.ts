"use client";

import { useCallback } from "react";
import { initializeApp, deleteApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  Auth,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  limit,
  query,
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { StoredFirebaseProject } from "@/lib/types";

export interface FirebaseInstance {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export interface FirebaseAuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface FirestoreState {
  data: QueryDocumentSnapshot<DocumentData>[] | null;
  loading: boolean;
  error: string | null;
  path: string;
}

export function initializeFirebaseApp(
  stored: StoredFirebaseProject
): FirebaseInstance {
  const existingApp = getApps().find((app) => app.name === stored.id);

  let app = existingApp || null;
  let auth = null;
  let firestore = null;

  if (!existingApp) {
    try {
      app = initializeApp(stored.config, stored.id);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } catch (e) {
      console.error("Failed to initialize Firebase app:", e);
    }
  } else {
    auth = getAuth(existingApp);
    firestore = getFirestore(existingApp);
  }

  return { app, auth, firestore };
}

export async function cleanupFirebaseApp(
  app: FirebaseApp | null
): Promise<void> {
  if (app) {
    try {
      await deleteApp(app);
    } catch (e) {
      console.error("Failed to delete Firebase app:", e);
    }
  }
}

export function useFirebase() {
  const signInWithGoogle = useCallback(
    async (
      auth: Auth | null,
      onStateChange: (state: Partial<FirebaseAuthState>) => void
    ) => {
      if (!auth) {
        onStateChange({ error: "Firebase Auth not initialized" });
        return;
      }

      onStateChange({ loading: true, error: null });

      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        onStateChange({
          user: result.user,
          loading: false,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Authentication failed";
        onStateChange({
          error: message,
          loading: false,
        });
      }
    },
    []
  );

  const signOutFromAuth = useCallback(
    async (
      auth: Auth | null,
      onStateChange: (state: Partial<FirebaseAuthState>) => void
    ) => {
      if (!auth) return;

      try {
        await signOut(auth);
        onStateChange({ user: null });
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    },
    []
  );

  const fetchFirestoreData = useCallback(
    async (
      firestore: Firestore | null,
      collectionPath: string,
      onStateChange: (state: Partial<FirestoreState>) => void
    ) => {
      if (!firestore) {
        onStateChange({ error: "Firestore not initialized" });
        return;
      }

      onStateChange({
        loading: true,
        error: null,
        path: collectionPath,
      });

      try {
        const colRef = collection(firestore, collectionPath);
        const q = query(colRef, limit(50));
        const snapshot = await getDocs(q);
        onStateChange({
          data: snapshot.docs,
          loading: false,
        });
      } catch (error: unknown) {
        let message = "Failed to fetch Firestore data";
        if (error instanceof Error) {
          if (error.message.includes("permission")) {
            message =
              "Permission denied. Please check Firestore rules or sign in.";
          } else if (
            error.message.includes("Missing or insufficient permissions")
          ) {
            message = "Missing or insufficient permissions. Sign in required.";
          } else {
            message = error.message;
          }
        }
        onStateChange({
          error: message,
          loading: false,
        });
      }
    },
    []
  );

  return {
    signInWithGoogle,
    signOutFromAuth,
    fetchFirestoreData,
  };
}
