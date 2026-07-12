// Anlık durum önerisi + kombin (kıyafet) motoru.
// Kullanıcı "bugün ne var?" durumunu seçer → o ana uygun hızlı parfüm listesi;
// bir parfüm seçilince o duruma ve KULLANICININ CİNSİYETİNE göre kombin önerisi.
import type { Parfum, Ortam, Cinsiyet, ProfilVektoru, Aile } from "./types";
import { puanla } from "./recommend";

export interface Okazyon {
  id: string;
  emoji: string;
  ad: string;
  aciklama: string;
  ortam: Ortam;
  // bu ana uygun yoğunluk hedefi (hafif→güçlü)
  yogunluk: [number, number];
}

export const OKAZYONLAR: Okazyon[] = [
  { id: "randevu", emoji: "💕", ad: "Randevu", aciklama: "Yakından hissedilen, çekici, akılda kalan", ortam: "ozel", yogunluk: [0.5, 0.8] },
  { id: "is", emoji: "💼", ad: "İş / Toplantı", aciklama: "Temiz, dengeli, rahatsız etmeyen", ortam: "is", yogunluk: [0.3, 0.6] },
  { id: "gece", emoji: "🌃", ad: "Gece Çıkışı", aciklama: "İz bırakan, yoğun, iddialı", ortam: "gece", yogunluk: [0.7, 1] },
  { id: "gunluk", emoji: "🚶", ad: "Günlük", aciklama: "Her ana uyan, ferah", ortam: "gunluk", yogunluk: [0.3, 0.65] },
  { id: "spor", emoji: "🏃", ad: "Spor", aciklama: "Hafif, ferah, enerjik", ortam: "spor", yogunluk: [0.2, 0.5] },
  { id: "davet", emoji: "🥂", ad: "Özel Davet", aciklama: "Şık, kalıcı, sofistike", ortam: "ozel", yogunluk: [0.6, 0.9] },
];

// Ana uygun hızlı parfüm listesi — cinsiyet sert filtre; profil varsa puanlanır.
export function anlikOneriler(
  katalog: Parfum[],
  okazyon: Okazyon,
  cinsiyet: Cinsiyet | "fark_etmez",
  profil: ProfilVektoru | null,
  n = 8
): Parfum[] {
  const [yogMin, yogMax] = okazyon.yogunluk;
  const adaylar = katalog.filter((p) => {
    if (cinsiyet !== "fark_etmez" && p.cinsiyet !== cinsiyet && p.cinsiyet !== "unisex") return false;
    if ((p.ortam[okazyon.ortam] ?? 0) < 0.6) return false;
    if (p.yogunluk < yogMin - 0.15 || p.yogunluk > yogMax + 0.15) return false;
    if ((p.topluluk_oy ?? 0) > 0 && (p.topluluk_puan ?? 0) < 3.4) return false; // zayıfları ele
    return true;
  });

  const puan = (p: Parfum) => {
    const ortamUyum = p.ortam[okazyon.ortam] ?? 0;
    const yogMerkez = (yogMin + yogMax) / 2;
    const yogUyum = 1 - Math.abs(p.yogunluk - yogMerkez);
    const kisisel = profil ? puanla(profil, p) : (p.topluluk_puan ?? 3.5) / 5;
    return kisisel * 0.5 + ortamUyum * 0.3 + yogUyum * 0.2;
  };

  return adaylar.sort((a, b) => puan(b) - puan(a)).slice(0, n);
}

// ---------- Kombin (kıyafet) önerisi ----------
export interface Kombin {
  parcalar: string[]; // kıyafet parçaları
  palet: string;      // renk/doku önerisi (parfümün ailesinden)
  ipucu: string;      // stil ipucu (parfümle bağ)
}

