"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, MoreHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited";
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: () => api.get<{ members: TeamMember[] }>("/team"),
  });

  const members = data?.members ?? [];

  async function handleInvite() {
    if (!inviteEmail.trim()) { toast.error("Email is required."); return; }
    setSending(true);
    try {
      await api.post("/team/invite", { email: inviteEmail.trim(), name: inviteName.trim() || undefined, role: inviteRole });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success(`Invitation sent to ${inviteEmail}.`);
      setInviteEmail(""); setInviteName(""); setInviteRole("agent");
      setShowInvite(false);
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(memberId: string, name: string) {
    try {
      await api.delete(`/team/${memberId}`);
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success(`${name} removed.`);
    } catch {
      toast.error("Failed to remove member.");
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl pb-14 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold">Team</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage who has access to your Beacon workspace.</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-1.5">
          <Plus size={13} />
          Invite
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <Card className="mb-6">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm font-medium">Invite a team member</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="inviteName">Name</Label>
                <Input id="inviteName" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inviteEmail">Email <span className="text-destructive">*</span></Label>
                <Input id="inviteEmail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@agency.com" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="inviteRole">Role</Label>
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="agent">Agent — generate and send letters</option>
                <option value="admin">Admin — full access including billing</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleInvite} disabled={sending} size="sm">
                {sending ? "Sending…" : "Send Invitation"}
              </Button>
              <button onClick={() => setShowInvite(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed">
          <p className="text-2xl mb-3">👥</p>
          <p className="font-medium">No team members yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Invite agents to collaborate in your workspace.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {members.map((m, i) => (
            <div key={m.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                {m.name?.charAt(0)?.toUpperCase() ?? m.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name || m.email}</p>
                <p className="text-xs text-muted-foreground truncate">{m.name ? m.email : ""}</p>
              </div>
              <span className={cn(
                "text-xs rounded-full px-2 py-0.5 font-medium",
                m.status === "invited" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              )}>
                {m.status === "invited" ? "Invited" : m.role}
              </span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                  className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen === m.id && (
                  <div className="absolute right-0 top-full mt-0.5 bg-popover border rounded-md shadow-lg z-50 py-1 min-w-[120px]">
                    <button
                      onClick={() => { setMenuOpen(null); handleRemove(m.id, m.name || m.email); }}
                      className="block w-full text-left px-3 py-1.5 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
