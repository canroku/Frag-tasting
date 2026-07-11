// Doküman Bölüm 5 — Veri Modeli (Parfüm & Kullanıcı)

export type Cinsiyet = "kadin" | "erkek" | "unisex";
export type Fiyat = "ekonomik" | "orta" | "luks";
export type Deneyim = "ilk_kez" | "ara_sira" | "merakli" | "koleksiyoner";
export type Mevsim = "ilkbahar" | "yaz" | "sonbahar" | "kis";
export type Ortam = "gunluk" | "is" | "gece" | "ozel" | "spor";

// 10 koku ailesi taksonomisi (Bölüm 5)
export type Aile =
  | "narenciye"
  | "cicek"
  | "odunsu"
  | "amber"
  | "fujer"
  | "sipr"
  | "gurme"
  | "aromatik"
  | "yesil"
  | "deri";

export const AILELER: Aile[] = [
  "narenciye",
  "cicek",
  "odunsu",
  "amber",
  "fujer",
  "sipr",
  "gurme",
  "aromatik",
  "yesil",
  "deri",
];

// Şişe görselleri ve etiketler için aile renkleri
export const AILE_RENK: Record<Aile, string> = {
  narenciye: "#e8c547",
  cicek: "#d98ca6",
  odunsu: "#a1785a",
  amber: "#d99b6a",
  fujer: "#7fa98a",
  sipr: "#8a7f5c",
  gurme: "#d9a05b",
  aromatik: "#6da8c9",
  yesil: "#5b9b7a",
  deri: "#8f7361",
};

export const AILE_ETIKET: Record<Aile, string> = {
  narenciye: "Narenciye / Fresh",
  cicek: "Çiçeksi",
  odunsu: "Odunsu",
  amber: "Oryantal / Amber",
  fujer: "Fujer",
  sipr: "Şipr",
  gurme: "Gurme",
  aromatik: "Aromatik / Su",
  yesil: "Yeşil",
  deri: "Deri",
};

export interface Parfum {
  id: string;
  ad: string;
  marka: string;
  yil: number;
  cinsiyet: Cinsiyet;
  aileler: Partial<Record<Aile, number>>;
  notalar: { tepe: string[]; kalp: string[]; dip: string[] };
  mevsim: Record<Mevsim, number>;
  ortam: Partial<Record<Ortam, number>>;
  yogunluk: number; // 0 = hafif .. 1 = çok güçlü
  kalicilik: number;
  nis_mi: boolean;
  fiyat_seviyesi: Fiyat;
  populerlik: number; // crowd-pleaser sinyali
  // Yoksa çalışma anında marka+ad ile arama linki üretilir (fragranticaLink)
  fragrantica_url?: string;
  // Lisanslı gerçek ürün fotoğrafı (opsiyonel). Ayarlanırsa illüstrasyon
  // yerine bu görsel gösterilir. Telifli görseller katalogda tutulmaz;
  // alan, kendi lisanslı görsellerinizi bağlamanız içindir.
  gorsel_url?: string;
  // Gerçek topluluk verisi (açık veri setinden). Varsa detay panelindeki
  // puan/oy blokları sentetik değil bu değerlerle beslenir.
  topluluk_puan?: number; // 5 üzerinden
  topluluk_oy?: number;
}

// Anket cevapları (Bölüm 4)
export interface AnketCevaplari {
  yas: "<18" | "18-24" | "25-34" | "35-44" | "45+";
  hedef_cinsiyet: Cinsiyet | "fark_etmez";
  cinsiyet_kesin: boolean; // sert filtre mi, yumuşak tercih mi
  deneyim: Deneyim;
  butce: Fiyat | "fark_etmez";
  kisilik: string[]; // seçilen kişilik/tarz seçenek id'leri
  sevilen_notalar: string[];
  sevilmeyen_notalar: string[];
  tohum_parfumler: string[]; // referans parfüm id'leri (cold start)
  mevsimler: Mevsim[];
  aylar: number[]; // 1-12
  ortamlar: Ortam[];
  hedef_yogunluk: number;
  hedef_kalicilik: number;
}

// Türetilmiş tercih vektörü (Bölüm 6.1)
export interface ProfilVektoru {
  nota: Record<string, number>; // 0-1 ağırlıklar
  sevilmeyen: string[];
  aile: Record<Aile, number>;
  mevsim: Record<Mevsim, number>;
  ortam: Record<Ortam, number>;
  yogunluk: number;
  kalicilik: number;
  deneyim: Deneyim;
  butce: Fiyat | "fark_etmez";
  cinsiyet: Cinsiyet | "fark_etmez";
  cinsiyet_kesin: boolean;
  tohum?: string[]; // referans parfümler — öneri listesinden hariç tutulur
}

export interface Oneri {
  parfum: Parfum;
  skor: number; // 0-1 normalize uyum puanı
  neden: string[]; // "neden önerildi" rozetleri
}

// Fragrantica yalnızca yönlendirme hedefi (Bölüm 9) — kayıtta url yoksa
// marka+ad ile arama linki üretilir, böylece binlerce kayıtta url saklanmaz.
export function fragranticaLink(p: Parfum): string {
  return (
    p.fragrantica_url ??
    `https://www.fragrantica.com/search/?query=${encodeURIComponent(`${p.marka} ${p.ad}`)}`
  );
}
