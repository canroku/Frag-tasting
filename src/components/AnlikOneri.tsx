// Anlık Öneri — "Bugün ne var?" hızlı durum bazlı parfüm + kombin önerisi.
// Kullanıcı durumu seçer (randevu, iş, gece, davet…), o ana uygun parfümlere
// hızlıca ulaşır; bir parfüm seçince cinsiyetine göre kombin önerisi görür.
import { useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { OKAZYONLAR, anlikOneriler, kombinOner, type Okazyon } from "../engine/kombin";
import type { Parfum, Cinsiyet } from "../engine/types";
import { AILE_ETIKET, AILE_RENK, type Aile } from "../engine/types";
import { useStore } from "../state/store";
import { useKatalogSurumu } from "../state/useKatalog";
import { SiseGorsel, Modal } from "./ui";

export function AnlikGiris({ onAc }: { onAc: () => void }) {
  return (
    <button className="anlikGiris cam" onClick={onAc}>
      <span className="anlikIkon">🎯</span>
      <span className="anlikMetin">
        <span className="serif anlikBaslik">Bugün ne var?</span>
        <span className="minik">Randevu, iş, gece… ana göre hızlı koku + kombin önerisi</span>
      </span>
      <span className="anlikOk">→</span>
    </button>
  );
}

export function AnlikModal({ onKapat, onDetay }: { onKapat: () => void; onDetay: (p: Parfum) => void }) {
  const { hesap } = useStore();
  const katalogSurum = useKatalogSurumu();
  const [okazyon, setOkazyon] = useState<Okazyon | null>(null);
  const [secili, setSecili] = useState<Parfum | null>(null);

  // Arka planda belirtilen cinsiyet (anketten). fark_etmez ise kullanıcı seçebilir.
  const profilCinsiyet = hesap?.anket?.hedef_cinsiyet ?? "fark_etmez";
  const [cinsiyet, setCinsiyet] = useState<Cinsiyet | "fark_etmez">(profilCinsiyet);

  const oneriler = useMemo(
    () => (okazyon ? anlikOneriler(KATALOG, okazyon, cinsiyet, hesap?.profil ?? null, 8) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [okazyon, cinsiyet, hesap?.profil, katalogSurum]
  );

  return (
    <Modal onKapat={onKapat} genis>
      {!okazyon ? (
        <div>
          <span className="ustBaslik">🎯 Anlık Öneri</span>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,34px)", margin: "6px 0 6px" }}>Bugün ne var?</h2>
          <p className="minik" style={{ marginBottom: 20 }}>
            Durumu seç — o ana en uygun kokulara saniyeler içinde ulaş.
          </p>
          <div className="okazyonIzgara">
            {OKAZYONLAR.map((o) => (
              <button key={o.id} className="okazyonKart" onClick={() => setOkazyon(o)}>
                <span className="okazyonEmoji">{o.emoji}</span>
                <span className="serif okazyonAd">{o.ad}</span>
                <span className="minik">{o.aciklama}</span>
              </button>
            ))}
          </div>
        </div>
      ) : secili ? (
        <KombinGorunum
          parfum={secili}
          okazyon={okazyon}
          cinsiyet={cinsiyet}
          onGeri={() => setSecili(null)}
          onDetay={() => { onDetay(secili); onKapat(); }}
        />
      ) : (
        <div>
          <button className="atlaBtn" onClick={() => setOkazyon(null)}>← Durum değiştir</button>
          <div className="anlikBas">
            <div>
              <span className="ustBaslik">{okazyon.emoji} {okazyon.ad}</span>
              <h2 className="serif" style={{ fontSize: "clamp(22px,3.5vw,30px)", margin: "4px 0 2px" }}>Bu an için seçkin</h2>
              <p className="minik">{okazyon.aciklama}</p>
            </div>
            <div className="cinsSecim">
              {(["kadin", "erkek", "fark_etmez"] as const).map((c) => (
                <button
                  key={c}
                  className={`cip ${cinsiyet === c ? "secili" : ""}`}
                  onClick={() => setCinsiyet(c)}
                >
                  {c === "kadin" ? "Kadın" : c === "erkek" ? "Erkek" : "Hepsi"}
                </button>
              ))}
            </div>
          </div>

          {oneriler.length === 0 ? (
            <p className="minik" style={{ marginTop: 20 }}>Bu filtreyle sonuç yok — cinsiyeti "Hepsi" yapmayı dene.</p>
          ) : (
            <div className="anlikIzgara">
              {oneriler.map((p) => (
                <button key={p.id} className="anlikKart cam" onClick={() => setSecili(p)}>
                  <div className="anlikSise" style={{ ["--sahne" as string]: AILE_RENK[(Object.entries(p.aileler).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "amber") as Aile] }}>
                    <SiseGorsel parfum={p} />
                  </div>
                  <div className="pMarka">{p.marka}</div>
                  <div className="serif anlikKartAd">{p.ad}</div>
                  <span className="kombinEtiket">👔 Kombin öner</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function KombinGorunum({
  parfum, okazyon, cinsiyet, onGeri, onDetay,
}: {
  parfum: Parfum; okazyon: Okazyon; cinsiyet: Cinsiyet | "fark_etmez";
  onGeri: () => void; onDetay: () => void;
}) {
  const kombin = useMemo(() => kombinOner(parfum, okazyon, cinsiyet), [parfum, okazyon, cinsiyet]);
  const anaAile = (Object.entries(parfum.aileler).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "amber") as Aile;

  return (
    <div>
      <button className="atlaBtn" onClick={onGeri}>← Listeye dön</button>
      <div className="kombinVitrin" style={{ ["--sahne" as string]: AILE_RENK[anaAile] }}>
        <div className="kombinSise"><SiseGorsel parfum={parfum} buyuk /></div>
        <div>
          <span className="ustBaslik">{okazyon.emoji} {okazyon.ad} · kombin</span>
          <div className="pMarka" style={{ marginTop: 8 }}>{parfum.marka}</div>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,32px)" }}>{parfum.ad}</h2>
          <div className="etiketSira" style={{ marginTop: 8 }}>
            <span className="etiket">{AILE_ETIKET[anaAile]}</span>
          </div>
        </div>
      </div>

      <div className="kombinKutu">
        <h4>👗 Kombin Önerisi</h4>
        <ul className="kombinListe">
          {kombin.parcalar.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
        <div className="kombinPalet">
          <span className="kombinPaletBaslik">🎨 Renk & doku</span>
          <span>{kombin.palet}</span>
        </div>
        <p className="kombinIpucu">💡 {kombin.ipucu}</p>
      </div>

      <button className="btn btnAna" style={{ marginTop: 18 }} onClick={onDetay}>
        Parfümün tüm detayı →
      </button>
    </div>
  );
}
