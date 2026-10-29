
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useParams } from "next/navigation";

import BukuBesarSectionForm from "@/components/layout/mahasiswa/audit/buku_besar/buku_besar_section/buku_besar_section";
import ConfirmationPopup from "@/components/popup/confirmation_popup";
import AlertSuccess from "@/components/alert/alert_success";

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const normalizeId = (value) => {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
};

// ID unik untuk identitas baris FE, bukan COAID.
const createUniqueRowId = () =>
    `piutang-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;

const formatRupiahInput = (value) => {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number.toLocaleString("id-ID")
        : String(value);
};

const parseRupiah = (value) => {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const text = String(value).trim();

    if (!text) {
        return 0;
    }

    const normalized = text
        .replace(/\./g, "")
        .replace(/,/g, ".");

    const number = Number(normalized);

    return Number.isFinite(number) ? number : 0;
};

// Audited Berjalan = Per Book + AJE/RJE.
const calculateAuditedBerjalan = (perBook, ajeRje) => {
    return formatRupiahInput(
        parseRupiah(perBook) + parseRupiah(ajeRje)
    );
};

// Normalisasi tanggal menjadi YYYY-MM-DD.
const normalizeDateValue = (value) => {
    if (!value) {
        return "";
    }

    const text = String(value).trim();

    const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);

    if (isoMatch) {
        return isoMatch[1];
    }

    const slashMatch = text.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (slashMatch) {
        return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
    }

    const dashMatch = text.match(
        /^(\d{2})-(\d{2})-(\d{4})$/
    );

    if (dashMatch) {
        return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;
    }

    return "";
};

// Mapping data backend ke format FE.
// rowId selalu terpisah dari COAID.
const mapPiutangRow = (
    row,
    subMapping = "",
    rowId = null
) => {
    const perBook = formatRupiahInput(row.PerBook ?? 0);
    const ajeRje = formatRupiahInput(row.AJE_RJE ?? 0);

    return {
        id: rowId ?? createUniqueRowId(),

        COAID: row.COAID ?? null,
        NoAkun: row.NoAkun ?? "",

        SubMapping:
            row.SubMapping ??
            subMapping ??
            "",

        account: row.NamaAkun ?? row.account ?? "",

        perBook,
        ajeRje,

        auditedBerjalan: calculateAuditedBerjalan(
            row.PerBook ?? 0,
            row.AJE_RJE ?? 0
        ),

        auditedSebelum: formatRupiahInput(
            row.AuditSebelum ?? 0
        ),

        isNew: false,
    };
};

// Setiap baris dari backend memperoleh ID unik berdasarkan
// urutannya, meskipun terdapat COAID yang sama.
const mapSubMappingRows = (subMappings) => {
    if (!Array.isArray(subMappings)) {
        return [];
    }

    let rowIndex = 0;

    return subMappings.flatMap((group) => {
        const groupRows = Array.isArray(group.rows)
            ? group.rows
            : [];

        return groupRows.map((row) => {
            const uniqueId = `piutang-saved-${rowIndex++}`;

            return mapPiutangRow(
                row,
                group.SubMapping ?? "",
                uniqueId
            );
        });
    });
};

export default function Piutang({
    jwbKasusId,
    onSave,
    isSaving: externalIsSaving = false,
}) {
    const params = useParams();

    const resolvedJwbKasusId = useMemo(() => {
        const candidates = [
            jwbKasusId,
            params?.jwbKasusId,
            params?.JwbKasusID,
            params?.jwb_kasus_id,
            params?.id,
        ];

        for (const candidate of candidates) {
            const value = normalizeId(candidate);

            if (value !== "") {
                return value;
            }
        }

        return "";
    }, [
        jwbKasusId,
        params?.jwbKasusId,
        params?.JwbKasusID,
        params?.jwb_kasus_id,
        params?.id,
    ]);

    const [piutangRows, setPiutangRows] = useState([]);
    const [accountMasterRows, setAccountMasterRows] = useState([]);

    const [piutangDates, setPiutangDates] = useState({
        perBook: "",
        auditedBerjalan: "",
        auditedSebelum: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingLocal, setIsSavingLocal] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [isDeletePopupOpen, setIsDeletePopupOpen] =
        useState(false);

    const [selectedDeleteId, setSelectedDeleteId] =
        useState(null);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Token autentikasi tidak ditemukan. Silakan login kembali."
            );
        }

        return {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        };
    }, []);

    // Memasang data backend ke state FE.
    const applyBackendData = useCallback((data) => {
        const rows = mapSubMappingRows(data.sub_mappings);

        const availableAccounts = Array.isArray(
            data.available_accounts
        )
            ? data.available_accounts
            : [];

        const mappedAvailableAccounts =
            availableAccounts.map((row, index) =>
                mapPiutangRow(
                    row,
                    row.SubMapping ?? "",
                    `piutang-account-${index}`
                )
            );

        setPiutangRows(rows);

        setAccountMasterRows(
            mappedAvailableAccounts.length > 0
                ? mappedAvailableAccounts
                : rows
        );

        setPiutangDates({
            perBook: normalizeDateValue(
                data.TanggalPerBook
            ),

            auditedBerjalan: normalizeDateValue(
                data.TanggalAuditJln
            ),

            auditedSebelum: normalizeDateValue(
                data.TanggalAuditSblm
            ),
        });
    }, []);

    // Mengambil data akun dan tanggal dari backend.
    const fetchPiutang = useCallback(
        async (signal) => {
            if (!resolvedJwbKasusId) {
                setPiutangRows([]);
                setAccountMasterRows([]);

                setPiutangDates({
                    perBook: "",
                    auditedBerjalan: "",
                    auditedSebelum: "",
                });

                setErrorMessage(
                    "JwbKasusID belum ditemukan. Pastikan ID kasus tersedia dari halaman tugas."
                );

                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/buku-besar/${encodeURIComponent(
                        resolvedJwbKasusId
                    )}?Top=B`,
                    {
                        method: "GET",
                        headers: getAuthHeaders(),
                        signal,
                    }
                );

                const result = await response
                    .json()
                    .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        `Gagal mengambil Buku Besar (${response.status}).`
                    );
                }

                if (
                    result?.success !== true ||
                    !result?.data
                ) {
                    throw new Error(
                        result?.message ||
                        "Respons Buku Besar tidak valid."
                    );
                }

                const data = result.data;

                if (
                    data.JwbKasusID !== undefined &&
                    String(data.JwbKasusID) !==
                        String(resolvedJwbKasusId)
                ) {
                    throw new Error(
                        "JwbKasusID pada respons Buku Besar tidak sesuai."
                    );
                }

                applyBackendData(data);

                console.log("DEBUG Piutang:", {
                    JwbKasusID: data.JwbKasusID,
                    Mapping: data.Mapping,
                    jumlahBarisTerpilih:
                        Array.isArray(data.sub_mappings)
                            ? data.sub_mappings.reduce(
                                (total, group) =>
                                    total +
                                    (Array.isArray(group.rows)
                                        ? group.rows.length
                                        : 0),
                                0
                            )
                            : 0,
                    jumlahAkunTersedia:
                        Array.isArray(data.available_accounts)
                            ? data.available_accounts.length
                            : 0,
                });
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error(
                    "Gagal mengambil Buku Besar Piutang:",
                    error
                );

                setErrorMessage(
                    error.message ||
                    "Terjadi kesalahan saat mengambil data Piutang."
                );
            } finally {
                if (!signal?.aborted) {
                    setIsLoading(false);
                }
            }
        },
        [
            resolvedJwbKasusId,
            getAuthHeaders,
            applyBackendData,
        ]
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchPiutang(controller.signal);

        return () => controller.abort();
    }, [fetchPiutang]);

    // Dropdown berisi akun yang tersedia dari backend.
    const accountOptions = useMemo(() => {
        const uniqueAccounts = new Map();

        accountMasterRows.forEach((row) => {
            if (row.account) {
                uniqueAccounts.set(
                    row.account,
                    row.account
                );
            }
        });

        piutangRows.forEach((row) => {
            if (
                row.account &&
                !uniqueAccounts.has(row.account)
            ) {
                uniqueAccounts.set(
                    row.account,
                    row.account
                );
            }
        });

        return Array.from(uniqueAccounts.values());
    }, [accountMasterRows, piutangRows]);

    const handleDateChange = (field, value) => {
        setPiutangDates((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleRowChange = (rowId, field, value) => {
        setPiutangRows((previous) =>
            previous.map((row) => {
                if (String(row.id) !== String(rowId)) {
                    return row;
                }

                // Memilih akun tidak mengubah ID identitas baris.
                if (field === "account") {
                    const selectedAccount =
                        accountMasterRows.find(
                            (masterRow) =>
                                masterRow.account === value
                        );

                    if (!selectedAccount) {
                        return {
                            ...row,
                            account: value,
                            COAID: null,
                            NoAkun: "",
                            SubMapping: "",
                        };
                    }

                    return {
                        ...row,

                        COAID: selectedAccount.COAID,
                        NoAkun: selectedAccount.NoAkun,
                        SubMapping: selectedAccount.SubMapping,
                        account: selectedAccount.account,

                        perBook: selectedAccount.perBook,
                        ajeRje: selectedAccount.ajeRje,

                        auditedBerjalan:
                            calculateAuditedBerjalan(
                                selectedAccount.perBook,
                                selectedAccount.ajeRje
                            ),

                        auditedSebelum:
                            selectedAccount.auditedSebelum,
                    };
                }

                const updatedRow = {
                    ...row,
                    [field]: value,
                };

                if (
                    field === "perBook" ||
                    field === "ajeRje"
                ) {
                    updatedRow.auditedBerjalan =
                        calculateAuditedBerjalan(
                            field === "perBook"
                                ? value
                                : row.perBook,
                            field === "ajeRje"
                                ? value
                                : row.ajeRje
                        );
                }

                return updatedRow;
            })
        );
    };

    // Baris kosong berasal dari createEmptyRow() di section.
    // Jika ID yang diberikan sudah digunakan, buat ID baru.
    const handleAddRow = (newRow) => {
        setPiutangRows((previous) => {
            const requestedId = normalizeId(newRow?.id);

            const idAlreadyExists = previous.some(
                (row) =>
                    String(row.id) === String(requestedId)
            );

            const uniqueId =
                requestedId && !idAlreadyExists
                    ? requestedId
                    : createUniqueRowId();

            return [
                ...previous,
                {
                    ...newRow,

                    id: uniqueId,

                    COAID: newRow?.COAID ?? null,
                    NoAkun: newRow?.NoAkun ?? "",
                    SubMapping: newRow?.SubMapping ?? "",
                    account: newRow?.account ?? "",

                    perBook: newRow?.perBook ?? "0",
                    ajeRje: newRow?.ajeRje ?? "0",

                    auditedBerjalan:
                        newRow?.auditedBerjalan ??
                        calculateAuditedBerjalan(
                            newRow?.perBook ?? "0",
                            newRow?.ajeRje ?? "0"
                        ),

                    auditedSebelum:
                        newRow?.auditedSebelum ?? "0",

                    isNew: true,
                },
            ];
        });
    };

    const handleRemoveRow = (rowId) => {
        setSelectedDeleteId(rowId);
        setIsDeletePopupOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeletePopupOpen(false);
        setSelectedDeleteId(null);
    };

    // Penghapusan dari database dilakukan saat Simpan.
    const handleConfirmDelete = () => {
        if (selectedDeleteId === null) {
            return;
        }

        setPiutangRows((previous) =>
            previous.filter(
                (row) =>
                    String(row.id) !==
                    String(selectedDeleteId)
            )
        );

        setIsDeletePopupOpen(false);
        setSelectedDeleteId(null);

        setSuccessMessage(
            "Baris berhasil dihapus."
        );
    };

    const handleSave = async () => {
        if (!resolvedJwbKasusId) {
            setErrorMessage(
                "JwbKasusID belum ditemukan. Data tidak dapat disimpan."
            );
            return;
        }

        setIsSavingLocal(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // Backend menyimpan COAID dan SubMapping.
            // Nilai saldo dihitung oleh service backend.
            const items = piutangRows.map((row) => ({
                COAID: row.COAID ?? null,
                account: row.account || null,
                SubMapping: row.SubMapping || null,
            }));

            const payload = {
                Top: "B",
                TanggalAuditSblm:
                    piutangDates.auditedSebelum || null,
                items,
            };

            const response = await fetch(
                `${API_BASE_URL}/api/buku-besar/${encodeURIComponent(
                    resolvedJwbKasusId
                )}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    `Gagal menyimpan Buku Besar (${response.status}).`
                );
            }

            if (result?.success !== true) {
                throw new Error(
                    result?.message ||
                    "Respons penyimpanan Buku Besar tidak valid."
                );
            }

            // Setelah simpan, gunakan data resmi dari backend.
            if (result.data) {
                applyBackendData(result.data);
            }

            setSuccessMessage(
                result.message ||
                "Data Buku Besar berhasil disimpan."
            );

            if (onSave) {
                await onSave({
                    piutangDates,
                    piutangRows,
                });
            }
        } catch (error) {
            console.error(
                "Gagal menyimpan Buku Besar Piutang:",
                error
            );

            setErrorMessage(
                error.message ||
                "Terjadi kesalahan saat menyimpan data."
            );
        } finally {
            setIsSavingLocal(false);
        }
    };

    const saving = isSavingLocal || externalIsSaving;

    return (
        <div className="w-full min-w-0 rounded-xl bg-white">
            {errorMessage && (
                <div
                    role="alert"
                    className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {errorMessage}
                </div>
            )}

            <div className="w-full min-w-0">
                <BukuBesarSectionForm
                    title="Piutang"
                    subtitle="Piutang"
                    accountOptions={accountOptions}
                    rows={piutangRows}
                    dates={piutangDates}
                    onDateChange={handleDateChange}
                    onRowChange={handleRowChange}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                />
            </div>

            <div className="flex justify-end px-5 py-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                        saving ||
                        isLoading ||
                        !resolvedJwbKasusId
                    }
                    className="
                        min-w-[100px]
                        rounded-lg
                        bg-[#05A80B]
                        px-5
                        py-2.5
                        font-poppins
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#04930A]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {isLoading
                        ? "Memuat..."
                        : saving
                            ? "Menyimpan..."
                            : "Simpan"}
                </button>
            </div>

            <ConfirmationPopup
                isOpen={isDeletePopupOpen}
                message="Apakah Anda yakin ingin menghapus baris ini?"
                subText="Data baris yang dihapus akan hilang dari tampilan ini."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <AlertSuccess
                title="Berhasil"
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />
        </div>
    );
}
