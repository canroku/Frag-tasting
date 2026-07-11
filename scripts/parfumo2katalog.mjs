#!/usr/bin/env node
/**
 * Açık Parfumo veri setini (TidyTuesday 2024-12-10) Frag Tasting kataloğuna
 * dönüştürür: İngilizce notaları Türkçe nota evrenine eşler, ana akorlardan
 * aile/mevsim/ortam vektörleri türetir, gerçek topluluk puanlarını taşır.
 *
 * Kullanım:
 *   node scripts/parfumo2katalog.mjs <parfumo_data_clean.csv> [minOy=50]
 *
 * Veri kaynağı: https://github.com/rfordatascience/tidytuesday (2024-12-10)
 * Fragrantica kazınmaz; fragrantica_url alanı yalnızca arama yönlendirmesidir.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const [, , csvYolu, minOyArg] = process.argv;
const MIN_OY = Number.isFinite(parseInt(minOyArg)) ? parseInt(minOyArg) : 50;
if (!csvYolu) {
  console.error("Kullanım: node scripts/parfumo2katalog.mjs <csv> [minOy]");
  process.exit(1);
}

// ---------- CSV ayrıştırıcı (tırnaklı alan destekli) ----------
function csvSatirlari(metin) {
  const satirlar = [];
  let alan = "", satir = [], tirnak = false;
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (tirnak) {
      if (c === '"' && metin[i + 1] === '"') { alan += '"'; i++; }
      else if (c === '"') tirnak = false;
      else alan += c;
    } else if (c === '"') tirnak = true;
    else if (c === ",") { satir.push(alan); alan = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && metin[i + 1] === "\n") i++;
      satir.push(alan); alan = "";
      if (satir.length > 1 || satir[0] !== "") satirlar.push(satir);
      satir = [];
    } else alan += c;
  }
  if (alan || satir.length) { satir.push(alan); satirlar.push(satir); }
  return satirlar;
}

// ---------- İngilizce nota → Türkçe nota id eşlemesi ----------
const NOTA_ES = {
  musk: "misk", "white musk": "misk", bergamot: "bergamot", sandalwood: "sandal",
  patchouli: "paculi", vanilla: "vanilya", jasmine: "yasemin", amber: "amber",
  ambergris: "amber", ambroxan: "amber", rose: "gul", vetiver: "vetiver",
  "mandarin orange": "mandalina", mandarin: "mandalina", tangerine: "mandalina",
  cedarwood: "sedir", cedar: "sedir", lemon: "limon", "tonka bean": "tonka",
  tonka: "tonka", iris: "iris", orris: "iris", "orris root": "iris",
  "orange blossom": "portakal_cicegi", lavender: "lavanta",
  "lily of the valley": "muge", "ylang-ylang": "ylang", cardamom: "kakule",
  "pink pepper": "pembe_biber", frankincense: "tutsu", incense: "tutsu",
  olibanum: "tutsu", violet: "menekse", "violet leaf": "menekse",
  oakmoss: "mese_yosunu", moss: "mese_yosunu", leather: "deri", suede: "deri",
  geranium: "sardunya", grapefruit: "greyfurt", benzoin: "benzoin",
  cinnamon: "tarcin", orange: "portakal", "bitter orange": "portakal",
  "blood orange": "portakal", oud: "oud", agarwood: "oud", neroli: "neroli",
  blackcurrant: "frenk_uzumu", "black currant": "frenk_uzumu", cassis: "frenk_uzumu",
  peach: "seftali", nutmeg: "muskat", saffron: "safran", freesia: "frezya",
  labdanum: "laden", ginger: "zencefil", tuberose: "tuberoz",
  heliotrope: "heliotrop", coriander: "kisnis", clove: "karanfil",
  peony: "sakayik", raspberry: "ahududu", "black pepper": "karabiber",
  pepper: "karabiber", carnation: "karanfil", magnolia: "manolya", pear: "armut",
  "gaiac wood": "gayak", "guaiac wood": "gayak", apple: "elma",
  aldehydes: "aldehit", gardenia: "gardenya", "woody notes": "sedir",
  galbanum: "galbanum", honey: "bal", coffee: "kahve", cocoa: "kakao",
  chocolate: "cikolata", almond: "badem", coconut: "hindistan_cevizi",
  caramel: "karamel", pineapple: "ananas", cherry: "kiraz", plum: "erik",
  fig: "incir", "fig leaf": "incir", pomegranate: "nar", strawberry: "cilek",
  apricot: "kayisi", melon: "kavun", mango: "mango", lychee: "kiraz",
  "green notes": "yesil_yapraklar", "green leaves": "yesil_yapraklar",
  basil: "feslegen", rosemary: "biberiye", sage: "adacayi", "clary sage": "adacayi",
  mint: "nane", peppermint: "nane", spearmint: "nane", "green tea": "cay",
  "black tea": "cay", tea: "cay", "sea salt": "deniz_tuzu", salt: "deniz_tuzu",
  "sea notes": "su_notalari", "marine notes": "su_notalari", "water notes": "su_notalari",
  "aquatic notes": "su_notalari", calone: "su_notalari", tobacco: "tutun",
  "tobacco leaf": "tutun", rum: "rom", cognac: "konyak", whiskey: "konyak",
  juniper: "ardic", "juniper berry": "ardic", date: "hurma", ambrette: "ambrette",
  "musk mallow": "ambrette", lily: "zambak", honeysuckle: "hanimeli",
  mimosa: "mimoza", "waterlily": "nilufer", "lotus": "nilufer", "white lotus": "nilufer",
  hyacinth: "sumbul", lime: "limon", citron: "limon", petitgrain: "neroli",
  "bourbon vanilla": "vanilya", "vanilla absolute": "vanilya", "tahitian vanilla": "vanilya",
  "madagascar vanilla": "vanilya", "turkish rose": "gul", "bulgarian rose": "gul",
  "damask rose": "gul", "rose absolute": "gul", "may rose": "gul",
  "white flowers": "yasemin", "sambac jasmine": "yasemin", "egyptian jasmine": "yasemin",
  "sichuan pepper": "karabiber", elemi: "tutsu", myrrh: "tutsu", opoponax: "benzoin",
  styrax: "benzoin", "atlas cedar": "sedir", "virginia cedar": "sedir",
  cypress: "sedir", pine: "sedir", "fir balsam": "sedir", birch: "sedir",
  "white amber": "amber", civet: "misk", castoreum: "deri", "animal notes": "misk",
  hazelnut: "badem", pistachio: "badem", praline: "karamel", "brown sugar": "seker_kamisi",
  sugar: "seker_kamisi", "cotton candy": "seker_kamisi", licorice: "badem",
  anise: "badem", "star anise": "badem", wormwood: "adacayi", artemisia: "adacayi",
  thyme: "biberiye", tarragon: "feslegen", chamomile: "adacayi", verbena: "limon",
  "lemon verbena": "limon", yuzu: "limon", kumquat: "mandalina",
};
const esle = (ham) => {
  const k = ham.trim().toLowerCase();
  return NOTA_ES[k] ?? null;
};

// ---------- Ana akor → aile eşlemesi ----------
const AKOR_AILE = {
  Floral: ["cicek"], Spicy: ["amber"], Sweet: ["gurme"], Woody: ["odunsu"],
  Fresh: ["aromatik"], Fruity: ["gurme", "narenciye"], Citrus: ["narenciye"],
  Green: ["yesil"], Powdery: ["cicek"], Synthetic: ["aromatik"],
  Oriental: ["amber"], Creamy: ["gurme"], Gourmand: ["gurme"],
  Resinous: ["amber"], Aquatic: ["aromatik"], Smoky: ["deri", "amber"],
  Leathery: ["deri"], Animal: ["deri"], Earthy: ["odunsu"], Chypre: ["sipr"],
  "Fougère": ["fujer"],
};
const SICAK_AKOR = new Set(["Oriental", "Spicy", "Sweet", "Gourmand", "Resinous", "Smoky", "Leathery", "Creamy", "Animal"]);
const FERAH_AKOR = new Set(["Citrus", "Fresh", "Aquatic", "Green"]);

// ---------- Marka sınıflandırma ----------
const NIS_MARKALAR = new Set(["amouage","xerjoff","roja parfums","roja dove","clive christian","parfums de marly","maison francis kurkdjian","by kilian","kilian","byredo","le labo","diptyque","creed","nishane","initio","initio parfums privés","nasomatto","orto parisi","tiziana terenzi","mancera","montale","penhaligon's","serge lutens","frederic malle","editions de parfums frédéric malle","memo","memo paris","ex nihilo","bond no. 9","juliette has a gun","etat libre d'orange","bdk parfums","matiere premiere","sospiro","attar collection","boadicea the victorious","stephane humbert lucas","maison crivelli","les liquides imaginaires","profumum roma","casamorati","fueguia 1833","hermetica","strangelove","室 roomfragrance","acqua di parma","comme des garçons","escentric molecules","imaginary authors","d.s. & durga","zoologist","4160 tuesdays","papillon artisan perfumes","beaufort london","masque milano","meo fusciuni","bogue","slumberhouse","january scent project","rogue perfumery","pekji","hiram green","anatole lebreton","aroma m","arte profumi","laboratorio olfattivo","nobile 1942","omnia profumi","vero profumo","andy tauer","tauer perfumes","parfum d'empire","mdci parfums","neela vermeire creations","ormonde jayne","roads","six scents","the different company","undergreen","jul et mad","lm parfums","majda bekkali","mona di orio","olfactive studio","parfumerie generale","pierre guillaume","ramon monegal","sammarco","spirit of kings","stephane humbert lucas 777","thameen","tola","urban scents","ys uzac"]);
const EKONOMIK_MARKALAR = new Set(["avon","oriflame","yves rocher","zara","bath & body works","victoria's secret","lattafa","armaf","al haramain","al rehab","rasasi","swiss arabian","ajmal","afnan","maison alhambra","milton lloyd","adidas","axe","nivea","the body shop","c&a","h&m","primark","mercadona","lidl","dm","balea","catrice","essence","farmasi","eyfel","rebul","golden scent","la rive","jean marc","chatler","dorall collection","creation lamis","fragrance world","paris corner"]);

// ---------- Mevcut katalogla tekilleştirme ----------
// nota id → kategori (akorsuz kayıtlarda aile türetmek için)
const notaKategori = {};
for (const m of readFileSync(join(kok, "src", "data", "notes.ts"), "utf8").matchAll(
  /\{ id: "([a-z_]+)", ad: "[^"]+", kategori: "([a-z]+)"/g
)) notaKategori[m[1]] = m[2];
const KATEGORI_AILE = {
  narenciye: "narenciye", meyve: "gurme", cicek: "cicek", yesil: "yesil",
  baharat: "amber", tatli: "gurme", odunsu: "odunsu", recine: "amber",
  hayvansal: "deri", su: "aromatik",
};

const temelKaynak = readFileSync(join(kok, "src", "data", "catalog.ts"), "utf8");
const mevcutlar = new Set(
  [...temelKaynak.matchAll(/ad: "([^"]+)", marka: "([^"]+)"/g)].map(
    (m) => `${m[2]}|${m[1]}`.toLowerCase().replace(/[^a-z0-9|]+/g, "")
  )
);

// ---------- Dönüştürme ----------
const ham = readFileSync(csvYolu, "utf8");
const satirlar = csvSatirlari(ham);
const basliklar = satirlar[0];
const I = Object.fromEntries(basliklar.map((b, i) => [b, i]));

const kayitlar = [];
let atlanan = { eksik: 0, azOy: 0, notasiz: 0, tekrar: 0 };

for (let s = 1; s < satirlar.length; s++) {
  const r = satirlar[s];
  const al = (ad) => (r[I[ad]] ?? "").trim();
  const oy = parseFloat(al("Rating_Count"));
  const puan = parseFloat(al("Rating_Value"));
  const puanli = Number.isFinite(oy) && Number.isFinite(puan);
  if (puanli && oy < MIN_OY) { atlanan.azOy++; continue; }
  if (!puanli && MIN_OY > 0) { atlanan.eksik++; continue; }
  const akorHam = al("Main_Accords");

  const ad = al("Name");
  const marka = al("Brand");
  // parfüm olmayan ürünleri ele (saç spreyi, vücut losyonu, mum...)
  if (/hair|body (lotion|spray|mist|cream|oil|wash)|shower|deodorant|roll-?on|after ?shave|room spray|candle|bougie|diffuser|soap|shampoo|talc/i.test(ad)) {
    atlanan.urun = (atlanan.urun ?? 0) + 1;
    continue;
  }
  const anahtar = `${marka}|${ad}`.toLowerCase().replace(/[^a-z0-9|]+/g, "");
  if (mevcutlar.has(anahtar)) { atlanan.tekrar++; continue; }
  mevcutlar.add(anahtar);

  const katman = (alan) => {
    const hamMetin = al(alan);
    if (!hamMetin || hamMetin === "NA") return [];
    const ids = [];
    for (const n of hamMetin.split(",")) {
      const id = esle(n);
      if (id && !ids.includes(id)) ids.push(id);
      if (ids.length >= 4) break;
    }
    return ids;
  };
  const tepe = katman("Top_Notes"), kalp = katman("Middle_Notes"), dip = katman("Base_Notes");
  if (tepe.length + kalp.length + dip.length < 2) { atlanan.notasiz++; continue; }

  const akorlar = (akorHam && akorHam !== "NA")
    ? akorHam.split(",").map((a) => a.trim()).filter(Boolean)
    : [];
  const aileler = {};
  const AGIRLIK = [0.85, 0.65, 0.5, 0.4, 0.3];
  akorlar.forEach((a, i) => {
    for (const aile of AKOR_AILE[a] ?? []) {
      aileler[aile] = Math.max(aileler[aile] ?? 0, AGIRLIK[Math.min(i, 4)]);
    }
  });
  if (Object.keys(aileler).length === 0) {
    // akor yok → aileyi nota kategorilerinden türet (dip 3x, kalp 2x, tepe 1x)
    const sayim = {};
    const say = (ids, w) => {
      for (const id of ids) {
        const aile = KATEGORI_AILE[notaKategori[id]];
        if (aile) sayim[aile] = (sayim[aile] ?? 0) + w;
      }
    };
    say(tepe, 1); say(kalp, 2); say(dip, 3);
    const enCok = Math.max(...Object.values(sayim), 1);
    for (const [aile, adet] of Object.entries(sayim)) {
      aileler[aile] = Math.round((0.3 + 0.5 * (adet / enCok)) * 100) / 100;
    }
    if (Object.keys(aileler).length === 0) aileler.aromatik = 0.5;
  }

  // mevsim/ortam sezgileri
  let sicak = 0, ferah = 0;
  akorlar.forEach((a, i) => {
    const w = AGIRLIK[Math.min(i, 4)];
    if (SICAK_AKOR.has(a)) sicak = Math.max(sicak, w);
    if (FERAH_AKOR.has(a)) ferah = Math.max(ferah, w);
  });
  if (akorlar.length === 0) {
    sicak = Math.max(aileler.amber ?? 0, aileler.gurme ?? 0, aileler.deri ?? 0) * 0.8;
    ferah = Math.max(aileler.narenciye ?? 0, aileler.aromatik ?? 0, aileler.yesil ?? 0) * 0.8;
  }
  const cicekli = aileler.cicek ?? 0;
  const c01 = (x) => Math.min(0.95, Math.max(0.05, Math.round(x * 100) / 100));
  const mevsim = {
    kis: c01(0.35 + sicak * 0.55 - ferah * 0.3),
    sonbahar: c01(0.4 + sicak * 0.4 - ferah * 0.15),
    ilkbahar: c01(0.4 + ferah * 0.3 + cicekli * 0.25 - sicak * 0.15),
    yaz: c01(0.3 + ferah * 0.55 - sicak * 0.35),
  };
  const ortam = {
    gunluk: c01(0.45 + ferah * 0.3 - sicak * 0.2),
    is: c01(0.4 + ferah * 0.2 - sicak * 0.25 + (aileler.fujer ?? 0) * 0.2),
    gece: c01(0.35 + sicak * 0.5 - ferah * 0.25),
    ozel: c01(0.4 + sicak * 0.3 + cicekli * 0.1),
    spor: c01(0.15 + ferah * 0.35 - sicak * 0.1),
  };

  // yoğunluk/kalıcılık: konsantrasyon + akor
  const kons = al("Concentration").toLowerCase();
  let temelYog = 0.55;
  if (/extrait|perfume oil|parfum$|^parfum/.test(kons)) temelYog = 0.85;
  else if (/eau de parfum|edp/.test(kons)) temelYog = 0.68;
  else if (/eau de toilette|edt/.test(kons)) temelYog = 0.5;
  else if (/cologne|edc/.test(kons)) temelYog = 0.35;
  const yogunluk = c01(temelYog + sicak * 0.15 - ferah * 0.12);
  const kalicilik = c01(yogunluk + 0.05);

  const markaKucuk = marka.toLowerCase();
  const nis = NIS_MARKALAR.has(markaKucuk);
  const fiyat = nis ? "luks" : EKONOMIK_MARKALAR.has(markaKucuk) ? "ekonomik" : "orta";

  // cinsiyet: ad/veri ipuçlarından
  const adKucuk = ` ${ad.toLowerCase()} `;
  const cinsiyet =
    /( pour homme | for men | men | homme | uomo | man | male |^men )/.test(adKucuk) ? "erkek" :
    /( pour femme | for women | women | femme | donna | woman | lady | her | elle |intense pour elle)/.test(adKucuk) ? "kadin" :
    "unisex";

  const yil = parseInt(al("Release_Year"));

  // kompakt satır — katalog_ek.ts içindeki çözücü Parfum nesnesine açar
  kayitlar.push([
    ad, marka,
    Number.isFinite(yil) ? yil : 2010,
    cinsiyet === "kadin" ? 1 : cinsiyet === "erkek" ? 2 : 0,
    Object.entries(aileler).flat(),
    tepe, kalp, dip,
    [mevsim.kis, mevsim.ilkbahar, mevsim.yaz, mevsim.sonbahar],
    [ortam.gunluk, ortam.is, ortam.gece, ortam.ozel, ortam.spor],
    yogunluk, kalicilik,
    nis ? 1 : 0,
    fiyat === "ekonomik" ? 0 : fiyat === "luks" ? 2 : 1,
    // hiç oylanmamış kayıtlar düşük popülerlik önseli alır — bilinmeyen
    // kokular ancak koleksiyoner profillerinde (yenilik bonusu) öne çıkar
    puanli ? c01(Math.log10(Math.max(oy, 2)) / 4) : 0.18,
    puanli ? Math.round((puan / 2) * 10) / 10 : 0, // Parfumo 0-10 → 0-5; 0 = veri yok
    puanli ? Math.round(oy) : 0,
  ]);
}

// popülerliğe göre sırala ki ilk yüklemeler en bilinenleri göstersin
kayitlar.sort((a, b) => b[16] - a[16]);

// Kompakt satırlar JSON string olarak gömülür; çalışma anında Parfum'a açılır.
// (Alan adlarını her kayıtta tekrarlamamak dosyayı ~%60 küçültür.)
const cikti = `// Bu dosya scripts/parfumo2katalog.mjs tarafından üretilir — elle düzenleme.
// Kaynak: TidyTuesday Parfumo veri seti (2024-12-10), minimum ${MIN_OY} oy.
import type { Parfum, Aile, Cinsiyet, Fiyat } from "../engine/types";

const veri = ${JSON.stringify(JSON.stringify(kayitlar))};

type Satir = [
  string, string, number, number, (string | number)[],
  string[], string[], string[], number[], number[],
  number, number, number, number, number, number, number
];

const CINSIYET: Cinsiyet[] = ["unisex", "kadin", "erkek"];
const FIYAT: Fiyat[] = ["ekonomik", "orta", "luks"];

export const KATALOG_EK: Parfum[] = (JSON.parse(veri) as Satir[]).map((s, i) => {
  const aileler: Partial<Record<Aile, number>> = {};
  for (let j = 0; j < s[4].length; j += 2) {
    aileler[s[4][j] as Aile] = s[4][j + 1] as number;
  }
  return {
    id: \`pf_\${i + 1}\`,
    ad: s[0],
    marka: s[1],
    yil: s[2],
    cinsiyet: CINSIYET[s[3]],
    aileler,
    notalar: { tepe: s[5], kalp: s[6], dip: s[7] },
    mevsim: { kis: s[8][0], ilkbahar: s[8][1], yaz: s[8][2], sonbahar: s[8][3] },
    ortam: { gunluk: s[9][0], is: s[9][1], gece: s[9][2], ozel: s[9][3], spor: s[9][4] },
    yogunluk: s[10],
    kalicilik: s[11],
    nis_mi: s[12] === 1,
    fiyat_seviyesi: FIYAT[s[13]],
    populerlik: s[14],
    ...(s[16] > 0 ? { topluluk_puan: s[15], topluluk_oy: s[16] } : {}),
  };
});
`;
writeFileSync(join(kok, "src", "data", "katalog_ek.ts"), cikti);
console.log(`✔ ${kayitlar.length} parfüm dönüştürüldü → src/data/katalog_ek.ts`);
console.log(`  atlanan: eksik=${atlanan.eksik} azOy=${atlanan.azOy} notasız=${atlanan.notasiz} tekrar=${atlanan.tekrar}`);
