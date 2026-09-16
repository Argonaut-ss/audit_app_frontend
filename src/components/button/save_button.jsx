"use client";

export default function SaveButton({
	onClick,
	disabled = false,
	isSaving = false,
	label = "Simpan",
	savingLabel = "Menyimpan...",
	className = "",
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`h-9 rounded-md bg-[#00A51A] px-6 font-poppins text-xs font-medium text-white transition hover:bg-[#008C16] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
		>
			{isSaving ? savingLabel : label}
		</button>
	);
}
