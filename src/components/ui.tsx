import { useMemo, useState, type ReactNode } from "react";
import type { Parfum, Oneri, Aile } from "../engine/types";
import { AILE_ETIKET } from "../engine/types";
import { NOTA_MAP, KATEGORI_RENK, notaAd } from "../data/notes";
import { KATALOG } from "../data/catalog";
import { bunaBenzer } from "../engine/recommend";
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

export function NotaRozet({ id }: { id: string }) {
  const nota = NOTA_MAP[id];
  const renk = nota ? KATEGORI_RENK[nota.kategori] : "#999";
  return (
    <span className="rozet">
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
  const aileler = Object.entries(parfum.aileler)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 2);

  return (
    <article className="pKart cam" style={{ ["--i" as string]: sira }}>
      <div className="pKartUst">
        <div>
          <div className="pMarka">{parfum.marka}</div>
          <h3 className="pAd">{parfum.ad}</h3>
          <div className="pMeta">
            <span>{parfum.yil}</span>
            <span>·</span>
            <span>{parfum.nis_mi ? "Niş" : "Designer"}</span>
            <span>·</span>
            <span>{FIYAT_AD[parfum.fiyat_seviyesi]}</span>
          </div>
        </div>
        {oneri && <SkorHalka oran={oneri.skor} />}
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
  const aileler = Object.entries(parfum.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );

  return (
    <div className="ortuKap" role="dialog" aria-modal>
      <div className="ortu" onClick={onKapat} />
      <div className="detayPanel">
        <button className="kapat" onClick={onKapat} aria-label="Kapat">✕</button>

        <div className="detayBaslik">
          <div className="pMarka">{parfum.marka} · {parfum.yil}</div>
          <h2>{parfum.ad}</h2>
          <div className="etiketSira">
            {aileler.map(([a]) => (
              <span key={a} className="etiket">{AILE_ETIKET[a as Aile]}</span>
            ))}
            <span className="etiket notr">{parfum.nis_mi ? "Niş" : "Designer"}</span>
            <span className="etiket notr">{FIYAT_AD[parfum.fiyat_seviyesi]}</span>
          </div>
        </div>

        {/* Uygulama içi hızlı önizleme: nota özeti (Bölüm 9) */}
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
