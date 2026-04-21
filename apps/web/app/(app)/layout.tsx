// apps/web/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
}