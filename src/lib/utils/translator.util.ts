type Dictionary = Record<string, string>;

const enToId: Dictionary = {
  name: "nama",
  address: "alamat",
  city: "kota",
  requester: "pemohon",
  longitude: "longitude",
  latitude: "latitude",
  langgananType: "tipe pelanggan",
  phone: "telepon",
  picName: "pic",
  isDefault: "default",
  status: "status",
  basePrice: "harga dasar",
};

const idToEn: Dictionary = Object.fromEntries(
  Object.entries(enToId).map(([en, id]) => [id, en])
);

export function translateToId(text: string): string {
  return text
    .split(" ")
    .map((word) => enToId[word.toLowerCase()] || word)
    .join(" ");
}

export function translateToEn(text: string): string {
  return text
    .split(" ")
    .map((word) => idToEn[word.toLowerCase()] || word)
    .join(" ");
}
