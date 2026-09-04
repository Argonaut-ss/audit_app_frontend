export default function SelectField({
    label,
    name,
    value,
    onChange,
    icon,
    options = [],
  }) {
    return (
      <div>
        <label className="mb-1.5 block font-poppins text-[11px] font-semibold text-[#26364D]">
          {label}
        </label>
  
        <div className="flex h-9 overflow-hidden rounded-md border border-[#DCE5EF] bg-white">
          <div className="flex w-8 shrink-0 items-center justify-center border-r border-[#DCE5EF] text-[#718096]">
            {icon}
          </div>
  
          <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="min-w-0 flex-1 bg-white px-3 font-poppins text-xs text-[#596275] outline-none"
          >
            <option value="">Pilih Sektor Usaha</option>
  
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }