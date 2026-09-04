import {
    FileText,
  } from "lucide-react";
  
  import FileInput from "./file_input";
  
  
  export default function DokumenSection({
    fileAkta,
    fileNPWP,
    fileStrukturOrganisasi,
  
    existingFiles,
  
    setFileAkta,
    setFileNPWP,
    setFileStrukturOrganisasi,
  }) {
    return (
      <div className="mt-8">
  
        <div className="mb-4 flex items-center gap-2">
  
          <FileText
            size={18}
            className="text-[#38BDF8]"
          />
  
          <h4 className="font-poppins text-sm font-semibold text-[#26364D]">
            Dokumen Pendukung
          </h4>
  
        </div>
  
  
        <div className="space-y-4">
  
          <FileInput
            label="File Akta Pendirian"
            file={fileAkta}
            hasExistingFile={
              existingFiles.akta
            }
            onChange={setFileAkta}
          />
  
  
          <FileInput
            label="File NPWP"
            file={fileNPWP}
            hasExistingFile={
              existingFiles.npwp
            }
            onChange={setFileNPWP}
          />
  
  
          <FileInput
            label="File Struktur Organisasi"
            file={fileStrukturOrganisasi}
            hasExistingFile={
              existingFiles.struktur
            }
            onChange={
              setFileStrukturOrganisasi
            }
          />
  
        </div>
  
      </div>
    );
  }