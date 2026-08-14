import Sidebar from "@/components/layout/mahasiswa/sidebar_mahasiswa/sidebar";
import Navbar from "@/components/layout/navbar/navbar";

export default function AdminLayout({ children }) {
  const user = {
    name: "Admin",
  };

  return (
    <div className="flex h-screen bg-[#F5F7FC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={user} />

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}