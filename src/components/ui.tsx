import { useMemo, useState, type ReactNode } from "react";
import type { Parfum, Oneri, Aile, Cinsiyet } from "../engine/types";
import { AILE_ETIKET, AILE_RENK } from "../engine/types";
import { NOTA_MAP, KATEGORI_RENK, notaAd } from "../data/notes";
import { KATALOG } from "../data/catalog";
import { bunaBenzer } from "../engine/recommend";
import { toplulukVerisi, oyFormat } from "../engine/topluluk";
import { useStore } from "../state/store";

export function Aurora() {
  return (
    <>
      <div className="aurora" aria-hidden />
      <div className="grain" aria-hidden />
    </>
  );
}

// Dağılan koku partikülleri (Bölüm 10 — küçük dokunuşlar)
export function Partikuller({ adet = 18 }: { adet?: number }) {
  const partikuller = useMemo(
    () =>
      Array.from({ length: adet }, (_, i) => ({
        left: Math.random() * 100,
        sap: (Math.random() - 0.5) * 160,
        sure: 6 + Math.random() * 8,
        gecikme: Math.random() * 8,
        boyut: 3 + Math.random() * 4,
        i,
      })),
    [adet]
  );
  return (
    <div className="partikuller" aria-hidden>
      {partikuller.map((p) => (
        <span
          key={p.i}
          className="partikul"
          style={{
            left: `${p.left}%`,
            width: p.boyut,
            height: p.boyut,
            animationDuration: `${p.sure}s`,
            animationDelay: `${p.gecikme}s`,
            ["--sap" as string]: `${p.sap}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Şişe görseli ----------
   Katalogda telifli ürün fotoğrafı kullanmamak için her parfüme, baskın koku
   ailelerinin renkleriyle üretilen özgün bir şişe illüstrasyonu çizilir.
   Aynı parfüm her zaman aynı şişeyi alır (id'den deterministik). */
function idHash(metin: string): number {
  let h = 5381;
  for (let i = 0; i < metin.length; i++) h = (h * 33) ^ metin.charCodeAt(i);
  return h >>> 0;
}

export function SiseGorsel({ parfum, buyuk = false }: { parfum: Parfum; buyuk?: boolean }) {
  const aileler = Object.entries(parfum.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  const renk1 = AILE_RENK[(aileler[0]?.[0] ?? "amber") as Aile];
  const renk2 = AILE_RENK[(aileler[1]?.[0] ?? aileler[0]?.[0] ?? "odunsu") as Aile];
  const h = idHash(parfum.id);
  const sekil = h % 4; // 4 şişe silüeti
  const dolum = 62 + (h % 20); // şişedeki parfüm seviyesi
  const bas = parfum.marka
    .split(/\s+/)
    .map((k) => k[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr");

  // silüet parametreleri: [gövde x, gövde geniş, gövde rx, boyun geniş]
  const s = [
    { x: 22, w: 56, rx: 8, boyun: 14 },
    { x: 27, w: 46, rx: 20, boyun: 12 },
    { x: 18, w: 64, rx: 5, boyun: 18 },
    { x: 25, w: 50, rx: 12, boyun: 10 },
  ][sekil];
  const gid = `g${parfum.id}`;

  return (
    <svg
      viewBox="0 0 100 130"
      className={buyuk ? "sise siseBuyuk" : "sise"}
      role="img"
      aria-label={`${parfum.ad} şişe illüstrasyonu`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={renk1} stopOpacity="0.95" />
          <stop offset="100%" stopColor={renk2} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${gid}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ecdf" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b9a893" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* kapak */}
      <rect x={50 - s.boyun / 2 - 4} y="6" width={s.boyun + 8} height="16" rx="3" fill={`url(#${gid}c)`} />
      {/* boyun */}
      <rect x={50 - s.boyun / 2} y="20" width={s.boyun} height="12" fill={`url(#${gid})`} opacity="0.7" />
      {/* gövde camı */}
      <rect x={s.x} y="30" width={s.w} height="92" rx={s.rx} fill="rgba(251,247,241,0.08)" stroke="rgba(251,247,241,0.25)" strokeWidth="1.5" />
      {/* parfüm dolumu */}
      <rect
        x={s.x + 3}
        y={30 + (92 * (100 - dolum)) / 100}
        width={s.w - 6}
        height={(92 * dolum) / 100 - 3}
        rx={Math.max(3, s.rx - 4)}
        fill={`url(#${gid})`}
      />
      {/* cam parlaması */}
      <rect x={s.x + 6} y="36" width="7" height="78" rx="3.5" fill="rgba(255,255,255,0.28)" />
      {/* marka etiketi */}
      <rect x={50 - 16} y="66" width="32" height="24" rx="3" fill="rgba(18,5,16,0.55)" stroke="rgba(251,247,241,0.3)" strokeWidth="0.8" />
      <text x="50" y="82" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fill="#fbf7f1" letterSpacing="1">
        {bas}
      </text>
    </svg>
  );
}

export function NotaRozet({ id }: { id: string }) {
  const nota = NOTA_MAP[id];
  const renk = nota ? KATEGORI_RENK[nota.kategori] : "#999";
  return (
    <span className="rozet">
      <span className="rozetEmoji">{nota?.emoji ?? "✦"}</span>
      <span className="notaRenk" style={{ background: renk }} />
      {notaAd(id)}
    </span>
  );
}

export function SkorHalka({ oran }: { oran: number }) {
  const yuzde = Math.round(oran * 100);
  return (
    <div
      className="skorHalka"
      style={{ ["--oran" as string]: yuzde }}
      title={`Uyum puanı: %${yuzde}`}
    >
      %{yuzde}
    </div>
  );
}

const FIYAT_AD = { ekonomik: "₺", orta: "₺₺", luks: "₺₺₺" } as const;

export function ParfumKart({
  parfum,
  oneri,
  sira = 0,
  onDetay,
}: {
  parfum: Parfum;
  oneri?: Oneri;
  sira?: number;
  onDetay: (p: Parfum) => void;
}) {
  const { hesap, favoriToggle, geriBildirimVer } = useStore();
  const favori = hesap?.favoriler.includes(parfum.id) ?? false;
  const tepki = hesap?.geriBildirim[parfum.id];
  const topluluk = useMemo(() => toplulukVerisi(parfum), [parfum]);
  const aileler = Object.entries(parfum.aileler)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 2);
  const sahneRenk = AILE_RENK[(aileler[0]?.[0] ?? "amber") as Aile];

  return (
    <article className="pKart cam" style={{ ["--i" as string]: sira }}>
      <button
        className="siseSahne"
        style={{ ["--sahne" as string]: sahneRenk }}
        onClick={() => onDetay(parfum)}
        aria-label={`${parfum.ad} detayını aç`}
      >
        <SiseGorsel parfum={parfum} />
        {oneri && <div className="sahneSkor"><SkorHalka oran={oneri.skor} /></div>}
      </button>

      <div className="pKartUst">
        <div>
          <div className="pMarka">{parfum.marka}</div>
          <h3 className="pAd">{parfum.ad}</h3>
          <div className="pMeta">
            <span className="yildiz">★ {topluluk.puan.toFixed(1)}</span>
            <span>({oyFormat(topluluk.oySayisi)} oy)</span>
            <span>·</span>
            <span>{parfum.yil}</span>
            <span>·</span>
            <span>{parfum.nis_mi ? "Niş" : "Designer"}</span>
            <span>·</span>
            <span>{FIYAT_AD[parfum.fiyat_seviyesi]}</span>
          </div>
        </div>
      </div>

      <div className="etiketSira">
        {aileler.map(([a]) => (
          <span key={a} className="etiket">{AILE_ETIKET[a as Aile]}</span>
        ))}
      </div>

      {oneri && oneri.neden.length > 0 && (
        <div className="nedenKume">
          {oneri.neden.map((n, i) => (
            <span key={i} className="neden">{n}</span>
          ))}
        </div>
      )}

      <div className="piramit">
        {[...parfum.notalar.tepe.slice(0, 2), ...parfum.notalar.kalp.slice(0, 2), ...parfum.notalar.dip.slice(0, 2)].map((n) => (
          <NotaRozet key={n} id={n} />
        ))}
      </div>

      <div className="pKartAlt">
        <button
          className={`kalp ${favori ? "aktif" : ""}`}
          onClick={() => favoriToggle(parfum.id)}
          aria-label={favori ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          {favori ? "❤️" : "🤍"}
        </button>
        <button
          className={`tepki ${tepki === "begen" ? "aktif" : ""}`}
          onClick={() => geriBildirimVer(parfum.id, "begen")}
          title="Beğendim — önerilerimi buna göre keskinleştir"
        >
          👍
        </button>
        <button
          className={`tepki ${tepki === "begenme" ? "aktif" : ""}`}
          onClick={() => geriBildirimVer(parfum.id, "begenme")}
          title="Bana göre değil"
        >
          👎
        </button>
        <button className="btn btnCizgi btnKucuk" style={{ marginLeft: "auto" }} onClick={() => onDetay(parfum)}>
          İncele
        </button>
      </div>
    </article>
  );
}

const CINSIYET_METIN: Record<Cinsiyet, string> = {
  kadin: "kadınlar için",
  erkek: "erkekler için",
  unisex: "kadınlar ve erkekler için",
};

function tanitimMetni(p: Parfum): string {
  const aileler = Object.entries(p.aileler)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 2)
    .map(([a]) => AILE_ETIKET[a as Aile]);
  const liste = (ids: string[]) => ids.map((n) => notaAd(n)).join(", ");
  return `${p.marka} imzalı ${p.ad}, ${CINSIYET_METIN[p.cinsiyet]} ${aileler.join(" · ")} karakterinde bir koku. ${p.yil} yılında çıktı. Tepe notaları ${liste(p.notalar.tepe)}; kalp notaları ${liste(p.notalar.kalp)}; dip notaları ${liste(p.notalar.dip)}.`;
}

export function DetayPanel({
  parfum,
  onKapat,
  onBenzerSec,
}: {
  parfum: Parfum;
  onKapat: () => void;
  onBenzerSec: (p: Parfum) => void;
}) {
  const { hesap, favoriToggle, tiklamaKaydet } = useStore();
  const favori = hesap?.favoriler.includes(parfum.id) ?? false;
  const benzerler = useMemo(() => bunaBenzer(parfum, KATALOG, 6), [parfum]);
  const topluluk = useMemo(() => toplulukVerisi(parfum), [parfum]);
  const aileler = Object.entries(parfum.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  const sahneRenk = AILE_RENK[(aileler[0]?.[0] ?? "amber") as Aile];
  const maksNeZaman = Math.max(...topluluk.neZaman.map((z) => z.oran), 0.001);

  return (
    <div className="ortuKap" role="dialog" aria-modal>
      <div className="ortu" onClick={onKapat} />
      <div className="detayPanel">
        <button className="kapat" onClick={onKapat} aria-label="Kapat">✕</button>

        <div className="detayVitrin" style={{ ["--sahne" as string]: sahneRenk }}>
          <SiseGorsel parfum={parfum} buyuk />
          <div className="detayBaslik">
            <div className="pMarka">{parfum.marka} · {parfum.yil}</div>
            <h2>{parfum.ad}</h2>
            <div className="pMeta" style={{ marginBottom: 10 }}>
              <span className="yildiz">★ {topluluk.puan.toFixed(1)} / 5</span>
              <span>· {oyFormat(topluluk.oySayisi)} oy</span>
            </div>
            <div className="etiketSira">
              {aileler.map(([a]) => (
                <span key={a} className="etiket">{AILE_ETIKET[a as Aile]}</span>
              ))}
              <span className="etiket notr">{parfum.nis_mi ? "Niş" : "Designer"}</span>
              <span className="etiket notr">{FIYAT_AD[parfum.fiyat_seviyesi]}</span>
            </div>
          </div>
        </div>

        <p className="tanitim">{tanitimMetni(parfum)}</p>

        {/* Topluluk blokları — beğeni dağılımı ve ne zaman kullanılmalı */}
        <div className="toplulukIzgara">
          <div className="toplulukKutu">
            <h4>🩷 Beğeni Dağılımı</h4>
            <div className="oySutunlar">
              {topluluk.dagilim.map((d) => (
                <div key={d.etiket} className="oySutun" title={`${d.etiket}: ${oyFormat(d.sayi)}`}>
                  <span className="oyEmoji">{d.emoji}</span>
                  <span className="oyEtiket">{d.etiket}</span>
                  <div className="oyYol">
                    <div className="oyDolgu" style={{ width: `${Math.round(d.oran * 100)}%` }} />
                  </div>
                  <span className="oySayi">{oyFormat(d.sayi)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="toplulukKutu">
            <h4>🕰️ Ne Zaman Sıkmalı</h4>
            <div className="oySutunlar">
              {topluluk.neZaman.map((z) => (
                <div key={z.etiket} className="oySutun">
                  <span className="oyEmoji">{z.emoji}</span>
                  <span className="oyEtiket">{z.etiket}</span>
                  <div className="oyYol">
                    <div className="oyDolgu yesilDolgu" style={{ width: `${Math.round((z.oran / maksNeZaman) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uygulama içi hızlı önizleme: nota piramidi (Bölüm 9) */}
        <div className="piramitBolum">
          <h4>Tepe Notalar</h4>
          <div className="piramit">{parfum.notalar.tepe.map((n) => <NotaRozet key={n} id={n} />)}</div>
        </div>
        <div className="piramitBolum">
          <h4>Kalp Notalar</h4>
          <div className="piramit">{parfum.notalar.kalp.map((n) => <NotaRozet key={n} id={n} />)}</div>
        </div>
        <div className="piramitBolum">
          <h4>Dip Notalar</h4>
          <div className="piramit">{parfum.notalar.dip.map((n) => <NotaRozet key={n} id={n} />)}</div>
        </div>

        <div className="olcuSatir">
          <Olcu ad="Yoğunluk" deger={parfum.yogunluk} />
          <Olcu ad="Kalıcılık" deger={parfum.kalicilik} />
          <Olcu ad="Popülerlik" deger={parfum.populerlik} />
        </div>

        <div className="detayAksiyon">
          <a
            className="btn btnAna"
            href={parfum.fragrantica_url}
            target="_blank"
            rel="noreferrer"
            onClick={() => tiklamaKaydet(parfum.id)}
          >
            Fragrantica'da İncele ↗
          </a>
          <button className="btn btnCizgi" onClick={() => favoriToggle(parfum.id)}>
            {favori ? "❤️ Favoride" : "🤍 Favorile"}
          </button>
        </div>

        <div className="piramitBolum" style={{ marginTop: 30 }}>
          <h4>Buna Benzer</h4>
          <div className="benzerSira">
            {benzerler.map((b) => (
              <button key={b.id} className="benzerKart" onClick={() => onBenzerSec(b)}>
                <div className="benzerSise"><SiseGorsel parfum={b} /></div>
                <div className="pMarka">{b.marka}</div>
                <div className="ad">{b.ad}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Olcu({ ad, deger }: { ad: string; deger: number }) {
  return (
    <div className="olcu">
      <span>{ad}</span>
      <div className="olcuYol">
        <div className="olcuDolgu" style={{ width: `${Math.round(deger * 100)}%` }} />
      </div>
    </div>
  );
}

export function BosDurum({ ikon, baslik, alt }: { ikon: string; baslik: string; alt?: ReactNode }) {
  return (
    <div className="bosDurum">
      <div className="buyukIkon">{ikon}</div>
      <p className="serif" style={{ fontSize: 22, marginBottom: 6 }}>{baslik}</p>
      {alt && <p style={{ fontSize: 14 }}>{alt}</p>}
    </div>
  );
}

export function useDetay() {
  const [acik, setAcik] = useState<Parfum | null>(null);
  const { tiklamaKaydet } = useStore();
  const ac = (p: Parfum) => {
    tiklamaKaydet(p.id);
    setAcik(p);
  };
  return { acik, ac, kapat: () => setAcik(null) };
}
