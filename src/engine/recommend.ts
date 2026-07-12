// Bölüm 6 — Öneri Algoritması Çekirdeği
// Akış: Vektörleştir → Sert Filtrele → Puanla → Çeşitlendir (MMR) → İlk 10-15
import type { Parfum, ProfilVektoru, Oneri, Mevsim, Ortam, Aile } from "./types";
import { AILE_ETIKET } from "./types";
import { cos, clamp01, parfumNotaVektoru, parfumAileVektoru, parfumBenzerlik } from "./vector";
import { notaAd } from "../data/notes";

// Önerilen başlangıç ağırlıkları (Bölüm 6.2, toplam ≈ 1)
export const W = {
  nota: 0.35, // en güçlü sinyal
  aile: 0.2,
  mevsim: 0.15,
  ortam: 0.1,
  yogunluk: 0.1,
  deneyim: 0.1,
  cezaKatsayi: 0.25, // her sevilmeyen nota eşleşmesi için −0.25
};

function sevilmeyenNotaSayisi(u: ProfilVektoru, p: Parfum): number {
  const hepsi = [...p.notalar.tepe, ...p.notalar.kalp, ...p.notalar.dip];
  return u.sevilmeyen.filter((n) => hepsi.includes(n)).length;
}

function mevsimUyum(u: ProfilVektoru, p: Parfum): number {
  const mevsimler = Object.entries(u.mevsim).filter(([, w]) => w > 0);
  if (mevsimler.length === 0) return 0.5; // tercih yoksa nötr
  let top = 0;
  let agirlik = 0;
  for (const [m, w] of mevsimler) {
    top += w * p.mevsim[m as Mevsim];
    agirlik += w;
  }
  return top / agirlik;
}

function ortamUyum(u: ProfilVektoru, p: Parfum): number {
  const ortamlar = Object.entries(u.ortam).filter(([, w]) => w > 0);
  if (ortamlar.length === 0) return 0.5;
  let top = 0;
  let agirlik = 0;
  for (const [o, w] of ortamlar) {
    top += w * (p.ortam[o as Ortam] ?? 0);
    agirlik += w;
  }
  return top / agirlik;
}

// Bölüm 6.5 — Deneyim uyumu
function deneyimUyum(u: ProfilVektoru, p: Parfum): number {
  const yenilik = 1 - p.populerlik;
  switch (u.deneyim) {
    case "ilk_kez":
      return p.populerlik; // sevilen, giyilebilir kokular öne çıkar
    case "ara_sira":
      return 0.8 * p.populerlik + 0.2 * yenilik;
    case "merakli":
      return 0.5 * p.populerlik + 0.5 * yenilik + (p.nis_mi ? 0.15 : 0);
    case "koleksiyoner":
      return (p.nis_mi ? 0.8 : 0.25) + 0.2 * yenilik; // niş + yenilik bonusu
  }
}

// Bölüm 6.3 — Sert filtreler (puanlamadan ÖNCE uygulanır)
export function sertFiltre(
  katalog: Parfum[],
  u: ProfilVektoru,
  haric: Set<string> = new Set()
): Parfum[] {
  return katalog.filter((p) => {
    if (haric.has(p.id)) return false; // daha önce önerilen / favori (istenirse)
    if (u.butce !== "fark_etmez" && butceAsar(p.fiyat_seviyesi, u.butce)) return false;
    if (u.cinsiyet_kesin && u.cinsiyet !== "fark_etmez") {
      if (p.cinsiyet !== u.cinsiyet && p.cinsiyet !== "unisex") return false;
    }
    if (sevilmeyenNotaSayisi(u, p) >= 3) return false; // çok sayıda sevilmeyen nota → ele
    return true;
  });
}

const FIYAT_SIRA = { ekonomik: 0, orta: 1, luks: 2 } as const;
function butceAsar(fiyat: keyof typeof FIYAT_SIRA, butce: keyof typeof FIYAT_SIRA): boolean {
  return FIYAT_SIRA[fiyat] > FIYAT_SIRA[butce];
}

