// Bölüm 4 + 6.1 + 6.6 — Anket cevaplarını tercih vektörüne çevirme ve tohum harmanı
import type { AnketCevaplari, ProfilVektoru, Aile, Mevsim, Ortam } from "./types";
import { AILELER } from "./types";
import { KISILIK_SORULARI, HIZLI_SORULAR, AY_MEVSIM } from "../data/survey";
import { PARFUM_MAP } from "../data/catalog";
import { parfumNotaVektoru, clamp01 } from "./vector";

function bosAile(): Record<Aile, number> {
  return Object.fromEntries(AILELER.map((a) => [a, 0])) as Record<Aile, number>;
}

export function profilVektoru(cevap: AnketCevaplari): ProfilVektoru {
  // --- Nota vektörü: sevilen notalar pozitif ağırlık (Bölüm 4C)
  const nota: Record<string, number> = {};
  for (const n of cevap.sevilen_notalar) nota[n] = 1.0;

  // --- Aile vektörü: kişilik/tarz + hızlı seçim cevapları aile puanı toplar (Bölüm 4B)
  const aile = bosAile();
  for (const soru of [...KISILIK_SORULARI, ...HIZLI_SORULAR]) {
    for (const sec of soru.secenekler) {
      if (!cevap.kisilik.includes(`${soru.id}:${sec.id}`)) continue;
      for (const [a, w] of Object.entries(sec.aileler)) {
        aile[a as Aile] += w as number;
      }
      // seçeneğin nota sinyali: açıkça seçilen notaları ezmeden yumuşak ekle
      for (const n of sec.notalar ?? []) {
        if (cevap.sevilmeyen_notalar.includes(n)) continue;
        nota[n] = Math.max(nota[n] ?? 0, 0.65);
      }
    }
  }

  // Yaş, koku eğilimlerini YUMUŞAK biçimde ağırlıklandırır — kesin kural değil (Bölüm 4A)
  if (cevap.yas === "<18" || cevap.yas === "18-24") {
    aile.gurme += 0.25;
    aile.narenciye += 0.2;
  } else if (cevap.yas === "35-44" || cevap.yas === "45+") {
    aile.sipr += 0.25;
    aile.odunsu += 0.2;
  }

  // Normalize: en yüksek aile 1.0 olacak şekilde
  const maxAile = Math.max(...Object.values(aile), 1e-9);
  for (const a of AILELER) aile[a] = clamp01(aile[a] / maxAile);

  // --- Mevsim vektörü: seçilen mevsimler + ayların yumuşak katkısı (Bölüm 4D)
  const mevsim: Record<Mevsim, number> = { ilkbahar: 0, yaz: 0, sonbahar: 0, kis: 0 };
  for (const m of cevap.mevsimler) mevsim[m] = 1.0;
  for (const ay of cevap.aylar) {
    const m = AY_MEVSIM[ay];
    if (m) mevsim[m] = Math.max(mevsim[m], 0.6); // ay sinyali yumuşak uygulanır
  }

  // --- Ortam vektörü
  const ortam: Record<Ortam, number> = { gunluk: 0, is: 0, gece: 0, ozel: 0, spor: 0 };
  for (const o of cevap.ortamlar) ortam[o] = 1.0;

  const profil: ProfilVektoru = {
    nota,
    sevilmeyen: [...cevap.sevilmeyen_notalar],
    aile,
    mevsim,
    ortam,
    yogunluk: cevap.hedef_yogunluk,
    kalicilik: cevap.hedef_kalicilik,
    deneyim: cevap.deneyim,
    butce: cevap.butce,
    cinsiyet: cevap.hedef_cinsiyet,
    cinsiyet_kesin: cevap.cinsiyet_kesin,
    tohum: [...cevap.tohum_parfumler],
  };

  // --- Tohum parfüm harmanı (Bölüm 6.6 — soğuk başlangıç çözümü)
  if (cevap.tohum_parfumler.length > 0) {
    tohumHarmanla(profil, cevap.tohum_parfumler);
  }

  return profil;
}

// Tohum parfümlerin nota/aile vektörlerinin ortalaması kullanıcı vektörüne harmanlanır
export function tohumHarmanla(profil: ProfilVektoru, tohumlar: string[]) {
  const ortNota: Record<string, number> = {};
  const ortAile = bosAile();
  let sayi = 0;
  for (const id of tohumlar) {
    const p = PARFUM_MAP[id];
    if (!p) continue;
    sayi++;
    const nv = parfumNotaVektoru(p);
    for (const [k, w] of Object.entries(nv)) ortNota[k] = (ortNota[k] ?? 0) + w;
    for (const [a, w] of Object.entries(p.aileler)) ortAile[a as Aile] += w as number;
  }
  if (sayi === 0) return;

  const ALFA = 0.5; // %50 anket, %50 tohum harmanı
  for (const [k, top] of Object.entries(ortNota)) {
    const ort = top / sayi;
    if (profil.sevilmeyen.includes(k)) continue; // sevilmeyen nota tohumdan sızmasın
    profil.nota[k] = clamp01((profil.nota[k] ?? 0) * (1 - ALFA) + ort * ALFA + (profil.nota[k] ? ALFA * 0.5 : 0));
  }
  for (const a of AILELER) {
    profil.aile[a] = clamp01(profil.aile[a] * (1 - ALFA) + (ortAile[a] / sayi) * ALFA + (profil.aile[a] > 0.5 ? 0.2 : 0));
  }
}

// Bölüm 6.8 + 8 — Öğrenen sistem: geri bildirim profili çevrimiçi günceller.
// Beğenilen/favorilenen parfümün notaları +, beğenilmeyenler −.
export function geriBildirimUygula(
  profil: ProfilVektoru,
  parfumId: string,
  tur: "begen" | "begenme" | "favori"
): ProfilVektoru {
  const p = PARFUM_MAP[parfumId];
  if (!p) return profil;
  const oran = tur === "begenme" ? -0.2 : tur === "favori" ? 0.2 : 0.15;
  const yeni: ProfilVektoru = structuredClone(profil);
  const nv = parfumNotaVektoru(p);
  for (const [k, w] of Object.entries(nv)) {
    if (yeni.sevilmeyen.includes(k)) continue;
    yeni.nota[k] = clamp01((yeni.nota[k] ?? 0) + oran * w);
    if (yeni.nota[k] <= 0.01) delete yeni.nota[k];
  }
  for (const [a, w] of Object.entries(p.aileler)) {
    yeni.aile[a as Aile] = clamp01(yeni.aile[a as Aile] + oran * 0.7 * (w as number));
  }
  return yeni;
}
