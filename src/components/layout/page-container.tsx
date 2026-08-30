export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto lg:ml-[72px]">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}
