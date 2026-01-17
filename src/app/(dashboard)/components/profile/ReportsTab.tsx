"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/constants";
import { Download } from "lucide-react";

interface SalesReport {
    grossSales: number;
    discount: number;
    refunds: number;
    netSales: number;
    expense: number;
    operational: number;
    tax: number;
    totalCollected: number;
}

export default function ReportsTab() {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("today");
    const [customDateRange, setCustomDateRange] = useState({
        startDate: "",
        endDate: "",
    });

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            let url = `${API_BASE}/reports/sales?period=${period}`;

            if (
                period === "custom" &&
                customDateRange.startDate &&
                customDateRange.endDate
            ) {
                url = `${API_BASE}/reports/sales?startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
            }

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch report");

            const data = await res.json();
            if (data.success) {
                setReport(data.data);
            }
        } catch (error) {
            console.error("❌ Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    }, [period, customDateRange.startDate, customDateRange.endDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem("token");

            let url = `${API_BASE}/reports/sales/pdf?period=${period}`;

            if (
                period === "custom" &&
                customDateRange.startDate &&
                customDateRange.endDate
            ) {
                url = `${API_BASE}/reports/sales/pdf?startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
            }

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to download PDF");

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `sales-report-${
                new Date().toISOString().split("T")[0]
            }.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("❌ Error downloading PDF:", error);
            alert("Failed to download PDF");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-studio"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold">Sales Summary</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Period Selector */}
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio focus:border-transparent"
                    >
                        <option value="today">Today</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {/* Custom Date Range */}
                    {period === "custom" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) =>
                                    setCustomDateRange({
                                        ...customDateRange,
                                        startDate: e.target.value,
                                    })
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio"
                            />
                            <span>-</span>
                            <input
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) =>
                                    setCustomDateRange({
                                        ...customDateRange,
                                        endDate: e.target.value,
                                    })
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-studio"
                            />
                        </div>
                    )}

                    {/* Download PDF Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-studio text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {report ? (
                <div className="space-y-1">
                    {/* Gross Sales */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                        <span className="text-gray-600">Gross Sales</span>
                        <span className="font-medium">
                            {formatCurrency(report.grossSales)}
                        </span>
                    </div>

                    {/* Discount */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-red-600">
                            ({formatCurrency(report.discount)})
                        </span>
                    </div>

                    {/* Refunds */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                        <span className="text-gray-600">Refunds</span>
                        <span className="text-gray-600">
                            ({report.refunds})
                        </span>
                    </div>

                    {/* NET SALES */}
                    <div className="flex justify-between items-center py-4 border-b-2 border-gray-300 bg-gray-50 px-4 -mx-4">
                        <span className="font-bold text-lg">NET SALES</span>
                        <span className="font-bold text-lg">
                            {formatCurrency(report.netSales)}
                        </span>
                    </div>

                    {/* Expense */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-200 mt-4">
                        <span className="text-gray-600">Couries Service</span>
                        <span className="font-medium">
                            {formatCurrency(report.expense)}
                        </span>
                    </div>

                    {/* Total Collected */}
                    <div className="flex justify-between items-center py-6 bg-cyan-50 px-4 -mx-4 mt-4 rounded-lg">
                        <span className="font-bold text-xl">
                            Total Collected
                        </span>
                        <span className="font-bold text-xl text-cyan-700">
                            {formatCurrency(report.totalCollected)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No data available for the selected period
                </div>
            )}
        </div>
    );
}
