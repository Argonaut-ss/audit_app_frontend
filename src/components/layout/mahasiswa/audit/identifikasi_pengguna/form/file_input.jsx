export default function FileInput({
    label,
    file,
    hasExistingFile,
    onChange,
  }) {
    const fileName =
      file?.name ??
      (
        hasExistingFile
          ? "File sudah tersedia"
          : "Belum ada file"
      );
  
  
    function handleFileChange(event) {
      const selectedFile =
        event.target.files?.[0] ?? null;
  
      if (selectedFile) {
        onChange(selectedFile);
      }
    }
  
  
    return (
      <div>
  
        <label className="mb-1.5 block font-poppins text-[11px] font-semibold text-[#26364D]">
          {label}
        </label>
  
        <div className="flex h-9 overflow-hidden rounded-md border border-[#DCE5EF]">
  
          <label className="flex cursor-pointer items-center border-r border-[#DCE5EF] bg-[#F8FAFC] px-4 font-poppins text-xs text-[#596275] hover:bg-[#F1F5F9]">
  
            Choose File
  
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
  
          </label>
  
  
          <div className="flex min-w-0 flex-1 items-center px-3">
  
            <span className="truncate font-poppins text-xs text-[#718096]">
              {fileName}
            </span>
  
          </div>
  
        </div>
  
      </div>
    );
  }