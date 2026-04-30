"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  FileText,
  Shield,
  Settings,
  Users2,
  Inbox,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { BeaconLogo } from "@/components/beacon-logo";
import { cn } from "@/lib/utils";

type AppUser = {
  id: string;
  name: string;
  email: string;
  workspaceId?: string | null;
  role: string;
  onboardingComplete: boolean;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Calendar", Icon: Calendar },
  { href: "/clients", label: "Clients", Icon: Users },
  { href: "/letters/new", label: "Letters", Icon: FileText },
  { href: "/log", label: "Log", Icon: Shield },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const ADMIN_NAV_ITEMS = [
  { href: "/team", label: "Team", Icon: Users2 },
  { href: "/queue", label: "Queue", Icon: Inbox },
];

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Calendar", Icon: Calendar },
  { href: "/clients", label: "Clients", Icon: Users },
  { href: "/letters/new", label: "Letters", Icon: FileText },
  { href: "/log", label: "Log", Icon: Shield },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = session.user as unknown as AppUser;
    if (!user.onboardingComplete) {
      router.replace("/onboarding/agency");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!session) return null;
  const user = session.user as unknown as AppUser;
  if (!user.onboardingComplete) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <MobileBottomBar />
    </div>
  );
}

function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  const { data: workspaceData } = useQuery({
    queryKey: ["workspace"],
    queryFn: () =>
      api.get<{ workspace: { name: string; plan: string; subscriptionStatus: string; trialLettersUsed: number; trialLettersLimit: number } }>("/workspace"),
    enabled: !!user.workspaceId,
  });

  const ws = workspaceData?.workspace;
  const isAdmin = user.role === "admin";
  const showAdminItems =
    isAdmin &&
    (ws?.plan === "agency" || ws?.plan === "office");
  const isTrialing = ws?.subscriptionStatus === "trialing";
  const lettersRemaining = ws ? ws.trialLettersLimit - ws.trialLettersUsed : null;

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-sidebar h-full">
      {/* Logo + trial badge */}
      <div className="px-4 pt-6 pb-4">
        <BeaconLogo href="/dashboard" />
        {isTrialing && lettersRemaining !== null && (
          <Link
            href="/upgrade"
            className={cn(
              "mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              lettersRemaining === 0
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            )}
          >
            {lettersRemaining === 0
              ? "0 letters remaining — Upgrade"
              : `${lettersRemaining} letter${lettersRemaining === 1 ? "" : "s"} remaining`}
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            {...item}
            isActive={
              pathname === item.href ||
              (item.href !== "/letters/new" && pathname.startsWith(item.href + "/"))
            }
          />
        ))}

        {showAdminItems && (
          <>
            <div className="border-t my-2 mx-1" />
            {ADMIN_NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
              />
            ))}
          </>
        )}
      </nav>

      {/* Account menu */}
      <div className="border-t p-2 relative">
        <button
          onClick={() => setAccountOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground shrink-0 transition-transform",
              accountOpen && "rotate-180"
            )}
          />
        </button>

        {accountOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-popover border rounded-lg shadow-lg py-1 z-50">
            <Link
              href="/settings/agency"
              onClick={() => setAccountOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setAccountOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              Billing
            </Link>
            <div className="border-t my-1" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarNavItem({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </Link>
  );
}

function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 border-t bg-background flex items-center z-30">
      {BOTTOM_NAV.map(({ href, label, Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/letters/new" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px]",
              isActive ? "text-blue-600" : "text-muted-foreground"
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
