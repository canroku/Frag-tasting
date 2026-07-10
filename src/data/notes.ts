// Nota evreni — her nota renk kodlu bir kategoriye ait (Bölüm 10: nota rozetleri renk kodlu)

export type NotaKategori =
  | "narenciye"
  | "meyve"
  | "cicek"
  | "yesil"
  | "baharat"
  | "tatli"
  | "odunsu"
  | "recine"
  | "hayvansal"
  | "su";

export interface Nota {
  id: string;
  ad: string;
  kategori: NotaKategori;
}

export const NOTALAR: Nota[] = [
  { id: "bergamot", ad: "Bergamot", kategori: "narenciye" },
  { id: "limon", ad: "Limon", kategori: "narenciye" },
  { id: "greyfurt", ad: "Greyfurt", kategori: "narenciye" },
  { id: "mandalina", ad: "Mandalina", kategori: "narenciye" },
  { id: "portakal_cicegi", ad: "Portakal Çiçeği", kategori: "cicek" },
  { id: "neroli", ad: "Neroli", kategori: "cicek" },
  { id: "elma", ad: "Elma", kategori: "meyve" },
  { id: "ananas", ad: "Ananas", kategori: "meyve" },
  { id: "seftali", ad: "Şeftali", kategori: "meyve" },
  { id: "ahududu", ad: "Ahududu", kategori: "meyve" },
  { id: "kiraz", ad: "Kiraz", kategori: "meyve" },
  { id: "frenk_uzumu", ad: "Frenk Üzümü", kategori: "meyve" },
  { id: "incir", ad: "İncir", kategori: "meyve" },
  { id: "hindistan_cevizi", ad: "Hindistan Cevizi", kategori: "tatli" },
  { id: "vanilya", ad: "Vanilya", kategori: "tatli" },
  { id: "tonka", ad: "Tonka Fasulyesi", kategori: "tatli" },
  { id: "karamel", ad: "Karamel", kategori: "tatli" },
  { id: "bal", ad: "Bal", kategori: "tatli" },
  { id: "kahve", ad: "Kahve", kategori: "tatli" },
  { id: "cikolata", ad: "Çikolata", kategori: "tatli" },
  { id: "badem", ad: "Badem", kategori: "tatli" },
  { id: "pudra", ad: "Pudra", kategori: "tatli" },
  { id: "tarcin", ad: "Tarçın", kategori: "baharat" },
  { id: "karabiber", ad: "Karabiber", kategori: "baharat" },
  { id: "pembe_biber", ad: "Pembe Biber", kategori: "baharat" },
  { id: "safran", ad: "Safran", kategori: "baharat" },
  { id: "kakule", ad: "Kakule", kategori: "baharat" },
  { id: "zencefil", ad: "Zencefil", kategori: "baharat" },
  { id: "gul", ad: "Gül", kategori: "cicek" },
  { id: "yasemin", ad: "Yasemin", kategori: "cicek" },
  { id: "lavanta", ad: "Lavanta", kategori: "cicek" },
  { id: "iris", ad: "İris", kategori: "cicek" },
  { id: "menekse", ad: "Menekşe", kategori: "cicek" },
  { id: "tuberoz", ad: "Tuberoz", kategori: "cicek" },
  { id: "ylang", ad: "Ylang-Ylang", kategori: "cicek" },
  { id: "oud", ad: "Oud", kategori: "odunsu" },
  { id: "sandal", ad: "Sandal Ağacı", kategori: "odunsu" },
  { id: "sedir", ad: "Sedir", kategori: "odunsu" },
  { id: "vetiver", ad: "Vetiver", kategori: "odunsu" },
  { id: "paculi", ad: "Paçuli", kategori: "odunsu" },
  { id: "mese_yosunu", ad: "Meşe Yosunu", kategori: "yesil" },
  { id: "cay", ad: "Çay", kategori: "yesil" },
  { id: "nane", ad: "Nane", kategori: "yesil" },
  { id: "adacayi", ad: "Adaçayı", kategori: "yesil" },
  { id: "tutsu", ad: "Tütsü", kategori: "recine" },
  { id: "amber", ad: "Amber", kategori: "recine" },
  { id: "tutun", ad: "Tütün", kategori: "recine" },
  { id: "deri", ad: "Deri", kategori: "hayvansal" },
  { id: "misk", ad: "Misk", kategori: "hayvansal" },
  { id: "deniz_tuzu", ad: "Deniz Tuzu", kategori: "su" },
  { id: "su_notalari", ad: "Su Notaları", kategori: "su" },
  { id: "armut", ad: "Armut", kategori: "meyve" },
  { id: "erik", ad: "Erik", kategori: "meyve" },
  { id: "nar", ad: "Nar", kategori: "meyve" },
  { id: "frezya", ad: "Frezya", kategori: "cicek" },
  { id: "manolya", ad: "Manolya", kategori: "cicek" },
  { id: "yesil_yapraklar", ad: "Yeşil Yapraklar", kategori: "yesil" },
  { id: "feslegen", ad: "Fesleğen", kategori: "yesil" },
];

export const NOTA_MAP: Record<string, Nota> = Object.fromEntries(
  NOTALAR.map((n) => [n.id, n])
);

export const notaAd = (id: string) => NOTA_MAP[id]?.ad ?? id;

// Rozet renkleri: narenciye=sarı, çiçek=pembe, odunsu=kahve, amber=altın... (Bölüm 10)
export const KATEGORI_RENK: Record<NotaKategori, string> = {
  narenciye: "#e8c547",
  meyve: "#e07a5f",
  cicek: "#d98ca6",
  yesil: "#5b9b7a",
  baharat: "#c65f3f",
  tatli: "#d9a05b",
  odunsu: "#a1785a",
  recine: "#d99b6a",
  hayvansal: "#9c8a7d",
  su: "#6da8c9",
};
