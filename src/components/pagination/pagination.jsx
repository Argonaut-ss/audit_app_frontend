"use client";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4">
      {/* Previous */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>

      {/* Nomor halaman */}
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-8 w-8 items-center justify-center rounded-md font-poppins text-sm ${
              currentPage === page
                ? "bg-[#EEF6FF] text-[#3B82F6]"
                : "text-[#6B7589] hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    </div>
  );
}