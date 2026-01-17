"use client";

import Image from "next/image";

type StatsCardProps = {
    title: string;
    subtitle: string;
    value: string | number;
    change: string;
    changeType: "up" | "down";
    icon: string;
};

export default function StatsCard({
    title,
    subtitle,
    value,
    change,
    changeType,
    icon,
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-300 p-5 flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-700 font-medium">{title}</p>
                    <p className="text-xs text-gray-400">{subtitle}</p>
                </div>
                <div className="bg-brown-100 rounded-full flex items-center justify-center">
                    <Image src={icon} alt={title} width={33} height={20} />
                </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-brown-800">
                    {value}
                </h2>
                {change && changeType && (
                    <span
                        className={`text-sm inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                            changeType === "up"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                        }`}
                    >
                        {changeType === "up" ? "↗" : "↘"} {change}
                    </span>
                )}
            </div>
        </div>
    );
}
