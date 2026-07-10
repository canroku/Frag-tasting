// Topluluk istatistikleri (demo) — Fragrantica tarzı RATING ve WHEN TO WEAR
// blokları için katalog etiketlerinden türetilmiş, parfüm başına deterministik
// sözde-topluluk verisi. Gerçek dağıtımda bu katman kullanıcı oylarından beslenir.
import type { Parfum } from "./types";

// id'den deterministik 0-1 arası sözde rastgele değer
function hash01(metin: string, tuz = 0): number {
  let h = 2166136261 ^ tuz;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export interface ToplulukVerisi {
  puan: number; // 5 üzerinden
  oySayisi: number;
  dagilim: { etiket: string; emoji: string; oran: number; sayi: number }[];
  neZaman: { etiket: string; emoji: string; oran: number }[];
}

export function toplulukVerisi(p: Parfum): ToplulukVerisi {
  const gurultu = hash01(p.id) * 0.3 - 0.15;
  const puan = Math.min(4.9, Math.max(3.2, 3.45 + p.populerlik * 1.35 + gurultu));
  const oySayisi = Math.round(600 + hash01(p.id, 7) * 14000 * (0.3 + p.populerlik));

  // beğeni dağılımı: popülerlik yükseldikçe "bayıldım" ağır basar
  const sev = 0.22 + p.populerlik * 0.33 + hash01(p.id, 1) * 0.06;
  const begen = 0.28 + hash01(p.id, 2) * 0.08;
  const idare = 0.16 - p.populerlik * 0.05 + hash01(p.id, 3) * 0.05;
  const olmadi = 0.1 - p.populerlik * 0.04 + hash01(p.id, 4) * 0.04;
  const hic = 0.04 + hash01(p.id, 5) * 0.02;
  const toplam = sev + begen + idare + olmadi + hic;

  const dagilimHam: [string, string, number][] = [
    ["Bayıldım", "😍", sev / toplam],
    ["Beğendim", "🙂", begen / toplam],
    ["İdare eder", "😐", idare / toplam],
    ["Sarmadı", "🙁", olmadi / toplam],
    ["Hiç olmadı", "😖", hic / toplam],
  ];
  const dagilim = dagilimHam.map(([etiket, emoji, oran]) => ({
    etiket,
    emoji,
    oran,
    sayi: Math.round(oran * oySayisi),
  }));

  const gunduz =
    ((p.ortam.gunluk ?? 0) + (p.ortam.is ?? 0) + (p.ortam.spor ?? 0)) / 3;
  const neZaman = [
    { etiket: "Kış", emoji: "❄️", oran: p.mevsim.kis },
    { etiket: "İlkbahar", emoji: "🌷", oran: p.mevsim.ilkbahar },
    { etiket: "Yaz", emoji: "☀️", oran: p.mevsim.yaz },
    { etiket: "Sonbahar", emoji: "🍂", oran: p.mevsim.sonbahar },
    { etiket: "Gündüz", emoji: "🌤️", oran: gunduz },
    { etiket: "Gece", emoji: "🌙", oran: p.ortam.gece ?? 0 },
  ];

  return { puan, oySayisi, dagilim, neZaman };
}

export function oyFormat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}B` : String(n);
}
