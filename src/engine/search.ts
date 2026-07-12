// Bölüm 7 — Arama & Keşif: serbest metin + filtreler + sıralama
import type { Parfum, ProfilVektoru, Aile, Mevsim, Ortam, Cinsiyet, Fiyat } from "./types";
import { AILE_ETIKET } from "./types";
import { NOTALAR, notaAd } from "../data/notes";
import { puanla } from "./recommend";

export interface AramaFiltre {
  metin: string;
  aile?: Aile;
  nota?: string;
  marka?: string;
  mevsim?: Mevsim;
  ortam?: Ortam;
  cinsiyet?: Cinsiyet;
  butce?: Fiyat;
  nis?: "nis" | "designer";
  siralama: "uygunluk" | "populerlik" | "yenilik" | "fiyat";
}

// Katalogdaki markaları parfüm sayısıyla, çoktan aza sıralı döndürür
export function markaListesi(katalog: Parfum[]): { marka: string; adet: number }[] {
  const sayim = new Map<string, number>();
  for (const p of katalog) sayim.set(p.marka, (sayim.get(p.marka) ?? 0) + 1);
  return [...sayim.entries()]
    .map(([marka, adet]) => ({ marka, adet }))
    .sort((a, b) => b.adet - a.adet || a.marka.localeCompare(b.marka, "tr"));
}

export const BOS_FILTRE: AramaFiltre = { metin: "", siralama: "uygunluk" };

const kucult = (s: string) => s.toLocaleLowerCase("tr");

// "koku", "parfüm" gibi ayırt edici olmayan kelimeler puanlamada yok sayılır
const DUR_KELIMELER = new Set([
  "koku", "kokusu", "kokular", "parfum", "parfüm", "bir", "icin", "için", "ve", "gibi",
]);

const MEVSIM_KELIME: Record<string, string[]> = {
  ilkbahar: ["ilkbahar", "bahar"],
  yaz: ["yaz", "yazlık", "yazlik"],
  sonbahar: ["sonbahar", "güz"],
  kis: ["kış", "kis", "kışlık", "kislik"],
};
const ORTAM_KELIME: Record<string, string[]> = {
  gunluk: ["günlük", "gunluk"],
  is: ["iş", "ofis"],
  gece: ["gece"],
  ozel: ["özel", "davet"],
  spor: ["spor"],
};

// Arama dizini: on binlerce kayıtta her tuş vuruşunda yeniden kurmamak
// için parfüm başına bir kez oluşturulup önbelleklenir.
const dizinOnbellek = new WeakMap<Parfum, string>();

function aramaDizini(p: Parfum): string {
  const hazir = dizinOnbellek.get(p);
  if (hazir) return hazir;
  const parcalar = [
    kucult(p.ad),
    kucult(p.marka),
    ...[...p.notalar.tepe, ...p.notalar.kalp, ...p.notalar.dip].map((n) => kucult(notaAd(n))),
    ...Object.keys(p.aileler).map((a) => kucult(AILE_ETIKET[a as Aile])),
  ];
  for (const [m, sozler] of Object.entries(MEVSIM_KELIME)) {
    if (p.mevsim[m as Mevsim] >= 0.6) parcalar.push(...sozler);
  }
  for (const [o, sozler] of Object.entries(ORTAM_KELIME)) {
    if ((p.ortam[o as Ortam] ?? 0) >= 0.6) parcalar.push(...sozler);
  }
  const dizin = parcalar.join(" ");
  dizinOnbellek.set(p, dizin);
  return dizin;
}

function metinPuani(p: Parfum, sorgu: string): number {
  if (!sorgu.trim()) return 1;
  const kelimeler = kucult(sorgu)
    .split(/\s+/)
    .filter((k) => k && !DUR_KELIMELER.has(k));
  if (kelimeler.length === 0) return 1;

  const hedef = aramaDizini(p);

  let puan = 0;
  for (const k of kelimeler) {
    if (hedef.includes(k)) {
      puan += 1;
      continue;
    }
    // "vanilyalı" → "vanilya" gibi Türkçe ekleri kademeli kırparak toleransla
    for (let kes = 1; kes <= 3 && k.length - kes >= 4; kes++) {
      if (hedef.includes(k.slice(0, k.length - kes))) {
        puan += 0.8;
        break;
      }
    }
  }
  return puan / kelimeler.length;
}

const FIYAT_SIRA = { ekonomik: 0, orta: 1, luks: 2 } as const;

export function ara(
  katalog: Parfum[],
  f: AramaFiltre,
  profil: ProfilVektoru | null
): Parfum[] {
  let sonuc = katalog.filter((p) => {
    if (f.aile && !(p.aileler[f.aile] && p.aileler[f.aile]! >= 0.4)) return false;
    if (f.nota) {
      const hepsi = [...p.notalar.tepe, ...p.notalar.kalp, ...p.notalar.dip];
      if (!hepsi.includes(f.nota)) return false;
    }
    if (f.mevsim && p.mevsim[f.mevsim] < 0.6) return false;
    if (f.ortam && (p.ortam[f.ortam] ?? 0) < 0.6) return false;
    if (f.marka && p.marka !== f.marka) return false;
    if (f.cinsiyet && p.cinsiyet !== f.cinsiyet && p.cinsiyet !== "unisex") return false;
    if (f.butce && p.fiyat_seviyesi !== f.butce) return false;
    if (f.nis === "nis" && !p.nis_mi) return false;
    if (f.nis === "designer" && p.nis_mi) return false;
    return metinPuani(p, f.metin) >= 0.5;
  });

  switch (f.siralama) {
    case "uygunluk": {
      // PERFORMANS: 'uygunluk' sıralaması puanla() gerektirir. Bunu doğrudan
      // sort karşılaştırıcısında çağırmak felakettir (n·log n kez ≈ yüz binlerce
      // hesap ve ana thread kilidi). Bunun yerine:
      //  1) Büyük listeyi önce UCUZ bir anahtarla en umut verici ~1500'e indir,
      //  2) her elemanın uygunluk skorunu TEK KEZ hesapla (decorate),
      //  3) hesaplanmış skora göre sırala.
      let havuz = sonuc;
      if (havuz.length > 1500) {
        havuz = havuz
          .map((p) => ({ p, on: p.populerlik + (p.topluluk_puan ?? 0) / 5 + metinPuani(p, f.metin) * 0.5 }))
          .sort((a, b) => b.on - a.on)
          .slice(0, 1500)
          .map((x) => x.p);
      }
      const skorlu = havuz.map((p) => ({
        p,
        s: (profil ? puanla(profil, p) : p.populerlik) + metinPuani(p, f.metin) * 0.5,
      }));
      skorlu.sort((a, b) => b.s - a.s);
      sonuc = skorlu.map((x) => x.p);
      break;
    }
    case "populerlik":
      sonuc.sort((a, b) => (b.topluluk_oy ?? 0) - (a.topluluk_oy ?? 0) || b.populerlik - a.populerlik);
      break;
    case "yenilik":
      sonuc.sort((a, b) => b.yil - a.yil);
      break;
    case "fiyat":
      sonuc.sort((a, b) => FIYAT_SIRA[a.fiyat_seviyesi] - FIYAT_SIRA[b.fiyat_seviyesi]);
      break;
  }
  return sonuc;
}

export { NOTALAR };
