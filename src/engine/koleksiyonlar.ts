// Editoryal koleksiyonlar — katalogdan kural tabanlı üretilen temalı seçkiler.
// Her koleksiyon bir filtre + sıralama tanımıdır; "keşif dergisi" hissi verir.
import type { Parfum } from "./types";

export interface Koleksiyon {
  id: string;
  baslik: string;
  emoji: string;
  aciklama: string;
  sec: (katalog: Parfum[]) => Parfum[];
}

// yüksek puan + yeterli oy: gerçek topluluk sinyali olanları öne al
const puanli = (p: Parfum) => (p.topluluk_oy ?? 0) >= 150;
const puan = (p: Parfum) => p.topluluk_puan ?? 0;
const oy = (p: Parfum) => p.topluluk_oy ?? 0;

function sirala(katalog: Parfum[], filtre: (p: Parfum) => boolean, anahtar: (p: Parfum) => number, n = 20): Parfum[] {
  return katalog.filter(filtre).sort((a, b) => anahtar(b) - anahtar(a)).slice(0, n);
}

export const KOLEKSIYONLAR: Koleksiyon[] = [
  {
    id: "efsaneler",
    baslik: "Efsaneler",
    emoji: "🏆",
    aciklama: "Topluluğun en yüksek puanladığı, binlerce oyla kanıtlanmış klasikler.",
    sec: (k) => sirala(k, (p) => puanli(p) && oy(p) >= 1000, (p) => puan(p) * 1000 + oy(p) / 1000),
  },
  {
    id: "kis-gecesi",
    baslik: "Kış Gecesi",
    emoji: "❄️",
    aciklama: "Soğuk akşamları saran sıcak amber, gurme ve baharatlı kokular.",
    sec: (k) => sirala(k, (p) => p.mevsim.kis >= 0.8 && (p.ortam.gece ?? 0) >= 0.7 && puan(p) >= 3.6, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "yaz-ferahligi",
    baslik: "Yaz Ferahlığı",
    emoji: "☀️",
    aciklama: "Sıcakta nefes aldıran narenciye, su ve yeşil notalı ferah seçkiler.",
    sec: (k) => sirala(k, (p) => p.mevsim.yaz >= 0.8 && ((p.aileler.narenciye ?? 0) >= 0.5 || (p.aileler.aromatik ?? 0) >= 0.5) && puan(p) >= 3.5, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "ofis-dostu",
    baslik: "Ofis Dostu",
    emoji: "💼",
    aciklama: "İş ortamında rahatsız etmeyen, dengeli ve temiz imza kokular.",
    sec: (k) => sirala(k, (p) => (p.ortam.is ?? 0) >= 0.7 && p.yogunluk <= 0.7 && puan(p) >= 3.6, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "gizli-cevherler",
    baslik: "Gizli Cevherler",
    emoji: "💎",
    aciklama: "Az bilinen ama yüksek puanlı niş kokular — kalabalıktan sıyrıl.",
    sec: (k) => sirala(k, (p) => p.nis_mi && puan(p) >= 3.9 && oy(p) >= 150 && oy(p) <= 2500, (p) => puan(p)),
  },
  {
    id: "butce-dostu",
    baslik: "Bütçe Dostu Cevherler",
    emoji: "💰",
    aciklama: "Uygun fiyata yüksek beğeni — cebi yakmayan kaliteli kokular.",
    sec: (k) => sirala(k, (p) => p.fiyat_seviyesi === "ekonomik" && puan(p) >= 3.6 && oy(p) >= 150, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "yeni-nesil",
    baslik: "Yeni Nesil",
    emoji: "🆕",
    aciklama: "2020 ve sonrası çıkan, hızla popülerleşen güncel kokular.",
    sec: (k) => sirala(k, (p) => p.yil >= 2020 && puan(p) >= 3.5 && oy(p) >= 150, (p) => oy(p) + puan(p) * 1000),
  },
  {
    id: "romantik-cicekler",
    baslik: "Romantik Çiçekler",
    emoji: "🌹",
    aciklama: "Zarif çiçeksi kompozisyonlar — özel anların imzası.",
    sec: (k) => sirala(k, (p) => (p.aileler.cicek ?? 0) >= 0.6 && (p.ortam.ozel ?? 0) >= 0.6 && puan(p) >= 3.6, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "imza-oud",
    baslik: "Oud & Doğu",
    emoji: "🕌",
    aciklama: "Oud, amber ve baharatın buluştuğu görkemli oryantal kokular.",
    sec: (k) => sirala(k, (p) => [...p.notalar.tepe, ...p.notalar.kalp, ...p.notalar.dip].includes("oud") && puan(p) >= 3.6, (p) => puan(p) + oy(p) / 50000),
  },
  {
    id: "tatli-gurme",
    baslik: "Tatlı Kaçamaklar",
    emoji: "🍯",
    aciklama: "Vanilya, karamel, kahve — sarılmak gibi kokan gurme seçkiler.",
    sec: (k) => sirala(k, (p) => (p.aileler.gurme ?? 0) >= 0.7 && puan(p) >= 3.6, (p) => puan(p) + oy(p) / 50000),
  },
];
