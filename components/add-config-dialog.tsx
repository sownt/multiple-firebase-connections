"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FirebaseConfig, AddConfigMode } from "@/lib/types";
import { FileCode, FormInput, AlertCircle } from "lucide-react";

interface AddConfigDialogProps {
  onAdd: (name: string, config: FirebaseConfig) => void;
}

export function AddConfigDialog({ onAdd }: AddConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AddConfigMode>("form");
  const [name, setName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [messagingSenderId, setMessagingSenderId] = useState("");
  const [appId, setAppId] = useState("");
  const [measurementId, setMeasurementId] = useState("");

  const resetForm = () => {
    setName("");
    setJsonInput("");
    setApiKey("");
    setAuthDomain("");
    setProjectId("");
    setStorageBucket("");
    setMessagingSenderId("");
    setAppId("");
    setMeasurementId("");
    setError(null);
  };

  const parseJsonConfig = (json: string): FirebaseConfig | null => {
    try {
      let cleanedJson = json.trim();

      cleanedJson = cleanedJson.replace(/^(const|let|var)\s+\w+\s*=\s*/, "");

      cleanedJson = cleanedJson.replace(/;\s*$/, "");

      const initMatch = cleanedJson.match(
        /initializeApp\s*\(\s*(\{[\s\S]*\})\s*\)/
      );
      if (initMatch) {
        cleanedJson = initMatch[1];
      }

      cleanedJson = cleanedJson.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

      cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, "$1");

      const parsed = JSON.parse(cleanedJson);
      if (
        !parsed.apiKey ||
        !parsed.authDomain ||
        !parsed.projectId ||
        !parsed.appId
      ) {
        setError(
          "Missing required fields: apiKey, authDomain, projectId, appId"
        );
        return null;
      }
      return {
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket,
        messagingSenderId: parsed.messagingSenderId,
        appId: parsed.appId,
        measurementId: parsed.measurementId,
      };
    } catch (e) {
      console.error("JSON parse error:", e);
      setError("Invalid JSON format. Please paste the Firebase config object.");
      return null;
    }
  };

  const handleSubmit = () => {
    setError(null);

    if (!name.trim()) {
      setName(projectId);
    }

    let config: FirebaseConfig | null = null;

    if (mode === "json") {
      config = parseJsonConfig(jsonInput);
    } else {
      if (!apiKey || !authDomain || !projectId || !appId) {
        setError("Please fill in all required fields");
        return;
      }
      config = {
        apiKey,
        authDomain,
        projectId,
        storageBucket: storageBucket || undefined,
        messagingSenderId: messagingSenderId || undefined,
        appId,
        measurementId: measurementId || undefined,
      };
    }

    if (config) {
      onAdd(name.trim(), config);
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="shadow-xl transition-all duration-300 hover:shadow-2xl"
          size="lg"
        >
          Add Firebase Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Add Firebase Configuration
          </DialogTitle>
          <DialogDescription>
            Connect to a Firebase project by entering its configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              placeholder="My Firebase Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
            />
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as AddConfigMode)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="form" className="gap-2">
                <FormInput className="h-3.5 w-3.5" />
                Form
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileCode className="h-3.5 w-3.5" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-3 mt-4">
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="apiKey" className="text-xs">
                    API Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="apiKey"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="authDomain" className="text-xs">
                    Auth Domain <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="authDomain"
                    placeholder="your-project.firebaseapp.com"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectId" className="text-xs">
                      Project ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="projectId"
                      placeholder="your-project-id"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appId" className="text-xs">
                      App ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="appId"
                      placeholder="1:123456789:web:abc123"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="storageBucket" className="text-xs">
                    Storage Bucket
                  </Label>
                  <Input
                    id="storageBucket"
                    placeholder="your-project.appspot.com"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="messagingSenderId" className="text-xs">
                      Messaging Sender ID
                    </Label>
                    <Input
                      id="messagingSenderId"
                      placeholder="123456789012"
                      value={messagingSenderId}
                      onChange={(e) => setMessagingSenderId(e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="measurementId" className="text-xs">
                      Measurement ID
                    </Label>
                    <Input
                      id="measurementId"
                      placeholder="G-XXXXXXXX"
                      value={measurementId}
                      onChange={(e) => setMeasurementId(e.target.value)}
                      className="h-9 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="json-config" className="text-xs">
                  Firebase Configuration JSON
                </Label>
                <Textarea
                  id="json-config"
                  placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789:web:abc123",
  "measurementId": "G-XXXXXXXX"
}`}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[200px] font-mono text-xs resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