// Bölüm 6.2 — Puanlama formülü S(p)
export function puanla(u: ProfilVektoru, p: Parfum): number {
  const notaBenzerlik = cos(u.nota, parfumNotaVektoru(p));
  const aileBenzerlik = cos(u.aile as Record<string, number>, parfumAileVektoru(p));
  const yumusakCinsiyet =
    !u.cinsiyet_kesin && u.cinsiyet !== "fark_etmez" && p.cinsiyet !== u.cinsiyet && p.cinsiyet !== "unisex"
      ? -0.08 // yumuşak tercih: elenmez ama hafif geriler
      : 0;

  return (
    W.nota * notaBenzerlik +
    W.aile * aileBenzerlik +
    W.mevsim * mevsimUyum(u, p) +
    W.ortam * ortamUyum(u, p) +
    W.yogunluk * (1 - Math.abs(u.yogunluk - p.yogunluk)) +
    W.deneyim * deneyimUyum(u, p) -
    W.cezaKatsayi * sevilmeyenNotaSayisi(u, p) +
    yumusakCinsiyet
  );
}

// Bölüm 6.4 — Maximal Marginal Relevance çeşitlendirmesi
export function mmrSec(adaylar: Parfum[], skorlar: Map<string, number>, n: number, lam = 0.7): Parfum[] {
  const secilenler: Parfum[] = [];
  const havuz = [...adaylar];
  while (secilenler.length < n && havuz.length > 0) {
    let enIyi = -1;
    let enIyiDeger = -Infinity;
    for (let i = 0; i < havuz.length; i++) {
      const p = havuz[i];
      const maxBenzer =
        secilenler.length === 0
          ? 0
          : Math.max(...secilenler.map((q) => parfumBenzerlik(p, q)));
      const deger = lam * (skorlar.get(p.id) ?? 0) - (1 - lam) * maxBenzer;
      if (deger > enIyiDeger) {
        enIyiDeger = deger;
        enIyi = i;
      }
    }
    secilenler.push(havuz.splice(enIyi, 1)[0]);
  }
  return secilenler;
}

const MEVSIM_AD: Record<Mevsim, string> = {
  ilkbahar: "ilkbahar", yaz: "yaz", sonbahar: "sonbahar", kis: "kış",
};
const ORTAM_AD: Record<Ortam, string> = {
  gunluk: "günlük", is: "iş", gece: "gece", ozel: "özel gün", spor: "spor",
};

// Bölüm 6.7 — her kartta kısa "neden önerildi" gerekçesi
export function nedenUret(u: ProfilVektoru, p: Parfum): string[] {
  const nedenler: string[] = [];

  const hepsiNotalar = [...p.notalar.tepe, ...p.notalar.kalp, ...p.notalar.dip];
  const eslesenNotalar = Object.entries(u.nota)
    .filter(([n, w]) => w >= 0.5 && hepsiNotalar.includes(n))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => notaAd(n));
  if (eslesenNotalar.length > 0) {
    nedenler.push(`Sevdiğin ${eslesenNotalar.join(", ").toLocaleLowerCase("tr")} notalarını taşıyor`);
  }

  const enIyiAile = Object.entries(p.aileler)
    .filter(([a]) => (u.aile[a as Aile] ?? 0) >= 0.6)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  if (enIyiAile) nedenler.push(`${AILE_ETIKET[enIyiAile[0] as Aile]} karakterin ile uyumlu`);

  const mevsimler = Object.entries(u.mevsim)
    .filter(([m, w]) => w > 0.5 && p.mevsim[m as Mevsim] >= 0.7)
    .map(([m]) => MEVSIM_AD[m as Mevsim]);
  const ortamlar = Object.entries(u.ortam)
    .filter(([o, w]) => w > 0.5 && (p.ortam[o as Ortam] ?? 0) >= 0.7)
    .map(([o]) => ORTAM_AD[o as Ortam]);
  if (mevsimler.length > 0 && ortamlar.length > 0) {
    nedenler.push(`${mevsimler.join(" ve ")} · ${ortamlar.join(", ")} kullanımına çok uygun`);
  } else if (mevsimler.length > 0) {
    nedenler.push(`${mevsimler.join(" ve ")} için ideal`);
  } else if (ortamlar.length > 0) {
    nedenler.push(`${ortamlar.join(", ")} kullanımına uygun`);
  }

  if (Math.abs(u.yogunluk - p.yogunluk) <= 0.15) {
    nedenler.push(u.yogunluk >= 0.7 ? "İstediğin gibi güçlü ve iz bırakan" : u.yogunluk <= 0.4 ? "İstediğin gibi hafif ve yakın" : "Tam istediğin dengede");
  }
  if (u.deneyim === "koleksiyoner" && p.nis_mi) nedenler.push("Niş ve özgün bir imza");
  if (u.deneyim === "ilk_kez" && p.populerlik >= 0.85) nedenler.push("Güvenli, çok sevilen bir seçim");

  return nedenler.slice(0, 3);
}

