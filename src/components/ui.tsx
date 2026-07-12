import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Parfum, Oneri, Aile, Cinsiyet } from "../engine/types";
import { AILE_ETIKET, AILE_RENK, fragranticaLink } from "../engine/types";
import { NOTA_MAP, KATEGORI_RENK, notaAd } from "../data/notes";
import { KATALOG } from "../data/catalog";
import { bunaBenzer, muadilBul } from "../engine/recommend";
import { toplulukVerisi, oyFormat } from "../engine/topluluk";
import { gorselKaynak } from "../data/gorsel";
import { useStore } from "../state/store";
import { useKatalogSurumu } from "../state/useKatalog";

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
  // Gerçek ürün fotoğrafı tanımlıysa onu göster; yüklenemezse (kırık link,
  // ağ hatası, engelli host) sessizce illüstrasyona düş.
  const [fotoHata, setFotoHata] = useState(false);
  const gorsel = gorselKaynak(parfum);
  if (gorsel && !fotoHata) {
    return (
      <img
        src={gorsel}
        alt={`${parfum.marka} ${parfum.ad} şişesi`}
        className={buyuk ? "sise siseBuyuk siseFoto" : "sise siseFoto"}
        loading="lazy"
        onError={() => setFotoHata(true)}
      />
    );
  }

  const aileler = Object.entries(parfum.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  const renk1 = AILE_RENK[(aileler[0]?.[0] ?? "amber") as Aile];
  const renk2 = AILE_RENK[(aileler[1]?.[0] ?? aileler[0]?.[0] ?? "odunsu") as Aile];
  const h = idHash(parfum.id);
  const sekil = h % 4;
  const dolum = 58 + (h % 26); // şişedeki parfüm seviyesi (%)
  const koyu = h % 3 === 0; // bazı şişeler koyu camdan
  const bas = parfum.marka
    .split(/\s+/)
    .map((k) => k[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr");

  // silüetler: gövde x/geniş/köşe, omuz eğimi, boyun ve kapak oranı
  const s = [
    { x: 22, w: 56, rx: 7, omuz: 10, boyun: 14, kapakH: 15, kapakYuvarlak: 2 },
    { x: 27, w: 46, rx: 21, omuz: 4, boyun: 11, kapakH: 20, kapakYuvarlak: 6 },
    { x: 18, w: 64, rx: 4, omuz: 14, boyun: 18, kapakH: 11, kapakYuvarlak: 1.5 },
    { x: 25, w: 50, rx: 12, omuz: 7, boyun: 10, kapakH: 24, kapakYuvarlak: 5 },
  ][sekil];
  const gid = `g${parfum.id}`;
  const gTop = 30;
  const gH = 92;
  const dolumY = gTop + s.omuz + ((gH - s.omuz) * (100 - dolum)) / 100;

  return (
    <svg
      viewBox="0 0 100 138"
      className={buyuk ? "sise siseBuyuk" : "sise"}
      role="img"
      aria-label={`${parfum.ad} şişe illüstrasyonu`}
    >
      <defs>
        {/* parfüm sıvısı: yüzeyde açık, dipte doygun */}
        <linearGradient id={gid} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={renk1} stopOpacity="0.72" />
          <stop offset="55%" stopColor={renk1} stopOpacity="0.92" />
          <stop offset="100%" stopColor={renk2} stopOpacity="0.98" />
        </linearGradient>
        {/* cam: kenarlarda yoğun, ortada saydam */}
        <linearGradient id={`${gid}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbf7f1" stopOpacity="0.28" />
          <stop offset="12%" stopColor="#fbf7f1" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#fbf7f1" stopOpacity="0.1" />
          <stop offset="88%" stopColor="#0a0208" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0a0208" stopOpacity="0.4" />
        </linearGradient>
        {/* metalik kapak */}
        <linearGradient id={`${gid}c`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8f8272" />
          <stop offset="30%" stopColor="#f0e6d6" />
          <stop offset="55%" stopColor="#c4b49d" />
          <stop offset="80%" stopColor="#7d7060" />
          <stop offset="100%" stopColor="#5c5245" />
        </linearGradient>
        <radialGradient id={`${gid}s`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* zemin gölgesi */}
      <ellipse cx="50" cy="128" rx={s.w / 2 + 4} ry="6" fill={`url(#${gid}s)`} />

      {/* kapak + bilezik */}
      <rect x={50 - s.boyun / 2 - 4.5} y={24 - s.kapakH} width={s.boyun + 9} height={s.kapakH} rx={s.kapakYuvarlak} fill={`url(#${gid}c)`} />
      <rect x={50 - s.boyun / 2 - 2.5} y="24" width={s.boyun + 5} height="4" rx="1.5" fill="#9c8d78" />

      {/* boyun */}
      <rect x={50 - s.boyun / 2} y="27" width={s.boyun} height={gTop - 27 + s.omuz} fill={`url(#${gid}g)`} stroke="rgba(251,247,241,0.22)" strokeWidth="0.8" />

      {/* gövde: omuzlu cam form */}
      <path
        d={`M ${s.x} ${gTop + s.omuz + s.rx}
            Q ${s.x} ${gTop + s.omuz} ${s.x + s.rx} ${gTop + s.omuz}
            L ${50 - s.boyun / 2} ${gTop + s.omuz} L ${50 - s.boyun / 2} ${gTop}
            L ${50 + s.boyun / 2} ${gTop} L ${50 + s.boyun / 2} ${gTop + s.omuz}
            L ${s.x + s.w - s.rx} ${gTop + s.omuz}
            Q ${s.x + s.w} ${gTop + s.omuz} ${s.x + s.w} ${gTop + s.omuz + s.rx}
            L ${s.x + s.w} ${gTop + gH - s.rx}
            Q ${s.x + s.w} ${gTop + gH} ${s.x + s.w - s.rx} ${gTop + gH}
            L ${s.x + s.rx} ${gTop + gH}
            Q ${s.x} ${gTop + gH} ${s.x} ${gTop + gH - s.rx} Z`}
        fill={koyu ? "rgba(12,4,10,0.72)" : "rgba(251,247,241,0.07)"}
        stroke="rgba(251,247,241,0.3)"
        strokeWidth="1.2"
      />

      {/* sıvı + menisküs */}
      <rect
        x={s.x + 2.5}
        y={dolumY}
        width={s.w - 5}
        height={gTop + gH - dolumY - 2.5}
        rx={Math.max(3, s.rx - 3)}
        fill={`url(#${gid})`}
        opacity={koyu ? 0.85 : 1}
      />
      <ellipse cx="50" cy={dolumY} rx={(s.w - 5) / 2} ry="2.2" fill={renk1} opacity="0.55" />

      {/* cam katmanı ve parlamalar */}
      <rect x={s.x} y={gTop + s.omuz} width={s.w} height={gH - s.omuz} rx={s.rx} fill={`url(#${gid}g)`} />
      <rect x={s.x + 5} y={gTop + s.omuz + 6} width="5.5" height={gH - s.omuz - 18} rx="2.7" fill="rgba(255,255,255,0.35)" />
      <rect x={s.x + 12} y={gTop + s.omuz + 10} width="2" height={gH - s.omuz - 30} rx="1" fill="rgba(255,255,255,0.18)" />

      {/* marka etiketi */}
      <rect x="33" y="68" width="34" height="26" rx="2.5" fill={koyu ? "rgba(251,247,241,0.92)" : "rgba(18,5,16,0.6)"} stroke="rgba(251,247,241,0.35)" strokeWidth="0.7" />
      <line x1="37" y1="73" x2="63" y2="73" stroke={koyu ? "rgba(18,5,16,0.4)" : "rgba(251,247,241,0.4)"} strokeWidth="0.6" />
      <text x="50" y="86" textAnchor="middle" fontSize="10.5" fontFamily="Georgia, serif" fill={koyu ? "#1d0a19" : "#fbf7f1"} letterSpacing="1.2">
        {bas}
      </text>
      <line x1="37" y1="90" x2="63" y2="90" stroke={koyu ? "rgba(18,5,16,0.4)" : "rgba(251,247,241,0.4)"} strokeWidth="0.6" />
    </svg>
  );
}

// Modal katmanı — createPortal ile doğrudan body'ye takılır. Böylece
// animasyonlu kartların transform'u fixed konumlandırmayı bozamaz ve panel
// her zaman viewport'a göre ortalanır. ESC ile kapanır, arka plan kilitlenir.
export function Modal({
  onKapat,
  children,
  genis = false,
}: {
  onKapat: () => void;
  children: ReactNode;
  genis?: boolean;
}) {
  useEffect(() => {
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onKapat();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = oncekiTasma;
      window.removeEventListener("keydown", esc);
    };
  }, [onKapat]);

  return createPortal(
    <div className="ortuKap" role="dialog" aria-modal>
      <div className="ortu" onClick={onKapat} />
      <div className={`detayPanel ${genis ? "detayGenis" : ""}`}>
        <button className="kapat" onClick={onKapat} aria-label="Kapat">✕</button>
        {children}
      </div>
    </div>,
    document.body
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
  const katalogSurum = useKatalogSurumu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const benzerler = useMemo(() => bunaBenzer(parfum, KATALOG, 6), [parfum, katalogSurum]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const muadiller = useMemo(() => muadilBul(parfum, KATALOG, 4), [parfum, katalogSurum]);
  const topluluk = useMemo(() => toplulukVerisi(parfum), [parfum]);
  const [karsiB, setKarsiB] = useState<Parfum | null>(null);
  const [karsiSecimAcik, setKarsiSecimAcik] = useState(false);
  const aileler = Object.entries(parfum.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  const sahneRenk = AILE_RENK[(aileler[0]?.[0] ?? "amber") as Aile];
  const maksNeZaman = Math.max(...topluluk.neZaman.map((z) => z.oran), 0.001);

  // Karşılaştırma görünümü açıksa panelin içeriği tamamen ona döner
  if (karsiB) {
    return (
      <Modal onKapat={onKapat}>
        <KarsilastirmaGorunum a={parfum} b={karsiB} onGeri={() => setKarsiB(null)} />
      </Modal>
    );
  }

  return (
    <Modal onKapat={onKapat}>
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
            href={fragranticaLink(parfum)}
            target="_blank"
            rel="noreferrer"
            onClick={() => tiklamaKaydet(parfum.id)}
          >
            Fragrantica'da İncele ↗
          </a>
          <button className="btn btnCizgi" onClick={() => favoriToggle(parfum.id)}>
            {favori ? "❤️ Favoride" : "🤍 Favorile"}
          </button>
          <button className="btn btnCizgi" onClick={() => setKarsiSecimAcik((a) => !a)}>
            ⚖️ Karşılaştır
          </button>
        </div>

        {karsiSecimAcik && (
          <KarsiSecici mevcutId={parfum.id} onSec={(p) => { setKarsiB(p); setKarsiSecimAcik(false); }} />
        )}

        {/* 💸 Muadil Bul — daha uygun fiyatlı, koku olarak yakın alternatifler */}
        {muadiller.length > 0 && (
          <div className="piramitBolum" style={{ marginTop: 30 }}>
            <h4>💸 Daha Uygun Muadiller</h4>
            <p className="minik" style={{ marginBottom: 10 }}>
              Benzer koku profili, daha dost fiyat — kokusunu sevdiysen bunları da dene.
            </p>
            <div className="muadilListe">
              {muadiller.map(({ parfum: m, benzerlik }) => (
                <button key={m.id} className="muadilKart" onClick={() => onBenzerSec(m)}>
                  <div className="benzerSise"><SiseGorsel parfum={m} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pMarka">{m.marka}</div>
                    <div className="serif" style={{ fontSize: 16 }}>{m.ad}</div>
                    <div className="pMeta">
                      <span>{FIYAT_AD[m.fiyat_seviyesi]}</span>
                      <span>·</span>
                      <span className="muadilYuzde">%{Math.round(benzerlik * 100)} benzer</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
    </Modal>
  );
}

// Karşılaştırılacak ikinci parfümü seçtiren mini arama
function KarsiSecici({ mevcutId, onSec }: { mevcutId: string; onSec: (p: Parfum) => void }) {
  const [sorgu, setSorgu] = useState("");
  const sonuclar = useMemo(() => {
    const s = sorgu.trim().toLocaleLowerCase("tr");
    if (!s) return [];
    return KATALOG.filter(
      (p) =>
        p.id !== mevcutId &&
        (p.ad.toLocaleLowerCase("tr").includes(s) || p.marka.toLocaleLowerCase("tr").includes(s))
    ).slice(0, 5);
  }, [sorgu, mevcutId]);

  return (
    <div className="karsiSecici">
      <input
        className="girdi"
        autoFocus
        placeholder="Neyle karşılaştıralım? Parfüm veya marka yaz…"
        value={sorgu}
        onChange={(e) => setSorgu(e.target.value)}
      />
      {sonuclar.map((p) => (
        <button key={p.id} className="karsiSonuc" onClick={() => onSec(p)}>
          <span className="pMarka">{p.marka}</span> {p.ad}
        </button>
      ))}
    </div>
  );
}

// ⚖️ Yan yana karşılaştırma: ortak/farklı notalar, ölçüler, mevsimler
export function KarsilastirmaGorunum({ a, b, onGeri }: { a: Parfum; b: Parfum; onGeri: () => void }) {
  const ta = toplulukVerisi(a);
  const tb = toplulukVerisi(b);
  const notalarA = new Set([...a.notalar.tepe, ...a.notalar.kalp, ...a.notalar.dip]);
  const notalarB = new Set([...b.notalar.tepe, ...b.notalar.kalp, ...b.notalar.dip]);
  const ortak = [...notalarA].filter((n) => notalarB.has(n));
  const sadeceA = [...notalarA].filter((n) => !notalarB.has(n));
  const sadeceB = [...notalarB].filter((n) => !notalarA.has(n));

  const Sutun = ({ p, t }: { p: Parfum; t: ReturnType<typeof toplulukVerisi> }) => (
    <div className="karsiSutun">
      <div className="karsiSise"><SiseGorsel parfum={p} /></div>
      <div className="pMarka">{p.marka}</div>
      <div className="serif" style={{ fontSize: 20, lineHeight: 1.15 }}>{p.ad}</div>
      <div className="pMeta" style={{ justifyContent: "center" }}>
        <span className="yildiz">★ {t.puan.toFixed(1)}</span>
        <span>· {p.yil}</span>
      </div>
    </div>
  );

  const OlcuKiyas = ({ ad, va, vb }: { ad: string; va: number; vb: number }) => (
    <div className="kiyasSatir">
      <div className="kiyasYol sol"><div className="kiyasDolgu" style={{ width: `${Math.round(va * 100)}%` }} /></div>
      <span className="kiyasAd">{ad}</span>
      <div className="kiyasYol"><div className="kiyasDolgu" style={{ width: `${Math.round(vb * 100)}%` }} /></div>
    </div>
  );

  return (
    <div>
      <button className="atlaBtn" onClick={onGeri}>← Detaya dön</button>
      <div className="karsiBaslik">
        <Sutun p={a} t={ta} />
        <div className="karsiVs serif">vs</div>
        <Sutun p={b} t={tb} />
      </div>

      <div className="kiyasKume">
        <OlcuKiyas ad="Yoğunluk" va={a.yogunluk} vb={b.yogunluk} />
        <OlcuKiyas ad="Kalıcılık" va={a.kalicilik} vb={b.kalicilik} />
        <OlcuKiyas ad="Popülerlik" va={a.populerlik} vb={b.populerlik} />
        <OlcuKiyas ad="Kış" va={a.mevsim.kis} vb={b.mevsim.kis} />
        <OlcuKiyas ad="Yaz" va={a.mevsim.yaz} vb={b.mevsim.yaz} />
        <OlcuKiyas ad="Gece" va={a.ortam.gece ?? 0} vb={b.ortam.gece ?? 0} />
      </div>

      {ortak.length > 0 && (
        <div className="piramitBolum">
          <h4>🤝 Ortak Notalar</h4>
          <div className="piramit">{ortak.map((n) => <NotaRozet key={n} id={n} />)}</div>
        </div>
      )}
      <div className="piramitBolum">
        <h4>Sadece {a.ad}</h4>
        <div className="piramit">{sadeceA.map((n) => <NotaRozet key={n} id={n} />)}</div>
      </div>
      <div className="piramitBolum">
        <h4>Sadece {b.ad}</h4>
        <div className="piramit">{sadeceB.map((n) => <NotaRozet key={n} id={n} />)}</div>
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
