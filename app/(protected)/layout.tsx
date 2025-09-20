import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ReactQueryProvider from "@/components/utils/QueryProvider";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <div className="min-h-dvh pt-20">
        <Header />
        <Sidebar />

        <main
          className="min-w-0 p-6"
          style={{ paddingLeft: "var(--sidebar-w, 14rem)" }}
        >
          {children}
        </main>
      </div>
    </ReactQueryProvider>
  );
}
