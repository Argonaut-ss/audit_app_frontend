"use client";

import {
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function KategoriCard({
  kategori,
  onClick,
}) {
  const Icon = kategori.icon;

  const statusStyle = {
    success:
      "bg-[#E8F7F0] text-[#3D8C6B]",

    warning:
      "bg-[#FFF6E5] text-[#B7791F]",

    danger:
      "bg-[#FDECEC] text-[#C95B5B]",
  };

  return (
    <div
      className="
        flex
        min-h-[330px]
        flex-col
        rounded-xl
        border
        border-[#DCE5EF]
        bg-white
        p-5
        shadow-sm
      "
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          {/* ICON */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F7FE]">
            <Icon
              size={20}
              strokeWidth={1.8}
              className="text-[#38BDF8]"
            />
          </div>

          {/* TITLE */}
          <h3 className="font-poppins text-base font-semibold text-[#26364D]">
            {kategori.title}
          </h3>

        </div>

        {/* STATUS */}
        <span
          className={`
            rounded-full
            px-3
            py-1
            font-poppins
            text-[10px]
            font-medium
            whitespace-nowrap
            ${statusStyle[kategori.statusType]}
          `}
        >
          {kategori.status}
        </span>

      </div>


      {/* TAHAPAN */}
      <div className="mt-6 flex-1 space-y-3">

        {kategori.tahapan?.length > 0 ? (

          kategori.tahapan.map((item, index) => (

            <div
              key={index}
              className="flex items-center gap-2"
            >

              {item.completed ? (

                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#3D9C7A]"
                  fill="#3D9C7A"
                  color="white"
                />

              ) : (

                <XCircle
                  size={13}
                  className="shrink-0 text-[#E45B5B]"
                  fill="#E45B5B"
                  color="white"
                />

              )}

              <span
                className={`
                  font-poppins
                  text-xs
                  ${
                    item.completed
                      ? "text-[#596275]"
                      : "text-[#D9534F]"
                  }
                `}
              >
                {item.title}
              </span>

            </div>

          ))

        ) : (

          <p className="font-poppins text-xs text-[#94A3B8]">
            Belum ada tahapan pengujian.
          </p>

        )}

      </div>


      {/* FOOTER */}
      <div className="mt-5 flex items-center justify-between border-t border-[#E5EAF0] pt-4">

        <button
          type="button"
          onClick={onClick}
          className="font-poppins text-xs font-medium text-[#4C9BC7]"
        >
          Lihat pengujian
        </button>


        <button
          type="button"
          onClick={onClick}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-[#E8F7FE]
            text-[#38BDF8]
            transition
            hover:bg-[#D8F1FC]
          "
        >
          <ArrowRight
            size={16}
            strokeWidth={1.8}
          />
        </button>

      </div>

    </div>
  );
}