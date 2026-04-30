export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h2 className="text-base font-semibold mb-1">Notifications</h2>
      <p className="text-sm text-muted-foreground mb-8">Control when and how Beacon notifies you.</p>

      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="text-2xl mb-3">🔔</p>
        <p className="font-medium">Coming soon</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          Email digest, renewal reminders, and approval alerts will be configurable here.
        </p>
      </div>
    </div>
  );
}
