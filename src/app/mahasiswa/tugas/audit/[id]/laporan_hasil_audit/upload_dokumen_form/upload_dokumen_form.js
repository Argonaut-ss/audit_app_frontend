import {
    CloudUpload,
    Link as LinkIcon,
    ExternalLink,
} from "lucide-react";

const ACCEPTED_FILES =
    ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";

// =====================================================
// DOCUMENT INPUT
// =====================================================

export default function DocumentInput({
    document,
    onTypeChange,
    onFileChange,
    onLinkChange,
    onViewFile,
}) {
    const isLink = document.tipe_input === "link";

    const existingFileName =
        document.existingFile?.file_name ||
        document.existingFile?.nama_file ||
        "";

    const selectedFileName =
        document.file?.name || existingFileName;

    return (
        <div
            className={`rounded-xl border p-3.5 ${
                isLink
                    ? "border-[#D5DFFF]"
                    : "border-[#E2E8F0]"
            }`}
        >
            {/* HEADER DOKUMEN */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#34445F]">
                    {document.label}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        onTypeChange(
                            document.jenis_file,
                            isLink ? "file" : "link"
                        )
                    }
                    className="flex shrink-0 items-center gap-2"
                >
                    <span
                        className={`text-xs font-medium ${
                            isLink
                                ? "text-[#19B5F5]"
                                : "text-[#71829F]"
                        }`}
                    >
                        Gunakan Link
                    </span>

                    <span
                        className={`relative h-[20px] w-[36px] rounded-full transition-colors ${
                            isLink
                                ? "bg-[#36BDF8]"
                                : "bg-[#E2E8F0]"
                        }`}
                    >
                        <span
                            className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                isLink
                                    ? "left-[18px]"
                                    : "left-[2px]"
                            }`}
                        />
                    </span>
                </button>
            </div>

            {/* INPUT LINK */}
            {isLink ? (
                <div className="flex min-h-[40px] items-center gap-2 rounded-xl border border-[#CEDAFF] bg-[#FAFCFF] px-3 py-2">
                    <LinkIcon
                        size={16}
                        className="shrink-0 text-[#20B5F5]"
                    />

                    <input
                        type="url"
                        value={document.link}
                        onChange={(event) =>
                            onLinkChange(
                                document.jenis_file,
                                event.target.value
                            )
                        }
                        placeholder="Masukkan link dokumen"
                        className="min-w-0 flex-1 bg-transparent text-xs text-[#34445F] outline-none placeholder:text-[#A0AEC0]"
                    />

                    {document.link && (
                        <a
                            href={document.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[#8FA2BF] hover:text-[#20B5F5]"
                            title="Buka link"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            ) : (
                /* INPUT FILE */
                <label className="flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#DCE5F0] bg-[#FBFCFE] px-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF8FF]">
                        <CloudUpload
                            size={19}
                            className="text-[#20B5F5]"
                        />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-[#465773]">
                            {selectedFileName ||
                                "Klik untuk unggah berkas"}
                        </span>

                        <span className="mt-1 block text-[10px] text-[#94A3B8]">
                            PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG · Maks. 16 MB
                        </span>
                    </span>

                    <input
                        type="file"
                        accept={ACCEPTED_FILES}
                        className="hidden"
                        onChange={(event) => {
                            const file =
                                event.target.files?.[0] || null;

                            onFileChange(
                                document.jenis_file,
                                file
                            );

                            event.target.value = "";
                        }}
                    />
                </label>
            )}

            {/* FILE YANG SUDAH DIPILIH */}
            {!isLink && selectedFileName && (
                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-[#71829F]">
                        {selectedFileName}
                    </span>

                    {document.existingFile && !document.file && (
                        <button
                            type="button"
                            onClick={() => onViewFile(document)}
                            className="shrink-0 text-xs font-medium text-[#19B5F5] hover:underline"
                        >
                            Lihat file
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}