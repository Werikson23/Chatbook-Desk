/** DDD brasileiro (2 dígitos) → região macro (IBGE / operadoras). */

export type BrazilRegionId =
  | "norte"
  | "nordeste"
  | "centro_oeste"
  | "sudeste"
  | "sul"
  | "desconhecido";

const DDD_TO_REGION: Record<string, BrazilRegionId> = (() => {
  const m: Record<string, BrazilRegionId> = {};
  const add = (ddds: string[], r: BrazilRegionId) => {
    ddds.forEach(d => {
      m[d] = r;
    });
  };
  add(["68", "96", "92", "97", "91", "93", "94", "69", "95", "63"], "norte");
  add(
    [
      "82",
      "71",
      "73",
      "74",
      "75",
      "77",
      "85",
      "88",
      "98",
      "99",
      "83",
      "81",
      "87",
      "86",
      "89",
      "84",
      "79"
    ],
    "nordeste"
  );
  add(["61", "62", "64", "65", "66", "67"], "centro_oeste");
  add(
    [
      "27",
      "28",
      "31",
      "32",
      "33",
      "34",
      "35",
      "37",
      "38",
      "21",
      "22",
      "24",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19"
    ],
    "sudeste"
  );
  add(
    [
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
      "51",
      "53",
      "54",
      "55",
      "47",
      "48",
      "49"
    ],
    "sul"
  );
  return m;
})();

export function regionFromDdd(ddd: string): BrazilRegionId {
  const d = ddd?.replace(/\D/g, "").slice(0, 2);
  if (!d || d.length !== 2) return "desconhecido";
  return DDD_TO_REGION[d] ?? "desconhecido";
}

export function extractBrazilDdd(rawNumber: string): string | null {
  if (!rawNumber) return null;
  const d = rawNumber.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) {
    const ddd = d.slice(2, 4);
    if (/^\d{2}$/.test(ddd)) return ddd;
  }
  if ((d.length === 10 || d.length === 11) && !d.startsWith("0")) {
    const ddd = d.slice(0, 2);
    if (/^\d{2}$/.test(ddd)) return ddd;
  }
  return null;
}
