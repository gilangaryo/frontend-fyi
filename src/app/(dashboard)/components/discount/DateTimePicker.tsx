"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    X,
} from "lucide-react";

interface DateTimePickerProps {
    label: string;
    value: string; // "YYYY-MM-DDTHH:mm"
    onChange: (value: string) => void;
    required?: boolean;
    optional?: boolean;
}

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];
const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to Monday-based (Mon=0 .. Sun=6)
    return day === 0 ? 6 : day - 1;
}

function toDateString(y: number, m: number, d: number, h: number, min: number) {
    return `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}:${pad(min)}`;
}

function parseValue(value: string) {
    if (!value) return null;
    const [datePart, timePart] = value.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = (timePart ?? "00:00").split(":").map(Number);
    return { year: y, month: m - 1, day: d, hour: h, minute: min };
}

export default function DateTimePicker({
    label,
    value,
    onChange,
    required = false,
    optional = false,
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [popoverPos, setPopoverPos] = useState({
        top: 0,
        left: 0,
        maxHeight: 0,
    });

    const parsed = parseValue(value);
    const now = new Date();

    const [viewYear, setViewYear] = useState(parsed?.year ?? now.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? now.getMonth());
    const [selDay, setSelDay] = useState(parsed?.day ?? 0);
    const [hour, setHour] = useState(parsed?.hour ?? 0);
    const [minute, setMinute] = useState(parsed?.minute ?? 0);

    // Sync internal state when external value changes
    useEffect(() => {
        const p = parseValue(value);
        if (p) {
            setViewYear(p.year);
            setViewMonth(p.month);
            setSelDay(p.day);
            setHour(p.hour);
            setMinute(p.minute);
        }
    }, [value]);

    // Position popover relative to trigger
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const popoverWidth = 320;
        const viewportPadding = 8;
        const preferredGap = 6;
        const estimatedPopoverHeight = popoverRef.current?.offsetHeight ?? 460;
        let left = rect.left;

        // Prevent going off-screen right
        if (left + popoverWidth > window.innerWidth - viewportPadding) {
            left = window.innerWidth - popoverWidth - viewportPadding;
        }

        left = Math.max(viewportPadding, left);

        const spaceBelow =
            window.innerHeight - rect.bottom - viewportPadding - preferredGap;
        const spaceAbove = rect.top - viewportPadding - preferredGap;
        const placeAbove =
            spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow;
        const maxHeight = Math.max(240, placeAbove ? spaceAbove : spaceBelow);
        const top = placeAbove
            ? Math.max(
                  viewportPadding,
                  rect.top -
                      Math.min(estimatedPopoverHeight, maxHeight) -
                      preferredGap,
              )
            : rect.bottom + preferredGap;

        setPopoverPos({ top, left, maxHeight });
    }, []);

    useEffect(() => {
        if (!open) return;

        updatePosition();
        const frame = window.requestAnimationFrame(updatePosition);

        const handleViewportChange = () => updatePosition();
        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
        };
    }, [open, updatePosition]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                popoverRef.current &&
                !popoverRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    // Previous month trailing days
    const prevMonthDays = getDaysInMonth(
        viewMonth === 0 ? viewYear - 1 : viewYear,
        viewMonth === 0 ? 11 : viewMonth - 1,
    );

    const cells: Array<{ day: number; current: boolean }> = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, current: true });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
        for (let d = 1; d <= remaining; d++) {
            cells.push({ day: d, current: false });
        }
    }

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const selectDay = (day: number) => {
        setSelDay(day);
        onChange(toDateString(viewYear, viewMonth, day, hour, minute));
    };

    const changeHour = (h: number) => {
        setHour(h);
        if (selDay > 0)
            onChange(toDateString(viewYear, viewMonth, selDay, h, minute));
    };
    const changeMinute = (m: number) => {
        setMinute(m);
        if (selDay > 0)
            onChange(toDateString(viewYear, viewMonth, selDay, hour, m));
    };

    const isToday = (day: number) =>
        viewYear === now.getFullYear() &&
        viewMonth === now.getMonth() &&
        day === now.getDate();

    const isSelected = (day: number) =>
        parsed &&
        viewYear === parsed.year &&
        viewMonth === parsed.month &&
        day === parsed.day;

    const displayValue = parsed
        ? `${pad(parsed.day)} ${MONTH_NAMES[parsed.month]} ${parsed.year}, ${pad(parsed.hour)}:${pad(parsed.minute)}`
        : "";

    const clearValue = () => {
        onChange("");
        setSelDay(0);
    };

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="text-sm font-medium text-stone-700">
                {label}{" "}
                {optional && (
                    <span className="font-normal text-stone-400">
                        (optional)
                    </span>
                )}
                {required && (
                    <span className="text-xs font-normal text-red-400">
                        *required
                    </span>
                )}
            </label>

            {/* Hidden native input for form validation */}
            {required && (
                <input
                    type="text"
                    required
                    value={value}
                    onChange={() => {}}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            )}

            {/* Trigger button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                    open
                        ? "border-primary-studio bg-white ring-2 ring-primary-studio/10"
                        : "border-stone-200 bg-stone-50 hover:border-stone-300"
                }`}
            >
                <Calendar
                    size={16}
                    className={open ? "text-primary-studio" : "text-stone-400"}
                />
                {displayValue ? (
                    <span className="flex-1 text-stone-800">
                        {displayValue}
                    </span>
                ) : (
                    <span className="flex-1 text-stone-400">
                        Choose date and time
                    </span>
                )}
                {displayValue && !required && (
                    <span
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearValue();
                        }}
                        className="rounded-md p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                    >
                        <X size={14} />
                    </span>
                )}
            </button>

            {/* Portal popover */}
            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            top: popoverPos.top,
                            left: popoverPos.left,
                            maxHeight: popoverPos.maxHeight || undefined,
                        }}
                        className="fixed z-[200] flex w-[320px] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-1"
                    >
                        <div className="min-h-0 overflow-y-auto">
                            {/* Calendar header */}
                            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="rounded-lg p-1 text-stone-500 transition hover:bg-stone-100"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-semibold text-stone-800">
                                    {MONTH_NAMES[viewMonth]} {viewYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="rounded-lg p-1 text-stone-500 transition hover:bg-stone-100"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Day names */}
                            <div className="grid grid-cols-7 border-b border-stone-50 px-3 py-2">
                                {DAY_NAMES.map((d) => (
                                    <span
                                        key={d}
                                        className="text-center text-[11px] font-medium text-stone-400"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-y-0.5 px-3 py-2">
                                {cells.map((cell, idx) => {
                                    const sel =
                                        cell.current && isSelected(cell.day);
                                    const today =
                                        cell.current && isToday(cell.day);
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={!cell.current}
                                            onClick={() =>
                                                cell.current &&
                                                selectDay(cell.day)
                                            }
                                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs transition ${
                                                sel
                                                    ? "bg-primary-studio font-semibold text-white"
                                                    : today
                                                      ? "font-semibold text-primary-studio ring-1 ring-primary-studio/30"
                                                      : cell.current
                                                        ? "text-stone-700 hover:bg-stone-100"
                                                        : "text-stone-300"
                                            }`}
                                        >
                                            {cell.day}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time picker */}
                            <div className="border-t border-stone-100 px-4 py-3">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <Clock
                                        size={13}
                                        className="text-stone-400"
                                    />
                                    <span className="text-xs font-medium text-stone-500">
                                        Waktu
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    {/* Hour spinner */}
                                    <div className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeHour((hour + 23) % 24)
                                            }
                                            className="flex h-7 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-studio/8 border border-primary-studio/20">
                                            <span className="text-base font-semibold tabular-nums text-stone-800">
                                                {pad(hour)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeHour((hour + 1) % 24)
                                            }
                                            className="flex h-7 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <span className="mt-0.5 text-[10px] font-medium text-stone-400 uppercase tracking-wide">
                                            Jam
                                        </span>
                                    </div>

                                    <span className="mb-4 text-xl font-bold text-stone-300">
                                        :
                                    </span>

                                    {/* Minute spinner */}
                                    <div className="flex flex-col items-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeMinute((minute + 59) % 60)
                                            }
                                            className="flex h-7 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-studio/8 border border-primary-studio/20">
                                            <span className="text-base font-semibold tabular-nums text-stone-800">
                                                {pad(minute)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeMinute((minute + 1) % 60)
                                            }
                                            className="flex h-7 w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <span className="mt-0.5 text-[10px] font-medium text-stone-400 uppercase tracking-wide">
                                            Menit
                                        </span>
                                    </div>

                                    {/* Quick presets */}
                                    <div className="ml-auto flex flex-col gap-1.5">
                                        {[
                                            [0, 0],
                                            [9, 0],
                                            [12, 0],
                                            [18, 0],
                                            [23, 59],
                                        ].map(([h, m]) => (
                                            <button
                                                key={`${h}-${m}`}
                                                type="button"
                                                onClick={() => {
                                                    changeHour(h);
                                                    changeMinute(m);
                                                }}
                                                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                                                    hour === h && minute === m
                                                        ? "bg-primary-studio text-white"
                                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                                }`}
                                            >
                                                {pad(h)}:{pad(m)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    const t = new Date();
                                    setViewYear(t.getFullYear());
                                    setViewMonth(t.getMonth());
                                    setSelDay(t.getDate());
                                    setHour(t.getHours());
                                    setMinute(t.getMinutes());
                                    onChange(
                                        toDateString(
                                            t.getFullYear(),
                                            t.getMonth(),
                                            t.getDate(),
                                            t.getHours(),
                                            t.getMinutes(),
                                        ),
                                    );
                                }}
                                className="text-xs font-medium text-primary-studio hover:underline"
                            >
                                Sekarang
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg bg-primary-studio px-3 py-1.5 text-xs font-medium text-white transition hover:bg-secondary-studio"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
