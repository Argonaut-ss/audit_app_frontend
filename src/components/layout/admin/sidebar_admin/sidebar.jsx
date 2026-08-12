import Image from "next/image";
import sidebarData from "./sidebar_data";
import SidebarItem from "./sidebar_item";
import logo from "@/assets/icons/sidebar/logo_binus.png";

const Sidebar = () => {
  return (
    <aside
      className="
      w-[270px]
      min-h-screen
      bg-white
      border-r
      border-[#E8EEF5]
      flex
      flex-col
      "
    >
      <div className="flex items-center justify-center pt-8 mb-15">
      <Image
        src={logo}
        alt="Audit App Logo"
        width={180}
        priority
    />
      </div>

      <div className="px-10">
        <p
          className="
          mb-1
          text-xs
          font-medium
          tracking-[2px]
          text-[#A4A9B3]
          uppercase
          "
        >
          Menu
        </p>
      </div>

      <div>
        {sidebarData.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;