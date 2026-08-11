"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import api from "@/services/api";
import AlertError from "@/components/layout/admin/alert/alert_error";

const HARI_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const JAM_OPTIONS = [
  "07.20 - 09.00",
  "09.20 - 11.00",
  "11.20 - 13.00",
  "13.20 - 15.00",
  "15.20 - 17.00",
  "17.20 - 19.00",
];

const TIPE_KELAS_OPTIONS = [
  "UTS",
  "UAS",
  "Tugas",
  "Sandbox",
];

function TambahMahasiswaModal({
  isOpen,
  onClose,
  onSave,
  alreadySelectedIds,
  mahasiswaOptions,
}) {
  const [search, setSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState(new Set());

  if (!isOpen) return null;

  const filtered = mahasiswaOptions.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleCheck(id) {
    setCheckedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function handleSave() {
    const selected = mahasiswaOptions.filter((m) =>
      checkedIds.has(m.id)
    );

    onSave(selected);

    setCheckedIds(new Set());
    setSearch("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[700px] max-h-[80vh] flex flex-col p-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5">
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />
            </svg>

            <input
              type="text"
              placeholder="Cari Mahasiswa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
          {filtered.map((m, index) => (
            <div
              key={m.id}
              className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-500 w-5">
                {index + 1}
              </span>

              <span className="w-7 h-7 rounded-full bg-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center">
                {m.name.charAt(0)}
              </span>

              <span className="flex-1 text-sm text-gray-900">
                {m.name}
              </span>

              <span className="text-sm text-gray-900 w-28">
                {m.nim}
              </span>

              <span className="text-sm text-gray-900 flex-1">
                {m.email}
              </span>

              <input
                type="checkbox"
                checked={
                  checkedIds.has(m.id) ||
                  alreadySelectedIds.has(m.id)
                }
                disabled={alreadySelectedIds.has(m.id)}
                onChange={() => toggleCheck(m.id)}
                className="w-4 h-4"
              />
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Mahasiswa tidak ditemukan
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-orange-500 hover:brightness-95"
          >
            Back To Dashboard
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Edit
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:brightness-95"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailKelasPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const kode = params.kode;

  const editId = searchParams.get("id");

  const [kelasId, setKelasId] = useState(null);

  const [kodeKelas, setKodeKelas] = useState("");

  const [dosenId, setDosenId] = useState("");
  const [hari, setHari] = useState("");
  const [jam, setJam] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [periode, setPeriode] = useState("2025 / 2026");
  const [tipeKelas, setTipeKelas] = useState("");

  const [mahasiswaList, setMahasiswaList] = useState([]);

  const [dosenOptions, setDosenOptions] = useState([]);
  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [saveMessage, setSaveMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // useEffect(() => {
  //   if (errorMsg) {
  //     const timer = setTimeout(() => {
  //       setErrorMsg(""); // Kosongkan error setelah 5 detik agar pop-up hilang
  //     }, 5000);
      
  //     return () => clearTimeout(timer); // Cleanup function
  //   }
  // }, [errorMsg]);

  useEffect(() => {
    loadInitialData();
  }, [kode, editId]);

  async function loadInitialData() {
    setIsLoading(true);
    setErrorMsg("");
    setSaveMessage("");

    try {
      const [dosenRes, mahasiswaRes] = await Promise.all([
        api.get("/api/dosens", {
          params: {
            per_page: 100,
          },
        }),

        api.get("/api/mahasiswas", {
          params: {
            per_page: 1000,
          },
        }),
      ]);

      setDosenOptions(dosenRes.data.data || []);
      setMahasiswaOptions(mahasiswaRes.data.data || []);

      if (editId) {
        const kelasRes = await api.get("/api/kelas", {
          params: {
            per_page: 500,
          },
        });

        const kelasData = kelasRes.data.data || [];

        const existing = kelasData.find(
          (k) => String(k.id) === String(editId)
        );

        if (!existing) {
          setErrorMsg(
            "Data kelas yang ingin diedit tidak ditemukan."
          );

          return;
        }

        setKelasId(existing.id);

        setKodeKelas(existing.kode_kelas || "");

        setDosenId(
          existing.dosen?.id ||
            existing.dosen_id ||
            ""
        );

        setHari(existing.hari || "");
        setJam(existing.jam || "");
        setRuangan(existing.ruangan || "");

        setPeriode(
          existing.periode || "2025 / 2026"
        );

        setTipeKelas(existing.tipe_kelas || "");

        setMahasiswaList(
          existing.mahasiswas || []
        );
      }

      else {
        setKelasId(null);

        setKodeKelas(
          Array.isArray(kode)
            ? kode[0] || ""
            : kode || ""
        );

        setDosenId("");
        setHari("");
        setJam("");
        setRuangan("");
        setPeriode("2025 / 2026");
        setTipeKelas("");
        setMahasiswaList([]);
      }
    } catch (err) {
      console.error(err);

      setErrorMsg(
        err.response?.data?.message ||
          "Gagal mengambil data dari server."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const selectedIds = new Set(
    mahasiswaList.map((m) => m.id)
  );

  function handleSaveMahasiswa(selected) {
    setMahasiswaList((prev) => {
      const existingIds = new Set(
        prev.map((m) => m.id)
      );

      const newOnes = selected.filter(
        (m) => !existingIds.has(m.id)
      );

      return [...prev, ...newOnes];
    });

    setIsModalOpen(false);
  }

  function handleRemoveMahasiswa(id) {
    setMahasiswaList((prev) =>
      prev.filter((m) => m.id !== id)
    );
  }

  async function handleSimpan() {
    if (
      !kodeKelas ||
      !dosenId ||
      !hari ||
      !jam ||
      !ruangan ||
      !periode ||
      !tipeKelas
    ) {
      setErrorMsg(
        "Semua field (Kode Kelas, Dosen, Hari, Jam, Ruangan, Periode, Tipe Kelas) wajib diisi."
      );

      return;
    }

    setErrorMsg("");
    setSaveMessage("");

    const payload = {
      kode_kelas: kodeKelas,
      dosen_id: dosenId,
      hari,
      jam,
      ruangan,
      periode,
      tipe_kelas: tipeKelas,
      mahasiswa_ids: mahasiswaList.map(
        (m) => m.id
      ),
    };

    try {
      if (kelasId) {
        await api.put(
          `api/kelas/${kelasId}`,
          payload
        );
      }

      else {
        await api.post("api/kelas", payload);
      }

      setSaveMessage("Tersimpan!");

      setTimeout(() => {
        router.push("/admin/kelas");
      }, 800);
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan data kelas. Cek kembali isian form.";

      setErrorMsg(message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 items-center justify-center">
        <span className="text-sm text-gray-400">
          Memuat data...
        </span>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="bg-white rounded-lg p-6">

        {/* {errorMsg && (
          <div className="bg-red-50 text-red-600 text-sm rounded-md px-4 py-2.5 mb-4">
            {errorMsg}
          </div>
        )} */}

        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900">
              Periode :
            </span>

            <input
              type="text"
              value={periode}
              onChange={(e) =>
                setPeriode(e.target.value)
              }
              className="border border-gray-300 rounded-md px-2.5 py-1 text-sm text-gray-900 w-28"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 mb-4">
              {/* KODE KELAS */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Kode Kelas
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <span className="text-sm text-gray-900">
                  {kodeKelas}
                </span>
              </div>

              <div />

              {/* DOSEN */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Dosen
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <select
                  value={dosenId}
                  onChange={(e) =>
                    setDosenId(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">
                    Pilih Dosen
                  </option>

                  {dosenOptions.map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div />

              {/* HARI */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Hari
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <select
                  value={hari}
                  onChange={(e) =>
                    setHari(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">
                    Pilih Hari
                  </option>

                  {HARI_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div />

              {/* JAM */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Jam
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <select
                  value={jam}
                  onChange={(e) =>
                    setJam(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">
                    Pilih Jam
                  </option>

                  {JAM_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div />

              {/* RUANGAN */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Ruangan
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <input
                  type="text"
                  placeholder="Contoh: 503"
                  value={ruangan}
                  onChange={(e) =>
                    setRuangan(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                />
              </div>

              {/* TIPE KELAS */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 w-24">
                  Tipe Kelas
                </span>

                <span className="text-sm text-gray-400">
                  :
                </span>

                <select
                  value={tipeKelas}
                  onChange={(e) =>
                    setTipeKelas(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 flex-1"
                >
                  <option value="">
                    Pilih Tipe
                  </option>

                  {TIPE_KELAS_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

              {/* TAMBAH MAHASISWA */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-sky-500 hover:brightness-95 mb-3"
              >
                + Tambah Mahasiswa
              </button>

              {/* MAHASISWA LIST */}
              <div className="border border-gray-200 rounded-md min-h-[140px] max-h-[220px] overflow-y-auto">
                {mahasiswaList.map((m, index) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-sm text-gray-500 w-5">
                      {index + 1}
                    </span>

                    <span className="w-7 h-7 rounded-full bg-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center">
                      {m.name.charAt(0)}
                    </span>

                    <span className="flex-1 text-sm text-gray-900">
                      {m.name}
                    </span>

                    <span className="text-sm text-gray-900 w-28">
                      {m.nim}
                    </span>

                    <span className="text-sm text-gray-900 flex-1">
                      {m.email}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMahasiswa(m.id)
                      }
                      aria-label={`Hapus ${m.name}`}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* FOOTER BUTTON - sticky, nempel di bawah layar pas discroll */}
              <div className="sticky bottom-0 bg-white flex justify-between items-center pt-4 mt-4 border-t border-gray-100 pb-1">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/kelas")
                  }
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-orange-500 hover:brightness-95"
                >
                  Back To Dashboard
                </button>

                <div className="flex items-center gap-3">
                  {saveMessage && (
                    <span className="text-sm font-semibold text-green-600">
                      {saveMessage}
                    </span>
                  )}

                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleSimpan}
                    className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:brightness-95"
                  >
                    Simpan
                  </button>
                </div>
              </div>
      </div>

      <TambahMahasiswaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMahasiswa}
        alreadySelectedIds={selectedIds}
        mahasiswaOptions={mahasiswaOptions}
      />

      <AlertError 
        message={errorMsg} 
        onClose={() => setErrorMsg("")} 
      />
    </div>
  );
}