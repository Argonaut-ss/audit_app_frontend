export default function InputField({
    label,
    name,
    value,
    onChange,
    icon,
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
  
          <input
            type="text"
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="min-w-0 flex-1 px-3 font-poppins text-xs text-[#596275] outline-none placeholder:text-[#9AA5B1]"
          />
  
        </div>
  
      </div>
    );
  }