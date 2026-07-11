#!/usr/bin/env node
/**
 * Toplu katalog içe aktarma: veri/parfumler.csv → src/data/katalog_ek.ts
 *
 * Kullanım:  npm run katalog:derle
 *
 * CSV sütunları (başlık satırı zorunlu, ayraç ;):
 *   id;ad;marka;yil;cinsiyet;fiyat;nis;populerlik;yogunluk;kalicilik;
 *   aileler;tepe;kalp;dip;kis;ilkbahar;yaz;sonbahar;
 *   gunluk;is;gece;ozel;spor;fragrantica_url;gorsel_url
 *
 *   cinsiyet: kadin|erkek|unisex     fiyat: ekonomik|orta|luks   nis: 0|1
 *   aileler:  "amber:0.7|gurme:0.5"  (10 aile: narenciye,cicek,odunsu,amber,
 *             fujer,sipr,gurme,aromatik,yesil,deri)
 *   tepe/kalp/dip: nota id'leri virgülle ("bergamot,gul") — id listesi
 *             src/data/notes.ts içindedir; bilinmeyen id uyarı verir.
 *   sayısal alanlar 0-1 aralığında.
 *
 * Veri kaynağı notu: Fragrantica içeriği kazınamaz (kullanım şartları +
 * doküman Bölüm 9). Kendi editör girdilerini veya lisanslı/açık veri
 * setlerini kullan; fragrantica_url yalnızca yönlendirme linkidir.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvYolu = join(kok, "veri", "parfumler.csv");
const hedef = join(kok, "src", "data", "katalog_ek.ts");

const AILELER = new Set(["narenciye", "cicek", "odunsu", "amber", "fujer", "sipr", "gurme", "aromatik", "yesil", "deri"]);
const notlarKaynak = readFileSync(join(kok, "src", "data", "notes.ts"), "utf8");
const NOTA_IDLERI = new Set([...notlarKaynak.matchAll(/\{ id: "([a-z_]+)"/g)].map((m) => m[1]));

if (!existsSync(csvYolu)) {
  console.error(`CSV bulunamadı: ${csvYolu}\nÖrnek için veri/parfumler.ornek.csv dosyasına bak.`);
  process.exit(1);
}

const satirlar = readFileSync(csvYolu, "utf8").split(/\r?\n/).filter((s) => s.trim());
const basliklar = satirlar[0].split(";").map((b) => b.trim());
const kayitlar = [];
let uyarilar = 0;

for (let i = 1; i < satirlar.length; i++) {
  const hucreler = satirlar[i].split(";").map((h) => h.trim());
  const satir = Object.fromEntries(basliklar.map((b, j) => [b, hucreler[j] ?? ""]));

  const uyar = (mesaj) => {
    console.warn(`  ⚠︎ satır ${i + 1} (${satir.ad || "?"}): ${mesaj}`);
    uyarilar++;
  };

  const notalar = (alan) =>
    (satir[alan] || "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => {
        if (!NOTA_IDLERI.has(n)) { uyar(`bilinmeyen nota id "${n}" — notes.ts'e ekle`); return true; }
        return true;
      });

  const aileler = {};
  for (const parca of (satir.aileler || "").split("|").map((x) => x.trim()).filter(Boolean)) {
    const [aile, deger] = parca.split(":");
    if (!AILELER.has(aile)) { uyar(`bilinmeyen aile "${aile}"`); continue; }
    aileler[aile] = Math.min(1, Math.max(0, parseFloat(deger) || 0));
  }

  const sayi = (alan, varsayilan = 0.5) => {
    const v = parseFloat(satir[alan]);
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : varsayilan;
  };

  if (!satir.ad || !satir.marka) { uyar("ad/marka boş — satır atlandı"); continue; }

  kayitlar.push({
    id: satir.id || `ek_${String(i).padStart(4, "0")}`,
    ad: satir.ad,
    marka: satir.marka,
    yil: parseInt(satir.yil) || 2020,
    cinsiyet: ["kadin", "erkek", "unisex"].includes(satir.cinsiyet) ? satir.cinsiyet : "unisex",
    aileler,
    notalar: { tepe: notalar("tepe"), kalp: notalar("kalp"), dip: notalar("dip") },
    mevsim: { kis: sayi("kis"), ilkbahar: sayi("ilkbahar"), yaz: sayi("yaz"), sonbahar: sayi("sonbahar") },
    ortam: { gunluk: sayi("gunluk"), is: sayi("is"), gece: sayi("gece"), ozel: sayi("ozel"), spor: sayi("spor", 0.2) },
    yogunluk: sayi("yogunluk"),
    kalicilik: sayi("kalicilik"),
    nis_mi: satir.nis === "1",
    fiyat_seviyesi: ["ekonomik", "orta", "luks"].includes(satir.fiyat) ? satir.fiyat : "orta",
    populerlik: sayi("populerlik", 0.6),
    fragrantica_url:
      satir.fragrantica_url ||
      `https://www.fragrantica.com/search/?query=${encodeURIComponent(`${satir.marka} ${satir.ad}`)}`,
    ...(satir.gorsel_url ? { gorsel_url: satir.gorsel_url } : {}),
  });
}

const cikti = `// Bu dosya \`npm run katalog:derle\` tarafından veri/parfumler.csv'den üretilir.
// Elle düzenleme — bir sonraki derlemede üzerine yazılır.
import type { Parfum } from "../engine/types";

export const KATALOG_EK: Parfum[] = ${JSON.stringify(kayitlar, null, 2)};
`;
writeFileSync(hedef, cikti);
console.log(`✔ ${kayitlar.length} parfüm içe aktarıldı → src/data/katalog_ek.ts${uyarilar ? ` (${uyarilar} uyarı)` : ""}`);
