"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const SidebarItem = ({ item }) => {
    const pathname = usePathname();

    const hasChildren = item.children?.length > 0;

    const isActive = hasChildren
        ? item.children.some((child) => pathname === child.href)
        : pathname === item.href;

    const [isOpen, setIsOpen] = useState(isActive);

    // Menu dengan submenu
    if (hasChildren) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`
                            mx-4
                            flex items-center gap-4
                            h-16
                            w-[calc(100%-2rem)]
                            px-6
                            rounded-xl
                            transition-all duration-200
                            ${isActive
                            ? "bg-[#EEF8FF] text-[#2C3A4B]"
                            : "text-[#5B6472] hover:bg-gray-100"
                        }
                    `}
                >
                    <div className="flex w-6 shrink-0 justify-center">
                        <Image
                            src={item.icon}
                            alt={item.title}
                            height={18}
                        />
                    </div>

                    <span className="flex-1 text-left text-sm font-semibold">
                        {item.title}
                    </span>

                    <ChevronDown
                        size={14}
                        strokeWidth={2}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {isOpen && (
                    <div className="mt-1 flex flex-col gap-1    v                                               0 cf[">
                        {item.children.map((child) => {
                            const childActive = pathname === child.href;

                            return (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`
                                mx-4 ml-[52px]
                                rounded-xl
                                px-12
                                py-2
                                font-poppins
                                text-sm
                                font-semibold
                                transition-colors duration-200
                                ${childActive
                                            ? "bg-[#EEF8FF] text-[#20A7F3]"
                                            : "text-[#5B6472]"
                                        }
                            `}
                                >
                                    {child.title}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Menu biasa
    return (
        <Link
            href={item.href}
            className={`
                mx-4
                flex items-center gap-4
                h-16
                px-6
                rounded-xl
                transition-all duration-200
                ${isActive
                    ? "bg-[#EEF8FF] text-[#2C3A4B]"
                    : "text-[#5B6472] hover:bg-gray-100"
                }
            `}
        >
            <div className="flex w-6 shrink-0 justify-center">
                <Image
                    src={item.icon}
                    alt={item.title}
                    height={18}
                />
            </div>

            <span className="text-sm font-semibold">
                {item.title}
            </span>
        </Link>
    );
};

export default SidebarItem;