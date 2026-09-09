"use client";

import {
  User,
  CalendarDays,
  Check,
} from "lucide-react";

import {
  prosedurData,
} from "./data/prosedur_data";

export default function ProsedurTab() {
  return (
    <div>

      {/* ================= INFO AKUN ================= */}

      <div className="rounded-xl border border-[#DCE5EF] bg-white p-4">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* NAMA AKUN */}

          <div>

            <label className="mb-2 block font-poppins text-[11px] font-semibold text-[#475569]">
              Nama Akun
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-4">

              <User
                size={16}
                className="text-[#64748B]"
              />

              <span className="font-poppins text-sm text-[#64748B]">
                Piutang Dagang
              </span>

            </div>

          </div>


          {/* KODE AKUN */}

          <div>

            <label className="mb-2 block font-poppins text-[11px] font-semibold text-[#475569]">
              Kode Akun
            </label>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-[#DCE5EF] bg-[#F8FAFC] px-4">

              <CalendarDays
                size={16}
                className="text-[#64748B]"
              />

              <span className="font-poppins text-sm text-[#64748B]">
                1-1210
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ================= TABLE ================= */}

      <div className="mt-4 overflow-hidden rounded-xl border border-[#DCE5EF]">

        {/* HEADER */}

        <div className="
          grid
          grid-cols-[55px_minmax(350px,1fr)_130px_190px_100px]
          border-b
          border-[#DCE5EF]
          bg-[#F8FAFC]
          px-4
          py-3
        ">

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            NO
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            PROSEDUR
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            INDEX
          </div>

          <div className="font-poppins text-[11px] font-semibold text-[#64748B]">
            TANGGAL
          </div>

          <div className="text-center font-poppins text-[11px] font-semibold text-[#64748B]">
            CHECKLIST
          </div>

        </div>


        {/* BODY */}

        {prosedurData.map((item) => (

          <div
            key={item.no}
            className="
              grid
              grid-cols-[55px_minmax(350px,1fr)_130px_190px_100px]
              items-center
              border-b
              border-[#EEF2F6]
              px-4
              py-2
              last:border-b-0
            "
          >

            {/* NO */}

            <div className="font-poppins text-sm text-[#475569]">
              {item.no}
            </div>


            {/* PROSEDUR */}

            <div className="pr-5 font-poppins text-sm leading-relaxed text-[#475569]">
              {item.prosedur}
            </div>


            {/* INDEX */}

            <div>

              <input
                value={item.index}
                readOnly
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-[#DCE5EF]
                  bg-[#F8FAFC]
                  px-3
                  font-poppins
                  text-sm
                  text-[#475569]
                "
              />

            </div>


            {/* TANGGAL */}

            <div className="pl-2">

              <div className="
                flex
                h-10
                items-center
                justify-between
                rounded-xl
                border
                border-[#DCE5EF]
                bg-[#F8FAFC]
                px-3
              ">

                <span className="font-poppins text-sm text-[#475569]">
                  {item.tanggal}
                </span>

                <CalendarDays
                  size={15}
                  className="text-[#64748B]"
                />

              </div>

            </div>


            {/* CHECKLIST */}

            <div className="flex justify-center">

              <div className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-md
                bg-[#38BDF8]
              ">

                <Check
                  size={14}
                  strokeWidth={3}
                  className="text-white"
                />

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* ================= KESIMPULAN ================= */}

      <div className="mt-5">

        <label className="mb-2 block font-poppins text-sm font-semibold text-[#475569]">
          Kesimpulan
        </label>

        <textarea
          rows={3}
          defaultValue="Terdapat selisih antara konfirmasi piutang dari saldo menurut klien dan balasan konfirmasi piutang dari klien customer"
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-[#DCE5EF]
            bg-[#F8FAFC]
            p-4
            font-poppins
            text-sm
            text-[#64748B]
            outline-none
            focus:border-[#38BDF8]
          "
        />

      </div>


      {/* ================= BUTTON ================= */}

      <div className="mt-5 flex justify-end">

        <button
          type="button"
          className="
            rounded-lg
            bg-[#22A58A]
            px-6
            py-2.5
            font-poppins
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#1B8C76]
          "
        >
          Simpan
        </button>

      </div>

    </div>
  );
}   