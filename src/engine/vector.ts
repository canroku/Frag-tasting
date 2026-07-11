// Vektör yardımcıları — kosinüs benzerliği (Bölüm 6.1 / 6.2)

export type Vek = Record<string, number>;

export function cos(a: Vek, b: Vek): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k in a) {
    na += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k in b) nb += b[k] * b[k];
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// Parfümün nota piramidini ağırlıklı tek vektöre indirger:
// dip notalar karaktere en çok etki eder (kalıcı), tepe en az.
// Binlerce parfümlük katalogda her puanlamada yeniden kurmamak için önbellekli.
import type { Parfum } from "./types";

const notaOnbellek = new WeakMap<Parfum, Vek>();
const aileOnbellek = new WeakMap<Parfum, Vek>();

export function parfumNotaVektoru(p: Parfum): Vek {
  const hazir = notaOnbellek.get(p);
  if (hazir) return hazir;
  const v: Vek = {};
  const ekle = (ids: string[], w: number) => {
    for (const id of ids) v[id] = Math.max(v[id] ?? 0, w);
  };
  ekle(p.notalar.tepe, 0.6);
  ekle(p.notalar.kalp, 0.85);
  ekle(p.notalar.dip, 1.0);
  notaOnbellek.set(p, v);
  return v;
}

export function parfumAileVektoru(p: Parfum): Vek {
  const hazir = aileOnbellek.get(p);
  if (hazir) return hazir;
  const v = { ...p.aileler } as Vek;
  aileOnbellek.set(p, v);
  return v;
}

// MMR çeşitlendirmesinde kullanılan parfüm-parfüm benzerliği
export function parfumBenzerlik(a: Parfum, b: Parfum): number {
  return (
    0.6 * cos(parfumNotaVektoru(a), parfumNotaVektoru(b)) +
    0.4 * cos(parfumAileVektoru(a), parfumAileVektoru(b))
  );
}
