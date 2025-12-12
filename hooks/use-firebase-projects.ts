"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type {
  StoredFirebaseProject,
  FirebaseProjectState,
  FirebaseConfig,
} from "@/lib/types";
import { STORAGE_KEY } from "@/lib/config";
import {
  initializeFirebaseApp,
  cleanupFirebaseApp,
  useFirebase,
} from "./use-firebase";

const createProjectState = (
  stored: StoredFirebaseProject
): FirebaseProjectState => {
  const { app, auth, firestore } = initializeFirebaseApp(stored);

  return {
    id: stored.id,
    name: stored.name,
    config: stored.config,
    app,
    auth,
    firestore,
    user: null,
    authLoading: false,
    authError: null,
    firestoreData: null,
    firestoreLoading: false,
    firestoreError: null,
    firestorePath: "",
  };
};

export function useFirebaseProjects() {
  const [projects, setProjects] = useState<FirebaseProjectState[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const storedProjects: StoredFirebaseProject[] = JSON.parse(stored);
        return storedProjects.map((project) => createProjectState(project));
      } catch (e) {
        console.error("Failed to parse stored projects:", e);
      }
    }
    return [];
  });
  const [isLoading] = useState(false);

  const { signInWithGoogle, signOutFromAuth, fetchFirestoreData } =
    useFirebase();

  useEffect(() => {
    if (isLoading) return;

    const toStore: StoredFirebaseProject[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      config: p.config,
      createdAt: Date.now(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [projects, isLoading]);

  const updateProjectState = useCallback(
    (projectId: string, updates: Partial<FirebaseProjectState>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const addProject = useCallback((name: string, config: FirebaseConfig) => {
    const id = `firebase-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const stored: StoredFirebaseProject = {
      id,
      name,
      config,
      createdAt: Date.now(),
    };

    const newProject = createProjectState(stored);
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const removeProject = useCallback(async (projectId: string) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (project?.app) {
        cleanupFirebaseApp(project.app);
      }
      return prev.filter((p) => p.id !== projectId);
    });
  }, []);

  const handleSignInWithGoogle = useCallback(
    async (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await signInWithGoogle(project.auth, (state) => {
        updateProjectState(projectId, {
          user: state.user ?? undefined,
          authLoading: state.loading,
          authError: state.error ?? null,
        });
      });
    },
    [projects, signInWithGoogle, updateProjectState]
  );

  const handleSignOut = useCallback(
    async (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await signOutFromAuth(project.auth, (state) => {
        updateProjectState(projectId, { user: state.user ?? null });
      });
    },
    [projects, signOutFromAuth, updateProjectState]
  );

  const handleFetchFirestoreData = useCallback(
    async (projectId: string, collectionPath: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await fetchFirestoreData(project.firestore, collectionPath, (state) => {
        updateProjectState(projectId, {
          firestoreData: state.data ?? undefined,
          firestoreLoading: state.loading,
          firestoreError: state.error ?? null,
          firestorePath: state.path ?? "",
        });
      });
    },
    [projects, fetchFirestoreData, updateProjectState]
  );

  const projectAuthInfos = projects.map((p) => ({ id: p.id, auth: p.auth }));

  useEffect(() => {
    const unsubscribers = projectAuthInfos.map(({ id, auth }) => {
      if (!auth) return () => {};

      return onAuthStateChanged(auth, (user) => {
        updateProjectState(id, { user });
      });
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectAuthInfos.length, updateProjectState]);

  return {
    projects,
    isLoading,
    addProject,
    removeProject,
    signInWithGoogle: handleSignInWithGoogle,
    signOutFromProject: handleSignOut,
    fetchFirestoreData: handleFetchFirestoreData,
    updateProjectState,
  };
}
