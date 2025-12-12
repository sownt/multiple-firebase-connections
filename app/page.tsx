"use client";

import { IconFolderCode } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

import { useFirebaseProjects } from "@/hooks/use-firebase-projects";
import { FirebaseProjectCard } from "@/components/firebase-project-card";
import { AddConfigDialog } from "@/components/add-config-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Page() {
  const {
    projects,
    isLoading,
    addProject,
    removeProject,
    signInWithGoogle,
    signOutFromProject,
    fetchFirestoreData,
  } = useFirebaseProjects();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {projects.length === 0 ? (
          <Empty className="min-h-[60vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconFolderCode />
              </EmptyMedia>
              <EmptyTitle>No Projects Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any projects yet. Get started by adding
                your first Firebase project.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddConfigDialog onAdd={addProject} />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            <AddConfigDialog onAdd={addProject} />
            {projects.map((project) => (
              <FirebaseProjectCard
                key={project.id}
                project={project}
                onSignIn={signInWithGoogle}
                onSignOut={signOutFromProject}
                onFetchData={fetchFirestoreData}
                onRemove={removeProject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
