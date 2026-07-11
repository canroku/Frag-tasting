// Gardırop Boşluk Analizi — favorilerin mevsim/ortam kapsamasını çıkarır,
// en büyük boşluğu bulur ve onu dolduracak parfümü önerir.
import type { Parfum, ProfilVektoru, Mevsim, Ortam } from "./types";
import { puanla } from "./recommend";

const MEVSIM_AD: Record<Mevsim, string> = {
  ilkbahar: "İlkbahar", yaz: "Yaz", sonbahar: "Sonbahar", kis: "Kış",
};
const ORTAM_AD: Record<Ortam, string> = {
  gunluk: "Günlük", is: "İş", gece: "Gece", ozel: "Özel gün", spor: "Spor",
};

export interface GardiropAnalizi {
  kapsama: { etiket: string; emoji: string; deger: number }[];
  bosluk: { etiket: string; emoji: string } | null;
  oneri: Parfum | null;
}

const MEVSIM_EMOJI: Record<Mevsim, string> = { kis: "❄️", ilkbahar: "🌷", yaz: "☀️", sonbahar: "🍂" };

export function gardiropAnalizi(
  favoriler: Parfum[],
  profil: ProfilVektoru,
  katalog: Parfum[]
): GardiropAnalizi {
  const mevsimler: Mevsim[] = ["kis", "ilkbahar", "yaz", "sonbahar"];
  const kapsama = mevsimler.map((m) => ({
    mevsim: m,
    etiket: MEVSIM_AD[m],
    emoji: MEVSIM_EMOJI[m],
    deger: favoriler.length === 0 ? 0 : Math.max(...favoriler.map((p) => p.mevsim[m])),
  }));

  const enZayif = [...kapsama].sort((a, b) => a.deger - b.deger)[0];
  if (!enZayif || enZayif.deger >= 0.75) {
    return {
      kapsama: kapsama.map(({ etiket, emoji, deger }) => ({ etiket, emoji, deger })),
      bosluk: null,
      oneri: null,
    };
  }

  // boşluğu dolduracak aday: o mevsime güçlü uyan + profile en yüksek puanlı
  const favoriIdler = new Set(favoriler.map((f) => f.id));
  const aday = katalog
    .filter((p) => !favoriIdler.has(p.id) && p.mevsim[enZayif.mevsim] >= 0.7)
    .sort((a, b) => puanla(profil, b) - puanla(profil, a))[0] ?? null;

  return {
    kapsama: kapsama.map(({ etiket, emoji, deger }) => ({ etiket, emoji, deger })),
    bosluk: { etiket: enZayif.etiket, emoji: enZayif.emoji },
    oneri: aday,
  };
}

export { ORTAM_AD };
