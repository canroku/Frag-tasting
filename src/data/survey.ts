import type { Aile } from "../engine/types";

// Bölüm 4B — Kişilik & Tarz sinyali → eğilimli koku aileleri haritası.
// Her seçenek ailelere puan verir; istenirse notalara da yumuşak ağırlık ekler.
export interface KisilikSecenek {
  id: string;
  etiket: string;
  emoji: string;
  aileler: Partial<Record<Aile, number>>;
  notalar?: string[]; // seçilince bu notalara yumuşak pozitif ağırlık (0.65)
}

export interface KisilikSoru {
  id: string;
  grup: string;
  soru: string;
  aciklama?: string;
  secenekler: KisilikSecenek[];
}

export const KISILIK_SORULARI: KisilikSoru[] = [
  {
    id: "davet",
    grup: "Kişilik & Tarz",
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
    grup: "Kişilik & Tarz",
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
    grup: "Kişilik & Tarz",
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

// Hızlı seçim turu — az kelime, net sinyal: zevki keskinleştiren ek sorular.
// Cevaplar hem aile hem nota vektörüne yumuşak ağırlık ekler.
export const HIZLI_SORULAR: KisilikSoru[] = [
  {
    id: "tatlilik",
    grup: "Hızlı Seçim",
    soru: "Tatlılık ayarın?",
    secenekler: [
      { id: "az", etiket: "Az şeker — kuru ve temiz", emoji: "🍋", aileler: { yesil: 0.7, narenciye: 0.6, odunsu: 0.5 } },
      { id: "orta", etiket: "Dengeli bir dokunuş", emoji: "🫧", aileler: { cicek: 0.6, fujer: 0.5 }, notalar: ["tonka"] },
      { id: "tam", etiket: "Tam şeker — tatlı aksın", emoji: "🍯", aileler: { gurme: 1 }, notalar: ["vanilya", "karamel", "bal"] },
    ],
  },
  {
    id: "sicaklik",
    grup: "Hızlı Seçim",
    soru: "Sıcak mı, ferah mı?",
    secenekler: [
      { id: "sicak", etiket: "Sıcak & sarmalayan", emoji: "🔥", aileler: { amber: 0.9, gurme: 0.6 }, notalar: ["amber", "tarcin"] },
      { id: "denge", etiket: "Mevsimine göre", emoji: "🌗", aileler: { odunsu: 0.5, cicek: 0.4 } },
      { id: "ferah", etiket: "Ferah & esintili", emoji: "🌬️", aileler: { narenciye: 0.8, aromatik: 0.8, yesil: 0.6 }, notalar: ["bergamot", "limon"] },
    ],
  },
  {
    id: "karakter",
    grup: "Hızlı Seçim",
    soru: "Temiz sabun mu, dumanlı tütsü mü?",
    secenekler: [
      { id: "temiz", etiket: "Duştan yeni çıkmış temizlik", emoji: "🧼", aileler: { aromatik: 0.7, cicek: 0.5 }, notalar: ["misk", "pudra"] },
      { id: "ikisi", etiket: "Ruh hâlime göre ikisi de", emoji: "🎭", aileler: {} },
      { id: "dumanli", etiket: "Dumanlı, derin, tenli", emoji: "🪔", aileler: { amber: 0.8, deri: 0.7, odunsu: 0.5 }, notalar: ["tutsu", "oud", "deri"] },
    ],
  },
  {
    id: "cag",
    grup: "Hızlı Seçim",
    soru: "Klasik zarafet mi, modern minimalizm mi?",
    secenekler: [
      { id: "klasik", etiket: "Zamansız klasikler", emoji: "🕰️", aileler: { sipr: 0.8, cicek: 0.6 }, notalar: ["iris", "pudra", "mese_yosunu"] },
      { id: "karisik", etiket: "İyi olan her şey", emoji: "🎲", aileler: {} },
      { id: "modern", etiket: "Modern & minimal", emoji: "◽", aileler: { odunsu: 0.6, aromatik: 0.6 }, notalar: ["misk", "amber", "sedir"] },
    ],
  },
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
