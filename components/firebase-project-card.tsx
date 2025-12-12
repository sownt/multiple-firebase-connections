"use client";

import { useState } from "react";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FirebaseProjectState } from "@/lib/types";
import {
  Database,
  Search,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  User2,
} from "lucide-react";
import { LoginWithGoogle } from "./login-with-google";
import { DeleteIcon } from "./ui/delete";
import { LogoutIcon } from "./ui/logout";

interface FirebaseProjectCardProps {
  project: FirebaseProjectState;
  onSignIn: (projectId: string) => void;
  onSignOut: (projectId: string) => void;
  onFetchData: (projectId: string, path: string) => void;
  onRemove: (projectId: string) => void;
}

export function FirebaseProjectCard({
  project,
  onSignIn,
  onSignOut,
  onFetchData,
  onRemove,
}: FirebaseProjectCardProps) {
  const [collectionPath, setCollectionPath] = useState(
    project.firestorePath || ""
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFetchData = () => {
    if (collectionPath.trim()) {
      onFetchData(project.id, collectionPath.trim());
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl ring-1 ring-border/50 transition-all duration-300 hover:shadow-2xl hover:ring-primary/20">
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {project.name.length !== 0
                  ? project.name
                  : project.config.projectId}
              </CardTitle>
              {project.name.length !== 0 && (
                <CardDescription className="text-xs truncate mt-0.5">
                  {project.config.projectId}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            {project.user ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-black hover:bg-black/10"
                onClick={() => onSignOut(project.id)}
              >
                <LogoutIcon className="h-4 w-4" />
              </Button>
            ) : (
              <LoginWithGoogle
                onClick={() => onSignIn(project.id)}
                disabled={project.authLoading}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(project.id)}
            >
              <DeleteIcon className="h-4 w-4" suppressHydrationWarning />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator className="bg-border/50" />

      <CardContent className="relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {project.user?.displayName} ({project.user?.email})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Firestore</span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Collection path (e.g., users)"
              value={collectionPath}
              onChange={(e) => setCollectionPath(e.target.value)}
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleFetchData()}
            />
            <Button
              onClick={handleFetchData}
              disabled={project.firestoreLoading || !collectionPath.trim()}
              size="sm"
              className="h-9 px-3 shrink-0"
            >
              {project.firestoreLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {project.firestoreError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {project.firestoreError}
              </AlertDescription>
            </Alert>
          )}

          {project.firestoreData && project.firestoreData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {project.firestoreData.length} documents
                </span>
              </div>
              <ScrollArea className="rounded-lg border bg-muted/30 p-2">
                <div className="space-y-2">
                  {project.firestoreData.map(
                    (doc: QueryDocumentSnapshot<DocumentData>) => (
                      <div key={doc.id} className="text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <code className="font-mono text-primary font-medium">
                            {doc.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() =>
                              copyToClipboard(
                                doc.id,
                                JSON.stringify(doc.data(), null, 2)
                              )
                            }
                          >
                            {copiedId === doc.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(doc.data(), null, 2)}
                        </pre>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {project.firestoreData && project.firestoreData.length === 0 && (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No documents found in this collection
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
