"use client";

export default function AuditTab({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: "identifikasi",
      label: "Identifikasi Pengguna",
    },
    {
      id: "perikatan",
      label: "Perikatan",
    },
    {
      id: "pmpj",
      label: "PMPJ",
    },
  ];

  return (
    <div className="grid w-full grid-cols-3 overflow-hidden rounded-t-xl bg-[#E3E9F2]">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              h-10
              font-poppins
              text-sm
              font-semibold
              transition-colors
              ${
                active
                  ? "rounded-t-xl bg-white text-[#0EA5E9]"
                  : "text-[#66758A] hover:bg-[#DCE5EF]"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}