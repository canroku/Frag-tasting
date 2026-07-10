// Sayfa geçiş animasyonları — View Transition API (Chromium/Safari) ile
// akışkan geçiş; desteklemeyen tarayıcılar animasyonsuz güncellemeye düşer
// ve mevcut CSS giriş animasyonları devreye girer.
import { flushSync } from "react-dom";

export type GecisYonu = "ileri" | "geri" | "sekme";

export function sayfaGecisi(guncelle: () => void, yon: GecisYonu = "sekme") {
  const belge = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!belge.startViewTransition || azHareket) {
    guncelle();
    return;
  }
  document.documentElement.dataset.gecis = yon;
  belge.startViewTransition(() => {
    // React güncellemesini eşzamanlı işle ki API eski/yeni kareyi doğru yakalasın
    flushSync(guncelle);
  });
}
