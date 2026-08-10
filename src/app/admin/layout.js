import Sidebar from "@/components/layout/admin/sidebar_admin/sidebar";
import Navbar from "@/components/layout/admin/navbar/navbar";

export default function AdminLayout({ children }) {
  const user = {
    name: "Admin",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FC]">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar user={user} />

        <main className="min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}