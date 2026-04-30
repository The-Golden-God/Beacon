"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Workspace {
  gmailConnected?: boolean;
  gmailEmail?: string | null;
  outlookConnected?: boolean;
  outlookEmail?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function EmailSettingsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<{ workspace: Workspace }>("/workspace"),
  });

  // Handle OAuth redirect back from API
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "gmail") {
      toast.success("Gmail connected.");
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } else if (connected === "outlook") {
      toast.success("Outlook connected.");
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } else if (error) {
      const msgs: Record<string, string> = {
        gmail_denied: "Gmail connection cancelled.",
        gmail_failed: "Gmail connection failed. Try again.",
        gmail_state: "Gmail connection expired. Try again.",
        outlook_denied: "Outlook connection cancelled.",
        outlook_failed: "Outlook connection failed. Try again.",
        outlook_state: "Outlook connection expired. Try again.",
      };
      toast.error(msgs[error] ?? "Connection failed.");
    }
    // Clean URL
    if (connected || error) {
      window.history.replaceState({}, "", "/settings/email");
    }
  }, [searchParams, queryClient]);

  const workspace = data?.workspace;
  const gmailConnected = workspace?.gmailConnected ?? false;
  const outlookConnected = workspace?.outlookConnected ?? false;

  async function handleDisconnect(provider: "gmail" | "outlook") {
    try {
      await api.post("/workspace/email/disconnect", { provider });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success(`${provider === "gmail" ? "Gmail" : "Outlook"} disconnected.`);
    } catch {
      toast.error("Failed to disconnect.");
    }
  }

  function handleConnect(provider: "gmail" | "outlook") {
    window.location.href = `${API_URL}/api/${provider}/connect`;
  }

  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h2 className="text-base font-semibold mb-1">Email Connection</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Connect your email to send letters directly from Beacon. Sent mail appears in your own outbox.
      </p>

      {isLoading ? (
        <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
      ) : (
        <div className="space-y-4">
          {/* Gmail */}
          <Card className={cn(gmailConnected && "border-green-300")}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Gmail</p>
                    {gmailConnected && workspace?.gmailEmail ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle size={12} className="text-green-500" />
                        <p className="text-xs text-green-700">{workspace.gmailEmail}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
                    )}
                  </div>
                </div>
                {gmailConnected ? (
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect("gmail")}>
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect("gmail")}>
                    Connect Gmail
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outlook */}
          <Card className={cn(outlookConnected && "border-blue-300")}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Outlook / Microsoft 365</p>
                    {outlookConnected && workspace?.outlookEmail ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle size={12} className="text-green-500" />
                        <p className="text-xs text-green-700">{workspace.outlookEmail}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
                    )}
                  </div>
                </div>
                {outlookConnected ? (
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect("outlook")}>
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect("outlook")}>
                    Connect Outlook
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Beacon only sends mail when you click Send. We never read your inbox.
          </p>
        </div>
      )}
    </div>
  );
}
