// Bölüm 4 — Onboarding Anketi: tek soru/ekran, ilerleme çubuğu, büyük dokunmatik seçenekler
import { useMemo, useState } from "react";
import type { AnketCevaplari, Cinsiyet, Deneyim, Fiyat, Mevsim, Ortam } from "../engine/types";
import {
  KISILIK_SORULARI, ANKET_NOTALARI, YAS_ARALIKLARI, AYLAR,
} from "../data/survey";
import { NOTA_MAP, KATEGORI_RENK, notaAd } from "../data/notes";
import { KATALOG } from "../data/catalog";
import { useStore } from "../state/store";
import { sayfaGecisi } from "../components/gecis";

const BOS: AnketCevaplari = {
  yas: "25-34",
  hedef_cinsiyet: "fark_etmez",
  cinsiyet_kesin: false,
  deneyim: "ara_sira",
  butce: "fark_etmez",
  kisilik: [],
  sevilen_notalar: [],
  sevilmeyen_notalar: [],
  tohum_parfumler: [],
  mevsimler: [],
  aylar: [],
  ortamlar: [],
  hedef_yogunluk: 0.55,
  hedef_kalicilik: 0.6,
};

export function Anket({ onBitti }: { onBitti: () => void }) {
  const { hesap, anketiKaydet } = useStore();
  const [cevap, setCevap] = useState<AnketCevaplari>(hesap?.anket ?? BOS);
  const [adim, setAdim] = useState(0);

  const adimlar = useMemo(() => anketAdimlari(cevap, setCevap), [cevap]);
  const mevcut = adimlar[adim];
  const ilerleme = ((adim + 1) / adimlar.length) * 100;

  function ileri() {
    if (adim < adimlar.length - 1) sayfaGecisi(() => setAdim(adim + 1), "ileri");
    else {
      anketiKaydet(cevap);
      onBitti();
    }
  }

  function geri() {
    if (adim > 0) sayfaGecisi(() => setAdim(adim - 1), "geri");
  }

  return (
    <div className="anket girisAnim">
      <div className="ilerlemeKap">
        <div className="ilerlemeYol">
          <div className="ilerlemeDolgu" style={{ width: `${ilerleme}%` }} />
        </div>
        <span className="ilerlemeSayi">{adim + 1} / {adimlar.length}</span>
      </div>

      <div className="anketSoru soruGecis" key={adim}>
        <span className="ustBaslik">{mevcut.grup}</span>
        <h2>{mevcut.soru}</h2>
        {mevcut.aciklama && <p className="aciklama">{mevcut.aciklama}</p>}
        {mevcut.icerik}
      </div>

      <div className="anketNav">
        <button className="atlaBtn" onClick={geri} style={{ visibility: adim > 0 ? "visible" : "hidden" }}>
          ← Geri
        </button>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {mevcut.atlanabilir && (
            <button className="atlaBtn" onClick={ileri}>Atla</button>
          )}
          <button className="btn btnAna" onClick={ileri} disabled={!mevcut.hazir}>
            {adim === adimlar.length - 1 ? "Kokumu Bul ✦" : "Devam →"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Adim {
  grup: string;
  soru: string;
  aciklama?: string;
  icerik: React.ReactNode;
  hazir: boolean;
  atlanabilir?: boolean;
}

function anketAdimlari(
  c: AnketCevaplari,
  set: React.Dispatch<React.SetStateAction<AnketCevaplari>>
): Adim[] {
  const g = (kismi: Partial<AnketCevaplari>) => set((eski) => ({ ...eski, ...kismi }));

  const cokluToggle = <T,>(dizi: T[], deger: T): T[] =>
    dizi.includes(deger) ? dizi.filter((x) => x !== deger) : [...dizi, deger];

  const adimlar: Adim[] = [];

  // ---- A) Demografi & Deneyim ----
  adimlar.push({
    grup: "Tanışalım",
    soru: "Yaş aralığın?",
    aciklama: "Koku eğilimlerini yumuşak biçimde ağırlıklandırır — kesin kural değil.",
    hazir: true,
    icerik: (
      <div className="secenekIzgara">
        {YAS_ARALIKLARI.map((y) => (
          <button key={y} className={`secenek ${c.yas === y ? "secili" : ""}`} onClick={() => g({ yas: y })}>
            {y}
          </button>
        ))}
      </div>
    ),
  });

  adimlar.push({
    grup: "Tanışalım",
    soru: "Kim için parfüm arıyorsun?",
    hazir: true,
    icerik: (
      <>
        <div className="secenekIzgara">
          {(
            [
              ["kadin", "Kadın", "🌸"],
              ["erkek", "Erkek", "🌊"],
              ["unisex", "Unisex", "🌗"],
              ["fark_etmez", "Fark etmez", "✨"],
            ] as [Cinsiyet | "fark_etmez", string, string][]
          ).map(([id, ad, emoji]) => (
            <button key={id} className={`secenek ${c.hedef_cinsiyet === id ? "secili" : ""}`} onClick={() => g({ hedef_cinsiyet: id })}>
              <span className="emoji">{emoji}</span>
              {ad}
            </button>
          ))}
        </div>
        {c.hedef_cinsiyet !== "fark_etmez" && (
          <div style={{ marginTop: 16 }}>
            <button
              className={`cip ${c.cinsiyet_kesin ? "secili" : ""}`}
              onClick={() => g({ cinsiyet_kesin: !c.cinsiyet_kesin })}
            >
              {c.cinsiyet_kesin ? "✓ " : ""}Kesin filtre olsun — uymayanları hiç gösterme
            </button>
          </div>
        )}
      </>
    ),
  });

  adimlar.push({
    grup: "Tanışalım",
    soru: "Parfümle ilişkin nasıl?",
    aciklama: "Cevabın, önerilerdeki güvenli–cesur dengesini belirler.",
    hazir: true,
    icerik: (
      <div className="secenekListe">
        {(
          [
            ["ilk_kez", "İlk kez alıyorum", "Sevilen, giyilebilir kokular öne çıkar", "🌱"],
            ["ara_sira", "Ara sıra kullanırım", "Dengeli bir karışım", "🌤️"],
            ["merakli", "Meraklıyım", "Sevdiğin ailelerde çeşitlilik + birkaç cesur öneri", "🔭"],
            ["koleksiyoner", "Koleksiyonerim", "Niş markalar, nadir notalar, yenilik", "🗝️"],
          ] as [Deneyim, string, string, string][]
        ).map(([id, ad, alt, emoji]) => (
          <button key={id} className={`secenek ${c.deneyim === id ? "secili" : ""}`} onClick={() => g({ deneyim: id })}>
            <span className="emoji">{emoji}</span>
            <span>
              {ad}
              <span style={{ display: "block", fontSize: 12.5, opacity: 0.65, fontWeight: 400 }}>{alt}</span>
            </span>
          </button>
        ))}
      </div>
    ),
  });

  adimlar.push({
    grup: "Tanışalım",
    soru: "Bütçe aralığın?",
    hazir: true,
    icerik: (
      <div className="secenekIzgara">
        {(
          [
            ["ekonomik", "Ekonomik", "₺"],
            ["orta", "Orta", "₺₺"],
            ["luks", "Lüks", "₺₺₺"],
            ["fark_etmez", "Fark etmez", "✨"],
          ] as [Fiyat | "fark_etmez", string, string][]
        ).map(([id, ad, emoji]) => (
          <button key={id} className={`secenek ${c.butce === id ? "secili" : ""}`} onClick={() => g({ butce: id })}>
            <span className="emoji">{emoji}</span>
            {ad}
          </button>
        ))}
      </div>
    ),
  });

  // ---- B) Kişilik & Tarz ----
  for (const soru of KISILIK_SORULARI) {
    adimlar.push({
      grup: "Kişilik & Tarz",
      soru: soru.soru,
      aciklama: "Birden fazla seçebilirsin.",
      hazir: true,
      atlanabilir: true,
      icerik: (
        <div className="secenekListe">
          {soru.secenekler.map((s) => {
            const anahtar = `${soru.id}:${s.id}`;
            return (
              <button
                key={s.id}
                className={`secenek ${c.kisilik.includes(anahtar) ? "secili" : ""}`}
                onClick={() => g({ kisilik: cokluToggle(c.kisilik, anahtar) })}
              >
                <span className="emoji">{s.emoji}</span>
                {s.etiket}
              </button>
            );
          })}
        </div>
      ),
    });
  }

  // ---- C) Koku Tercihleri ----
  adimlar.push({
    grup: "Koku Tercihleri",
    soru: "Hangi notaları seviyorsun?",
    aciklama: "Algoritmanın en güçlü sinyali — bol seç.",
    hazir: c.sevilen_notalar.length > 0,
    icerik: (
      <div className="cipKume">
        {ANKET_NOTALARI.map((n) => {
          const nota = NOTA_MAP[n];
          return (
            <button
              key={n}
              className={`cip ${c.sevilen_notalar.includes(n) ? "secili" : ""}`}
              onClick={() =>
                g({
                  sevilen_notalar: cokluToggle(c.sevilen_notalar, n),
                  sevilmeyen_notalar: c.sevilmeyen_notalar.filter((x) => x !== n),
                })
              }
            >
              <span className="notaRenk" style={{ background: nota ? KATEGORI_RENK[nota.kategori] : "#999" }} />
              {notaAd(n)}
            </button>
          );
        })}
      </div>
    ),
  });

  adimlar.push({
    grup: "Koku Tercihleri",
    soru: "Kaçındığın notalar var mı?",
    aciklama: "Bu notaları barındıran parfümler sert ceza alır.",
    hazir: true,
    atlanabilir: true,
    icerik: (
      <div className="cipKume">
        {ANKET_NOTALARI.filter((n) => !c.sevilen_notalar.includes(n)).map((n) => (
          <button
            key={n}
            className={`cip negatif ${c.sevilmeyen_notalar.includes(n) ? "secili" : ""}`}
            onClick={() => g({ sevilmeyen_notalar: cokluToggle(c.sevilmeyen_notalar, n) })}
          >
            {notaAd(n)}
          </button>
        ))}
      </div>
    ),
  });

  adimlar.push({
    grup: "Koku Tercihleri",
    soru: "Sevdiğin bir parfüm var mı?",
    aciklama: "Tohum olarak kullanılır: 'şunu sevdiysen bunları da seversin' mantığını kurar.",
    hazir: true,
    atlanabilir: true,
    icerik: <TohumSecici secili={c.tohum_parfumler} onDegis={(t) => g({ tohum_parfumler: t })} />,
  });

  // ---- D) Mevsim, Ay & Ortam ----
  adimlar.push({
    grup: "Zaman & Mekân",
    soru: "Hangi mevsim(ler) için?",
    hazir: c.mevsimler.length > 0 || c.aylar.length > 0,
    icerik: (
      <>
        <div className="secenekIzgara">
          {(
            [
              ["ilkbahar", "İlkbahar", "🌷"],
              ["yaz", "Yaz", "☀️"],
              ["sonbahar", "Sonbahar", "🍂"],
              ["kis", "Kış", "❄️"],
            ] as [Mevsim, string, string][]
          ).map(([id, ad, emoji]) => (
            <button key={id} className={`secenek ${c.mevsimler.includes(id) ? "secili" : ""}`} onClick={() => g({ mevsimler: cokluToggle(c.mevsimler, id) })}>
              <span className="emoji">{emoji}</span>
              {ad}
            </button>
          ))}
        </div>
        <p className="aciklama" style={{ margin: "22px 0 10px" }}>
          Yoğun kullanacağın aylar? <span style={{ opacity: 0.6 }}>(isteğe bağlı — mevsim eğrisine yumuşak eklenir)</span>
        </p>
        <div className="cipKume">
          {AYLAR.map((ay, i) => (
            <button key={ay} className={`cip ${c.aylar.includes(i + 1) ? "secili" : ""}`} onClick={() => g({ aylar: cokluToggle(c.aylar, i + 1) })}>
              {ay}
            </button>
          ))}
        </div>
      </>
    ),
  });

  adimlar.push({
    grup: "Zaman & Mekân",
    soru: "Nerede kullanacaksın?",
    hazir: c.ortamlar.length > 0,
    icerik: (
      <div className="secenekIzgara">
        {(
          [
            ["gunluk", "Günlük", "🚶"],
            ["is", "İş", "💼"],
            ["gece", "Gece", "🌃"],
            ["ozel", "Özel gün", "🥂"],
            ["spor", "Spor", "🏃"],
          ] as [Ortam, string, string][]
        ).map(([id, ad, emoji]) => (
          <button key={id} className={`secenek ${c.ortamlar.includes(id) ? "secili" : ""}`} onClick={() => g({ ortamlar: cokluToggle(c.ortamlar, id) })}>
            <span className="emoji">{emoji}</span>
            {ad}
          </button>
        ))}
      </div>
    ),
  });

  adimlar.push({
    grup: "Zaman & Mekân",
    soru: "Ne kadar belli olsun, ne kadar kalsın?",
    hazir: true,
    icerik: (
      <div className="kaydirici">
        <p className="aciklama" style={{ marginBottom: 4 }}>Yoğunluk (sillage)</p>
        <div className="kaydiriciSecenekler">
          {(
            [
              [0.25, "Hafif & yakın", "🕊️"],
              [0.55, "Dengeli", "⚖️"],
              [0.85, "Güçlü & iz bırakan", "💫"],
            ] as [number, string, string][]
          ).map(([v, ad, emoji]) => (
            <button key={v} className={`secenek ${c.hedef_yogunluk === v ? "secili" : ""}`} onClick={() => g({ hedef_yogunluk: v })}>
              <span className="emoji">{emoji}</span>
              {ad}
            </button>
          ))}
        </div>
        <p className="aciklama" style={{ margin: "14px 0 4px" }}>Kalıcılık</p>
        <div className="kaydiriciSecenekler">
          {(
            [
              [0.3, "Kısa", "⏳"],
              [0.6, "Orta", "🕰️"],
              [0.9, "Uzun", "♾️"],
            ] as [number, string, string][]
          ).map(([v, ad, emoji]) => (
            <button key={v} className={`secenek ${c.hedef_kalicilik === v ? "secili" : ""}`} onClick={() => g({ hedef_kalicilik: v })}>
              <span className="emoji">{emoji}</span>
              {ad}
            </button>
          ))}
        </div>
      </div>
    ),
  });

  return adimlar;
}

function TohumSecici({ secili, onDegis }: { secili: string[]; onDegis: (t: string[]) => void }) {
  const [sorgu, setSorgu] = useState("");
  const sonuclar = useMemo(() => {
    const s = sorgu.trim().toLocaleLowerCase("tr");
    if (!s) return [];
    return KATALOG.filter(
      (p) =>
        p.ad.toLocaleLowerCase("tr").includes(s) || p.marka.toLocaleLowerCase("tr").includes(s)
    ).slice(0, 6);
  }, [sorgu]);

  const secilenler = KATALOG.filter((p) => secili.includes(p.id));

  return (
    <div>
      <input
        className="girdi"
        placeholder="Parfüm veya marka ara… (örn. Baccarat)"
        value={sorgu}
        onChange={(e) => setSorgu(e.target.value)}
      />
      {sonuclar.length > 0 && (
        <div className="secenekListe" style={{ marginTop: 12 }}>
          {sonuclar.map((p) => (
            <button
              key={p.id}
              className={`secenek ${secili.includes(p.id) ? "secili" : ""}`}
              onClick={() => {
                onDegis(
                  secili.includes(p.id) ? secili.filter((x) => x !== p.id) : [...secili, p.id]
                );
                setSorgu("");
              }}
            >
              <span>
                {p.ad}
                <span style={{ display: "block", fontSize: 12, opacity: 0.6 }}>{p.marka}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {secilenler.length > 0 && (
        <div className="cipKume" style={{ marginTop: 16 }}>
          {secilenler.map((p) => (
            <button key={p.id} className="cip secili" onClick={() => onDegis(secili.filter((x) => x !== p.id))}>
              {p.ad} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
