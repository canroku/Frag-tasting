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
  emoji: string;
}

export const NOTALAR: Nota[] = [
  { id: "bergamot", ad: "Bergamot", kategori: "narenciye" , emoji: "🍋" },
  { id: "limon", ad: "Limon", kategori: "narenciye" , emoji: "🍋" },
  { id: "greyfurt", ad: "Greyfurt", kategori: "narenciye" , emoji: "🍊" },
  { id: "mandalina", ad: "Mandalina", kategori: "narenciye" , emoji: "🍊" },
  { id: "portakal_cicegi", ad: "Portakal Çiçeği", kategori: "cicek" , emoji: "🌼" },
  { id: "neroli", ad: "Neroli", kategori: "cicek" , emoji: "🌸" },
  { id: "elma", ad: "Elma", kategori: "meyve" , emoji: "🍎" },
  { id: "ananas", ad: "Ananas", kategori: "meyve" , emoji: "🍍" },
  { id: "seftali", ad: "Şeftali", kategori: "meyve" , emoji: "🍑" },
  { id: "ahududu", ad: "Ahududu", kategori: "meyve" , emoji: "🍓" },
  { id: "kiraz", ad: "Kiraz", kategori: "meyve" , emoji: "🍒" },
  { id: "frenk_uzumu", ad: "Frenk Üzümü", kategori: "meyve" , emoji: "🫐" },
  { id: "incir", ad: "İncir", kategori: "meyve" , emoji: "🍇" },
  { id: "hindistan_cevizi", ad: "Hindistan Cevizi", kategori: "tatli" , emoji: "🥥" },
  { id: "vanilya", ad: "Vanilya", kategori: "tatli" , emoji: "🍦" },
  { id: "tonka", ad: "Tonka Fasulyesi", kategori: "tatli" , emoji: "🫘" },
  { id: "karamel", ad: "Karamel", kategori: "tatli" , emoji: "🍮" },
  { id: "bal", ad: "Bal", kategori: "tatli" , emoji: "🍯" },
  { id: "kahve", ad: "Kahve", kategori: "tatli" , emoji: "☕" },
  { id: "cikolata", ad: "Çikolata", kategori: "tatli" , emoji: "🍫" },
  { id: "badem", ad: "Badem", kategori: "tatli" , emoji: "🌰" },
  { id: "pudra", ad: "Pudra", kategori: "tatli" , emoji: "☁️" },
  { id: "tarcin", ad: "Tarçın", kategori: "baharat" , emoji: "🥮" },
  { id: "karabiber", ad: "Karabiber", kategori: "baharat" , emoji: "🌶️" },
  { id: "pembe_biber", ad: "Pembe Biber", kategori: "baharat" , emoji: "🌶️" },
  { id: "safran", ad: "Safran", kategori: "baharat" , emoji: "🌾" },
  { id: "kakule", ad: "Kakule", kategori: "baharat" , emoji: "🫚" },
  { id: "zencefil", ad: "Zencefil", kategori: "baharat" , emoji: "🫚" },
  { id: "gul", ad: "Gül", kategori: "cicek" , emoji: "🌹" },
  { id: "yasemin", ad: "Yasemin", kategori: "cicek" , emoji: "🌼" },
  { id: "lavanta", ad: "Lavanta", kategori: "cicek" , emoji: "💜" },
  { id: "iris", ad: "İris", kategori: "cicek" , emoji: "🪻" },
  { id: "menekse", ad: "Menekşe", kategori: "cicek" , emoji: "🪻" },
  { id: "tuberoz", ad: "Tuberoz", kategori: "cicek" , emoji: "🌸" },
  { id: "ylang", ad: "Ylang-Ylang", kategori: "cicek" , emoji: "🌺" },
  { id: "oud", ad: "Oud", kategori: "odunsu" , emoji: "🪵" },
  { id: "sandal", ad: "Sandal Ağacı", kategori: "odunsu" , emoji: "🪵" },
  { id: "sedir", ad: "Sedir", kategori: "odunsu" , emoji: "🌲" },
  { id: "vetiver", ad: "Vetiver", kategori: "odunsu" , emoji: "🌾" },
  { id: "paculi", ad: "Paçuli", kategori: "odunsu" , emoji: "🍂" },
  { id: "mese_yosunu", ad: "Meşe Yosunu", kategori: "yesil" , emoji: "🍃" },
  { id: "cay", ad: "Çay", kategori: "yesil" , emoji: "🍵" },
  { id: "nane", ad: "Nane", kategori: "yesil" , emoji: "🌿" },
  { id: "adacayi", ad: "Adaçayı", kategori: "yesil" , emoji: "🌿" },
  { id: "tutsu", ad: "Tütsü", kategori: "recine" , emoji: "🪔" },
  { id: "amber", ad: "Amber", kategori: "recine" , emoji: "✨" },
  { id: "tutun", ad: "Tütün", kategori: "recine" , emoji: "🍂" },
  { id: "deri", ad: "Deri", kategori: "hayvansal" , emoji: "🧥" },
  { id: "misk", ad: "Misk", kategori: "hayvansal" , emoji: "🦌" },
  { id: "deniz_tuzu", ad: "Deniz Tuzu", kategori: "su" , emoji: "🌊" },
  { id: "su_notalari", ad: "Su Notaları", kategori: "su" , emoji: "💧" },
  { id: "armut", ad: "Armut", kategori: "meyve" , emoji: "🍐" },
  { id: "erik", ad: "Erik", kategori: "meyve" , emoji: "🍇" },
  { id: "nar", ad: "Nar", kategori: "meyve" , emoji: "🍎" },
  { id: "frezya", ad: "Frezya", kategori: "cicek" , emoji: "🌷" },
  { id: "manolya", ad: "Manolya", kategori: "cicek" , emoji: "🌸" },
  { id: "yesil_yapraklar", ad: "Yeşil Yapraklar", kategori: "yesil" , emoji: "🍃" },
  { id: "feslegen", ad: "Fesleğen", kategori: "yesil" , emoji: "🌿" },
  { id: "kakao", ad: "Kakao", kategori: "tatli", emoji: "🍫" },
  { id: "seker_kamisi", ad: "Şeker Kamışı", kategori: "tatli", emoji: "🎋" },
  { id: "gardenya", ad: "Gardenya", kategori: "cicek", emoji: "🌼" },
  { id: "sumbul", ad: "Sümbül", kategori: "cicek", emoji: "🪻" },
  { id: "benzoin", ad: "Benzoin", kategori: "recine", emoji: "🪔" },
  { id: "biberiye", ad: "Biberiye", kategori: "yesil", emoji: "🌿" },
  { id: "konyak", ad: "Konyak", kategori: "tatli", emoji: "🥃" },
  { id: "rom", ad: "Rom", kategori: "tatli", emoji: "🥃" },
  { id: "hurma", ad: "Hurma", kategori: "meyve", emoji: "🌴" },
  { id: "ambrette", ad: "Ambrette", kategori: "hayvansal", emoji: "🌾" },
  { id: "ardic", ad: "Ardıç", kategori: "yesil", emoji: "🌲" },
  { id: "muskat", ad: "Muskat", kategori: "baharat", emoji: "🌰" },
  { id: "kisnis", ad: "Kişniş", kategori: "baharat", emoji: "🌿" },
  { id: "nilufer", ad: "Nilüfer", kategori: "cicek", emoji: "🪷" },
  { id: "kavun", ad: "Kavun", kategori: "meyve", emoji: "🍈" },
  { id: "sardunya", ad: "Sardunya", kategori: "cicek", emoji: "🌺" },
  { id: "sakayik", ad: "Şakayık", kategori: "cicek", emoji: "🌸" },
  { id: "portakal", ad: "Portakal", kategori: "narenciye", emoji: "🍊" },
];

export const NOTA_MAP: Record<string, Nota> = Object.fromEntries(
  NOTALAR.map((n) => [n.id, n])
);

export const notaAd = (id: string) => NOTA_MAP[id]?.ad ?? id;

export const KATEGORI_ETIKET: Record<NotaKategori, string> = {
  narenciye: "Narenciye",
  meyve: "Meyveler",
  cicek: "Çiçekler",
  yesil: "Yeşil & Otsu",
  baharat: "Baharatlar",
  tatli: "Tatlı & Gurme",
  odunsu: "Odunsu",
  recine: "Reçine & Tütün",
  hayvansal: "Misk & Deri",
  su: "Su & Deniz",
};

export const KATEGORI_SIRA: NotaKategori[] = [
  "narenciye", "meyve", "cicek", "yesil", "baharat",
  "tatli", "odunsu", "recine", "hayvansal", "su",
];

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