// Duruma + cinsiyete göre temel kombin
const KOMBIN_TABAN: Record<string, { erkek: string[]; kadin: string[] }> = {
  randevu: {
    erkek: ["Lacivert ince triko", "koyu chino pantolon", "kahverengi deri bot", "sade bir saat"],
    kadin: ["Saten midi elbise", "ince topuklu ayakkabı", "zarif küpe", "küçük el çantası"],
  },
  is: {
    erkek: ["Açık gri gömlek", "lacivert blazer", "klasik kesim pantolon", "deri kemer"],
    kadin: ["Bej blazer", "krem ipek bluz", "düz kesim pantolon", "minimal kolye"],
  },
  gece: {
    erkek: ["Siyah gömlek", "koyu slim jean", "siyah Chelsea bot", "gümüş bileklik"],
    kadin: ["Siyah kokteyl elbise", "statement küpe", "yüksek topuklu", "clutch çanta"],
  },
  gunluk: {
    erkek: ["Beyaz tişört", "açık denim ceket", "bej pantolon", "temiz beyaz sneaker"],
    kadin: ["Oversize gömlek", "mom jean", "spor ayakkabı", "hasır omuz çantası"],
  },
  spor: {
    erkek: ["Nefes alan teknik tişört", "jogger eşofman", "hafif koşu ayakkabısı"],
    kadin: ["Yüksek bel tayt", "destekli spor üst", "hafif sneaker", "toka"],
  },
  davet: {
    erkek: ["Koyu lacivert takım", "beyaz gömlek", "ipek cep mendili", "cilalı oxford"],
    kadin: ["Uzun abiye elbise", "zarif topuz", "ince kemer", "minimal pırlanta takı"],
  },
};

// Parfüm ailesine göre renk/doku paleti
function paletOner(p: Parfum): string {
  const enIyi = (Object.entries(p.aileler).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "amber") as Aile;
  switch (enIyi) {
    case "amber": case "gurme": return "Sıcak tonlar: bordo, koyu kahve, altın detay";
    case "deri": return "Toprak tonları: haki, tütün kahvesi, süet doku";
    case "odunsu": return "Doğal tonlar: haki-yeşil, ceviz kahve, mat doku";
    case "narenciye": case "aromatik": return "Ferah tonlar: açık mavi, beyaz keten, gümüş detay";
    case "cicek": return "Yumuşak tonlar: toz pembe, lavanta, saten doku";
    case "sipr": case "fujer": return "Rafine tonlar: antrasit, lacivert, mat yün";
    case "yesil": return "Sakin tonlar: adaçayı yeşili, krem, keten doku";
    default: return "Nötr tonlar: krem, gri, doğal doku";
  }
}

function ipucuOner(p: Parfum, okazyon: Okazyon): string {
  if (p.yogunluk >= 0.8) return `${p.ad} yoğun bir koku — kıyafeti sade tut, bırak koku konuşsun.`;
  if (okazyon.id === "randevu") return `Yakın mesafede açılan bir koku; sıcak dokular ve zarif bir detayla tamamla.`;
  if (okazyon.id === "is") return `Fazla iddialı olma; nötr bir palet ${p.ad}'in temiz karakterini destekler.`;
  if (okazyon.id === "gece") return `Gece için koyu tonlar ve tek bir parlak aksesuar — koku zaten sahnede.`;
  if (okazyon.id === "spor") return `Hafif ve fonksiyonel kal; ${p.ad} enerjiyi tazeler.`;
  return `${p.ad} ile uyumlu, rahat ama özenli bir kombin.`;
}

export function kombinOner(p: Parfum, okazyon: Okazyon, cinsiyet: Cinsiyet | "fark_etmez"): Kombin {
  // Cinsiyet fark_etmez/unisex ise parfümün kendi cinsiyetine düş, o da unisex'se erkek tabanı
  const c: "erkek" | "kadin" =
    cinsiyet === "kadin" || cinsiyet === "erkek"
      ? cinsiyet
      : p.cinsiyet === "kadin" ? "kadin" : "erkek";
  const taban = KOMBIN_TABAN[okazyon.id][c];
  return {
    parcalar: taban,
    palet: paletOner(p),
    ipucu: ipucuOner(p, okazyon),
  };
}