// Bölüm 6.7 — ana giriş noktası
export function oneriUret(
  u: ProfilVektoru,
  katalog: Parfum[],
  opts: { n?: number; haric?: Set<string> } = {}
): Oneri[] {
  const { n = 12, haric = new Set<string>() } = opts;

  // Tohum parfümler kullanıcının zaten bildiği kokulardır — önerilmez
  const tumHaric = new Set(haric);
  for (const id of u.tohum ?? []) tumHaric.add(id);

  // 1-2) Vektörler hazır; sert filtreler
  let adaylar = sertFiltre(katalog, u, tumHaric);
  // filtre her şeyi elediyse geri çekil (boş sonuç yerine hariç listesini bırak)
  if (adaylar.length < 5) adaylar = sertFiltre(katalog, u);

  // MOBİL PERFORMANS: 29 binlik katalogda tüm adayları tam puanlamak telefonu
  // kilitler. Çok fazla aday varsa önce ucuz bir anahtarla (popülerlik +
  // topluluk puanı) en umut verici ~1200'e indir, sonra tam puanla.
  if (adaylar.length > 1200) {
    adaylar = adaylar
      .map((p) => ({ p, on: p.populerlik + (p.topluluk_puan ?? 0) / 5 }))
      .sort((a, b) => b.on - a.on)
      .slice(0, 1200)
      .map((x) => x.p);
  }

  // 3) Puanla ve sırala
  const skorlar = new Map<string, number>();
  for (const p of adaylar) skorlar.set(p.id, puanla(u, p));
  adaylar.sort((a, b) => (skorlar.get(b.id) ?? 0) - (skorlar.get(a.id) ?? 0));

  // 4) İlk 60 aday içinden MMR ile çeşitlendir
  const secilenler = mmrSec(adaylar.slice(0, 60), skorlar, n, 0.7);

  // 5) "Neden önerildi" açıklaması + 0-1 normalize skor
  const maxSkor = Math.max(...secilenler.map((p) => skorlar.get(p.id) ?? 0), 1e-9);
  return secilenler.map((p) => ({
    parfum: p,
    skor: clamp01((skorlar.get(p.id) ?? 0) / maxSkor),
    neden: nedenUret(u, p),
  }));
}

// Bölüm 7 — "Buna benzer": nota/aile benzerliğiyle en yakın komşular
export function bunaBenzer(kaynak: Parfum, katalog: Parfum[], n = 6): Parfum[] {
  return katalog
    .filter((p) => p.id !== kaynak.id)
    .map((p) => ({ p, b: parfumBenzerlik(kaynak, p) }))
    .sort((a, b) => b.b - a.b)
    .slice(0, n)
    .map((x) => x.p);
}

const FIYAT_DEGER = { ekonomik: 0, orta: 1, luks: 2 } as const;

// Muadil bulucu: kaynak parfüme koku olarak yakın AMA daha uygun fiyatlı
// alternatifler. Parfüm topluluğunun en sevdiği "dupe" özelliği.
export function muadilBul(kaynak: Parfum, katalog: Parfum[], n = 5): { parfum: Parfum; benzerlik: number }[] {
  const kaynakFiyat = FIYAT_DEGER[kaynak.fiyat_seviyesi];
  return katalog
    .filter(
      (p) =>
        p.id !== kaynak.id &&
        FIYAT_DEGER[p.fiyat_seviyesi] < kaynakFiyat // daha ucuz kademe
    )
    .map((p) => ({ parfum: p, benzerlik: parfumBenzerlik(kaynak, p) }))
    .filter((x) => x.benzerlik >= 0.45) // gerçekten benzer olanlar
    .sort((a, b) => b.benzerlik - a.benzerlik)
    .slice(0, n);
}
