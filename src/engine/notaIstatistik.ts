// Nota istatistikleri — hangi nota kaç parfümde geçiyor + o notayı taşıyan
// en iyi parfümler. Katalog başına bir kez hesaplanıp önbelleklenir.
import type { Parfum } from "./types";

let onbellek: { surum: number; sayim: Map<string, number> } | null = null;

// Her notanın katalogdaki kullanım sayısı (tek geçişte)
export function notaSayimlari(katalog: Parfum[], surum: number): Map<string, number> {
  if (onbellek && onbellek.surum === surum) return onbellek.sayim;
  const sayim = new Map<string, number>();
  for (const p of katalog) {
    const gorulen = new Set<string>();
    for (const n of p.notalar.tepe) gorulen.add(n);
    for (const n of p.notalar.kalp) gorulen.add(n);
    for (const n of p.notalar.dip) gorulen.add(n);
    for (const n of gorulen) sayim.set(n, (sayim.get(n) ?? 0) + 1);
  }
  onbellek = { surum, sayim };
  return sayim;
}

// Belirli bir notayı taşıyan en iyi (puanlı/popüler) parfümler
export function notaliParfumler(katalog: Parfum[], notaId: string, n = 24): Parfum[] {
  const anahtar = (p: Parfum) =>
    (p.topluluk_oy ?? 0) > 0 ? (p.topluluk_puan ?? 0) + (p.topluluk_oy ?? 0) / 100000 : p.populerlik;
  return katalog
    .filter((p) => p.notalar.tepe.includes(notaId) || p.notalar.kalp.includes(notaId) || p.notalar.dip.includes(notaId))
    .sort((a, b) => anahtar(b) - anahtar(a))
    .slice(0, n);
}
