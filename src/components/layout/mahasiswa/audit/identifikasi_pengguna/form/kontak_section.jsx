import {
    UserRound,
    Phone,
    Mail,
    BriefcaseBusiness,
  } from "lucide-react";
  
  import InputField from "./input_field";
  
  
  export default function KontakSection({
    form,
    handleChange,
  }) {
    return (
      <div className="mt-8">
  
        <div className="mb-4 flex items-center gap-2">
  
          <UserRound
            size={18}
            className="text-[#38BDF8]"
          />
  
          <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
            Kontak Klien
          </h4>
  
        </div>
  
  
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
  
          <InputField
            label="Nama"
            name="kontakNama"
            value={form.kontakNama}
            onChange={handleChange}
            icon={<UserRound size={15} />}
          />
  
          <InputField
            label="Nomor Telepon"
            name="kontakNoTelp"
            value={form.kontakNoTelp}
            onChange={handleChange}
            icon={<Phone size={15} />}
          />
  
          <InputField
            label="Jabatan"
            name="kontakJabatan"
            value={form.kontakJabatan}
            onChange={handleChange}
            icon={
              <BriefcaseBusiness size={15} />
            }
          />
  
          <InputField
            label="Email"
            name="kontakEmail"
            value={form.kontakEmail}
            onChange={handleChange}
            icon={<Mail size={15} />}
          />
  
        </div>
  
      </div>
    );
  }