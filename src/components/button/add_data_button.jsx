"use client";

import { Plus } from "lucide-react";

export default function AddDataButton({
	onClick,
	disabled = false,
	label = "Tambah Data",
	className = "",
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`flex h-9 items-center gap-2 rounded-md bg-[#38BDF8] px-4 font-poppins text-xs font-medium text-white transition hover:bg-[#159BD7] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
		>
			<Plus size={14} />
			{label}
		</button>
	);
}
