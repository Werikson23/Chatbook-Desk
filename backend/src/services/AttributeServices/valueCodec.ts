import AttributeValue from "../../models/AttributeValue";

export const clearValueColumns = () => ({
  valueText: null as string | null,
  valueNumber: null as number | null,
  valueBoolean: null as boolean | null,
  valueDate: null as Date | null,
  valueJson: null as object | null,
  valueStringIndex: null as string | null,
  valueNumberIndex: null as number | null,
  valueDateIndex: null as Date | null
});

export const encodeValueForStorage = (
  dataType: string,
  raw: unknown
): ReturnType<typeof clearValueColumns> => {
  const cleared = clearValueColumns();
  if (raw === null || raw === undefined || raw === "") {
    return cleared;
  }

  switch (dataType) {
    case "text":
    case "textarea":
      return {
        ...cleared,
        valueText: String(raw),
        valueStringIndex: String(raw).slice(0, 512)
      };
    case "number": {
      const n = Number(raw);
      return {
        ...cleared,
        valueNumber: Number.isFinite(n) ? n : null,
        valueNumberIndex: Number.isFinite(n) ? n : null
      };
    }
    case "boolean":
      return {
        ...cleared,
        valueBoolean: Boolean(raw),
        valueStringIndex: String(Boolean(raw))
      };
    case "date":
    case "datetime": {
      const d = raw instanceof Date ? raw : new Date(String(raw));
      return {
        ...cleared,
        valueDate: Number.isNaN(d.getTime()) ? null : d,
        valueDateIndex: Number.isNaN(d.getTime()) ? null : d
      };
    }
    case "location":
    case "file":
    case "media":
    case "relation":
      return {
        ...cleared,
        valueJson: raw as object,
        valueStringIndex:
          typeof raw === "object" && raw !== null && "city" in (raw as object)
            ? String((raw as { city?: string }).city || "").slice(0, 512)
            : JSON.stringify(raw).slice(0, 512)
      };
    default:
      return { ...cleared, valueText: String(raw), valueStringIndex: String(raw).slice(0, 512) };
  }
};

export const decodeStoredValue = (
  row: AttributeValue | null,
  dataType: string
): unknown => {
  if (!row) return null;

  switch (dataType) {
    case "text":
    case "textarea":
      return row.valueText;
    case "number":
      return row.valueNumber;
    case "boolean":
      return row.valueBoolean;
    case "date":
    case "datetime":
      return row.valueDate;
    case "location":
    case "file":
    case "media":
    case "relation":
      return row.valueJson;
    default:
      return row.valueText ?? row.valueJson ?? row.valueNumber;
  }
};

export const valuesEqual = (dataType: string, a: unknown, b: unknown): boolean => {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
};
