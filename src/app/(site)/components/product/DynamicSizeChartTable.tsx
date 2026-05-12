"use client";

import { MeasurementField, Variant } from "@/types/product";

type DynamicSizeChartTableProps = {
    measurementFields?: MeasurementField[];
    variants: Variant[];
};

function getMeasurementValue(variant: Variant, field: MeasurementField) {
    const direct = (variant.measurements || []).find(
        (measurement) =>
            measurement.fieldId === field.id ||
            measurement.field?.name === field.name,
    );

    if (direct?.value && direct.value.trim().length > 0) {
        return direct.value;
    }

    return "-";
}

export default function DynamicSizeChartTable({
    measurementFields,
    variants,
}: DynamicSizeChartTableProps) {
    const fields =
        Array.isArray(measurementFields) && measurementFields.length > 0
            ? [...measurementFields].sort(
                  (a, b) => (a.position || 0) - (b.position || 0),
              )
            : [];

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100 text-gray-700 font-medium">
                    <tr>
                        <th className="px-4 py-2 border">Size</th>
                        {fields.map((field, index) => (
                            <th
                                key={`${field.id || field.name}-${index}`}
                                className="px-4 py-2 border whitespace-nowrap"
                            >
                                {field.displayName || field.name}
                                {field.unit ? ` (${field.unit})` : ""}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(variants || []).map((variant) => (
                        <tr key={variant.id} className="text-center border-t">
                            <td className="px-4 py-2 border font-medium">
                                {variant.size || "-"}
                            </td>
                            {fields.map((field, index) => (
                                <td
                                    key={`${variant.id}-${field.id || field.name}-${index}`}
                                    className="px-4 py-2 border"
                                >
                                    {getMeasurementValue(variant, field)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
