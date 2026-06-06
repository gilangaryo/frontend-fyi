import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import type { PaymentSessionData } from "@/lib/payment-result";

interface PaymentOrderSummaryProps {
    data: PaymentSessionData;
}

export default function PaymentOrderSummary({ data }: PaymentOrderSummaryProps) {
    const { order, session } = data;
    const items = order.items ?? [];
    const total = Number(order.total || session.amount || 0);

    return (
        <div className="bg-primary p-6 w-full max-w-xl">
            {items.map((it) => (
                <div key={it.id} className="flex justify-between mb-3">
                    <div className="flex gap-3">
                        <div className="relative w-16 h-20">
                            <Image
                                src={getImageUrl(it.product?.imageUrl)}
                                alt={it.product?.title}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                        <div>
                            <p className="font-medium">{it.product?.title}</p>
                            <p className="text-gray-500 text-sm">
                                x{it.quantity} — IDR{" "}
                                {Number(it.priceAtPurchase).toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            <div className="border-t pt-4 border-gray-300 text-gray-500 space-y-3 text-sm font-light">
                <div className="flex justify-between">
                    <span>Transaction Date</span>
                    <span>
                        {new Intl.DateTimeFormat("en-US", {
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Jakarta",
                        }).format(new Date(order.updatedAt))}{" "}
                        WIB
                    </span>
                </div>

                <div className="flex justify-between font-medium border-t border-gray-300 pt-3">
                    <span>Total</span>
                    <span>IDR {total.toLocaleString("id-ID")}</span>
                </div>
            </div>
        </div>
    );
}
