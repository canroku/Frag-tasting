// Koku DNA'sı — kullanıcının aile vektöründen kişilik arketipi ve
// taç yaprağı grafiği verisi üretir.
import type { ProfilVektoru, Aile } from "./types";
import { AILELER, AILE_ETIKET } from "./types";

const ARKETIP_ISIM: Record<Aile, string> = {
  narenciye: "Güneş Avcısı",
  cicek: "Bahçe Şairi",
  odunsu: "Orman Bilgesi",
  amber: "Gece Simyacısı",
  fujer: "Zamansız Beyefendi",
  sipr: "Rafine Estet",
  gurme: "Tatlı Büyücü",
  aromatik: "Dalga Yolcusu",
  yesil: "Yaprak Gezgini",
  deri: "Gece Sürücüsü",
};

const ARKETIP_SIFAT: Record<Aile, string> = {
  narenciye: "Işıltılı",
  cicek: "Romantik",
  odunsu: "Topraklı",
  amber: "Gizemli",
  fujer: "Klasik",
  sipr: "Sofistike",
  gurme: "Davetkâr",
  aromatik: "Ferah",
  yesil: "Doğal",
  deri: "Asi",
};

const ARKETIP_OZET: Record<Aile, string> = {
  narenciye: "Enerjin bulaşıcı; kokun odaya girmeden önce gülüşün giriyor.",
  cicek: "Zarafet senin için çaba değil, refleks. Kokular sende şiire dönüşüyor.",
  odunsu: "Sakin ama unutulmaz. Az konuşup derin iz bırakanlardansın.",
  amber: "Gün batınca açılan türdensin — sıcak, çekici ve biraz tehlikeli.",
  fujer: "Güven veren bir klasiksin; her ortamda doğru notada durursun.",
  sipr: "Kalabalığı değil, kaliteyi seçersin. İncelik senin imzan.",
  gurme: "Sarılmak gibi kokmak istiyorsun — ve bunu çok iyi biliyorsun.",
  aromatik: "Özgür ruhlusun; deniz, rüzgâr ve temiz ten senin evrenin.",
  yesil: "Doğayla aynı frekanstasın; sadelik sende lüks görünüyor.",
  deri: "Kurallar sana dar geliyor. Kokun da karakterin gibi keskin.",
};

export interface KokuDna {
  arketip: string;
  ozet: string;
  yapraklar: { aile: Aile; etiket: string; deger: number }[];
  baskin: Aile[];
}

export function kokuDna(profil: ProfilVektoru): KokuDna {
  const sirali = AILELER.map((a) => ({ aile: a, deger: profil.aile[a] ?? 0 })).sort(
    (x, y) => y.deger - x.deger
  );
  const bir = sirali[0]?.aile ?? "amber";
  const iki = sirali[1]?.aile ?? bir;
  return {
    arketip: iki === bir ? ARKETIP_ISIM[bir] : `${ARKETIP_SIFAT[iki]} ${ARKETIP_ISIM[bir]}`,
    ozet: ARKETIP_OZET[bir],
    yapraklar: AILELER.map((a) => ({
      aile: a,
      etiket: AILE_ETIKET[a],
      deger: profil.aile[a] ?? 0,
    })),
    baskin: [bir, iki],
  };
}
