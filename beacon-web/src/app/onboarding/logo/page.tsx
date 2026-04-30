"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingProgress } from "@/components/onboarding-progress";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

export default function OnboardingLogoPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  function processFile(f: File) {
    setFileError("");
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Please upload a PNG, JPG, or SVG file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("Your logo is too large. Please use an image under 2MB.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <OnboardingProgress step={3} />

      <Card className="shadow-md mt-4">
        <CardHeader>
          <CardTitle>Add your agency logo</CardTitle>
          <CardDescription>
            Your logo appears on PDF letters. You can add or change this later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-colors ${
                dragging ? "border-blue-500 bg-blue-50" : "border-input hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              <Upload size={28} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Drop your logo here, or <span className="text-blue-600 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or SVG · Max 2MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border p-4 bg-slate-50">
              <img
                src={preview!}
                alt="Logo preview"
                className="max-w-[200px] max-h-[100px] object-contain"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{file.name}</span>
                <span>·</span>
                <span>{(file.size / 1024).toFixed(0)}KB</span>
                <button
                  onClick={clearFile}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove logo"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleInputChange}
            className="hidden"
          />

          {fileError && <p className="text-xs text-destructive">{fileError}</p>}

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/onboarding/clients")}
              className="w-full"
            >
              Continue →
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/clients")}
              className="w-full"
            >
              Skip — I&apos;ll add this later
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding/style")}
              className="w-full text-muted-foreground"
            >
              ← Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
