// Saate göre selamlama — gece/sabah moduyla uyumlu metinler.
export function selamla(): { selam: string; emoji: string; vakit: "sabah" | "gunduz" | "aksam" | "gece" } {
  const s = new Date().getHours();
  if (s >= 5 && s < 12) return { selam: "Günaydın", emoji: "🌅", vakit: "sabah" };
  if (s >= 12 && s < 18) return { selam: "İyi günler", emoji: "☀️", vakit: "gunduz" };
  if (s >= 18 && s < 22) return { selam: "İyi akşamlar", emoji: "🌆", vakit: "aksam" };
  return { selam: "İyi geceler", emoji: "🌙", vakit: "gece" };
}

// Vakte göre koku ipucu — öneri başlığını kişiselleştirir
export function vakitIpucu(): string {
  const { vakit } = selamla();
  switch (vakit) {
    case "sabah": return "Güne başlarken ferah bir dokunuş mu?";
    case "gunduz": return "Gün ortası için dengeli seçkiler burada.";
    case "aksam": return "Akşam için biraz daha derin, sıcak kokular.";
    case "gece": return "Gece senin sahnende — iz bırakan kokular.";
  }
}
