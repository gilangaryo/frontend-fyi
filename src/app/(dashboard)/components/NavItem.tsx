import Link from "next/link";
import Image from "next/image";

type NavItemProps = {
    href: string;
    name: string;
    iconDefault: string;
    iconActive: string;
    active: boolean;
    collapsed: boolean;
    onClick?: () => void;
};

export default function NavItem({
    href,
    name,
    iconDefault,
    iconActive,
    active,
    collapsed,
    onClick,
}: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 mb-2 transition
        ${active ? "bg-primary-studio text-white border-l-4 border-secondary-studio" : "text-gray-700 hover:bg-gray-100"}
        ${collapsed ? "justify-center" : ""}`}
        >
            <Image
                src={active ? iconActive : iconDefault}
                alt={name}
                width={20}
                height={20}
            />
            {!collapsed && <span className="text-sm md:text-base">{name}</span>}
        </Link>
    );
}
