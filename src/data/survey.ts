import type { Aile } from "../engine/types";

// Bölüm 4B — Kişilik & Tarz sinyali → eğilimli koku aileleri haritası
export interface KisilikSecenek {
  id: string;
  etiket: string;
  emoji: string;
  aileler: Partial<Record<Aile, number>>;
}

export interface KisilikSoru {
  id: string;
  soru: string;
  secenekler: KisilikSecenek[];
}

export const KISILIK_SORULARI: KisilikSoru[] = [
  {
    id: "davet",
    soru: "Kalabalık bir davette nasıl hissetmek istersin?",
    secenekler: [
      { id: "enerjik", etiket: "Enerjik ve canlı", emoji: "⚡", aileler: { narenciye: 1, aromatik: 0.8 } },
      { id: "zarif", etiket: "Zarif ve romantik", emoji: "🌹", aileler: { cicek: 1 } },
      { id: "gizemli", etiket: "Gizemli ve çekici", emoji: "🌙", aileler: { amber: 1, deri: 0.6 } },
      { id: "sicak", etiket: "Sıcak ve samimi", emoji: "🕯️", aileler: { gurme: 1, odunsu: 0.5 } },
      { id: "sakin", etiket: "Sakin ve doğal", emoji: "🌿", aileler: { yesil: 1, odunsu: 0.6 } },
      { id: "iddiali", etiket: "Güçlü ve iddialı", emoji: "🔥", aileler: { sipr: 0.8, amber: 0.7, odunsu: 0.5 } },
    ],
  },
  {
    id: "gardirop",
    soru: "Gardırobunda ağırlık hangi tarzda?",
    secenekler: [
      { id: "spor", etiket: "Spor & rahat", emoji: "👟", aileler: { aromatik: 1, narenciye: 0.7 } },
      { id: "klasik", etiket: "Klasik & şık", emoji: "🤵", aileler: { sipr: 1, cicek: 0.5 } },
      { id: "cesur", etiket: "Sokak & cesur", emoji: "🧥", aileler: { deri: 0.8, amber: 0.7 } },
      { id: "minimal", etiket: "Minimal & sade", emoji: "🤍", aileler: { yesil: 0.7, odunsu: 0.8 } },
      { id: "bohem", etiket: "Bohem & özgür", emoji: "🪶", aileler: { cicek: 0.7, amber: 0.6 } },
    ],
  },
  {
    id: "tanim",
    soru: "Bir kokunun seni nasıl tanımlamasını istersin?",
    secenekler: [
      { id: "ferah", etiket: "Ferah ve temiz", emoji: "💧", aileler: { narenciye: 0.8, aromatik: 0.8, yesil: 0.5 } },
      { id: "tatli", etiket: "Tatlı ve davetkâr", emoji: "🍯", aileler: { gurme: 1 } },
      { id: "sofistike", etiket: "Sofistike ve rafine", emoji: "🥂", aileler: { sipr: 1, cicek: 0.4 } },
      { id: "egzotik", etiket: "Egzotik ve derin", emoji: "🏺", aileler: { amber: 1, odunsu: 0.5 } },
      { id: "romantik", etiket: "Romantik ve sıcak", emoji: "💌", aileler: { cicek: 0.9, gurme: 0.4 } },
    ],
  },
];

// Bölüm 4C — anketten seçilebilir popüler notalar
export const ANKET_NOTALARI: string[] = [
  "vanilya", "gul", "oud", "sandal", "bergamot", "yasemin", "misk", "deri",
  "kahve", "lavanta", "paculi", "deniz_tuzu", "incir", "tutsu", "amber",
  "tonka", "tarcin", "safran", "iris", "limon", "elma", "ananas", "kiraz",
  "karamel", "cikolata", "bal", "tutun", "cay", "nane", "vetiver", "sedir",
  "hindistan_cevizi",
];

export const YAS_ARALIKLARI = ["<18", "18-24", "25-34", "35-44", "45+"] as const;

export const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// Ay → mevsim eşlemesi (Bölüm 4D: ay, mevsim ısı/hafiflik eğrisine map'lenir)
export const AY_MEVSIM: Record<number, "ilkbahar" | "yaz" | "sonbahar" | "kis"> = {
  1: "kis", 2: "kis", 3: "ilkbahar", 4: "ilkbahar", 5: "ilkbahar",
  6: "yaz", 7: "yaz", 8: "yaz", 9: "sonbahar", 10: "sonbahar",
  11: "sonbahar", 12: "kis",
};
