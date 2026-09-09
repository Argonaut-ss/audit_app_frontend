"use client";

const tabs = [
  {
    id: "prosedur",
    label: "Prosedur",
  },
  {
    id: "dokumen",
    label: "Dokumen",
  },
  {
    id: "konfirmasi_piutang",
    label: "Konfirmasi Piutang",
  },
  {
    id: "rekap_balasan_konfirmasi",
    label: "Rekap Balasan Konfirmasi",
  },
  {
    id: "prosedur_alternatif",
    label: "Prosedur Alternatif",
  },
  {
    id: "rekonsiliasi_piutang",
    label: "Rekonsiliasi Piutang",
  },
  {
    id: "analisis_umur_piutang",
    label: "Analisis Umur Piutang",
  },
  {
    id: "jurnal_koreksi",
    label: "Jurnal Koreksi",
  },
];

export default function PiutangTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#DCE5EF] bg-[#F1F5F9] p-1">
      <div className="flex min-w-max items-center">

        {tabs.map((tab) => {

          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`
                whitespace-nowrap
                rounded-lg
                px-6
                py-3
                font-poppins
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  isActive
                    ? `
                      bg-white
                      text-[#2494C7]
                      shadow-sm
                    `
                    : `
                      text-[#64748B]
                      hover:text-[#2494C7]
                    `
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}

      </div>
    </div>
  );
}