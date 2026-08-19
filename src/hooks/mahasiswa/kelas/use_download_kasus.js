import { downloadKasusFile } from "@/services/mahasiswa/kelas/kasus";

export default function useDownloadKasus() {
  const handleDownload = async (kasus) => {
    try {
      const file = await downloadKasusFile(
        kasus.KasusID
      );

      const url = window.URL.createObjectURL(
        file
      );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        kasus.NamaFile || "document.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Gagal mengunduh file:",
        error
      );
    }
  };

  return {
    handleDownload,
  };
}