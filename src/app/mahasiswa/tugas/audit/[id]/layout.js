import AuditSidebar from "@/components/layout/mahasiswa/audit/layout/audit_sidebar/audit_sidebar";

export default function AuditLayout({ children }) {
  return (
    <div className="relative">
      {/* Sidebar Audit - overlay */}
      <AuditSidebar />

      {/* Content */}
      <main className="min-w-0 flex-1 pl-[100px]">
        {children}
      </main>
    </div>
  );
}