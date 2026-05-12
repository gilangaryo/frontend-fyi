import { Product, Variant } from "@/types/product";

export type AdminMeasurementField = {
    id?: string;
    name: string;
    displayName: string;
    unit?: string | null;
    position: number;
};

export type AdminVariant = {
    id?: string;
    size: string;
    stock: string;
    sku: string;
    measurements: Record<string, string>;
};

export const DEFAULT_MEASUREMENT_FIELDS: AdminMeasurementField[] = [
    { name: "bust", displayName: "Bust", position: 0, unit: "cm" },
    { name: "waist", displayName: "Waist", position: 1, unit: "cm" },
    { name: "length", displayName: "Length", position: 2, unit: "cm" },
    { name: "sleeve", displayName: "Sleeve", position: 3, unit: "cm" },
    { name: "height", displayName: "Hip", position: 4, unit: "cm" },
];

export function normalizeMeasurementKey(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function titleFromKey(key: string) {
    return key
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function createEmptyVariant(
    fields: AdminMeasurementField[],
    initial?: Partial<AdminVariant>,
): AdminVariant {
    const measurements: Record<string, string> = {};

    for (const field of fields) {
        measurements[field.name] = "";
    }

    return {
        id: initial?.id,
        size: initial?.size || "",
        stock: initial?.stock || "",
        sku: initial?.sku || "",
        measurements: {
            ...measurements,
            ...(initial?.measurements || {}),
        },
    };
}

export function extractMeasurementFieldsFromProduct(product: Product) {
    if (
        Array.isArray(product.measurementFields) &&
        product.measurementFields.length > 0
    ) {
        return product.measurementFields
            .map((field, index) => ({
                id: field.id,
                name: field.name,
                displayName: field.displayName || titleFromKey(field.name),
                unit: field.unit,
                position: Number.isFinite(Number(field.position))
                    ? Number(field.position)
                    : index,
            }))
            .sort((a, b) => a.position - b.position);
    }

    return DEFAULT_MEASUREMENT_FIELDS;
}

export function extractVariantMeasurements(
    variant: Variant,
    fields: AdminMeasurementField[],
) {
    const values: Record<string, string> = {};

    for (const field of fields) {
        values[field.name] = "";
    }

    for (const measurement of variant.measurements || []) {
        const key = measurement.field?.name;
        if (!key || !(key in values)) continue;
        values[key] = measurement.value || "";
    }

    return values;
}

export function getNextMeasurementField(
    fields: AdminMeasurementField[],
): AdminMeasurementField {
    const nextIndex = fields.length + 1;
    let key = `measurement_${nextIndex}`;
    let counter = nextIndex;

    const names = new Set(fields.map((field) => field.name));

    while (names.has(key)) {
        counter += 1;
        key = `measurement_${counter}`;
    }

    return {
        name: key,
        displayName: `Measurement ${counter}`,
        unit: "cm",
        position: fields.length,
    };
}
