// Koleksiyonlar — editoryal keşif sayfası: temalı yatay seçki şeritleri.
// "Tümünü gör" ile bir koleksiyon tam ekran modalda açılır.
import { useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { KOLEKSIYONLAR, type Koleksiyon } from "../engine/koleksiyonlar";
import type { Parfum, Aile } from "../engine/types";
import { AILE_ETIKET, AILE_RENK } from "../engine/types";
import { toplulukVerisi } from "../engine/topluluk";
import { useStore } from "../state/store";
import { useKatalogSurumu } from "../state/useKatalog";
import { ParfumKart, DetayPanel, SiseGorsel, useDetay, Modal } from "../components/ui";

export function Koleksiyonlar() {
  const detay = useDetay();
  const { hesap, favoriToggle } = useStore();
  const katalogSurum = useKatalogSurumu();
  const [acikKol, setAcikKol] = useState<Koleksiyon | null>(null);

  // Her koleksiyonun seçkisi katalog yüklendikçe hesaplanır (boşlar gizlenir)
  const seckiler = useMemo(
    () => KOLEKSIYONLAR.map((kol) => ({ kol, liste: kol.sec(KATALOG) })).filter((x) => x.liste.length >= 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [katalogSurum]
  );

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>Koleksiyonlar</h2>
        <span className="sayi">{seckiler.length} temalı seçki</span>
      </div>
      <p className="bolumAlt">
        Editoryal seçkiler — mevsime, ortama ve topluluğun beğenisine göre derlenmiş
        koku dünyaları. Bir şeride göz at, beğendiğine dokun.
        {katalogSurum === 0 && " · katalog yükleniyor…"}
      </p>

      <div className="kolSeritler">
        {seckiler.map(({ kol, liste }) => (
          <section key={kol.id} className="kolSerit">
            <div className="kolSeritBas">
              <div>
                <h3 className="serif">
                  <span className="kolEmoji">{kol.emoji}</span> {kol.baslik}
                </h3>
                <p className="minik">{kol.aciklama}</p>
              </div>
              <button className="btn btnCizgi btnKucuk" onClick={() => setAcikKol(kol)}>
                Tümünü gör →
              </button>
            </div>
            <div className="kolRaf">
              {liste.slice(0, 10).map((p) => (
                <MiniKart key={p.id} parfum={p} onAc={() => detay.ac(p)} favori={hesap?.favoriler.includes(p.id) ?? false} onFavori={() => favoriToggle(p.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {acikKol && (
        <Modal onKapat={() => setAcikKol(null)} genis>
          <div style={{ marginBottom: 18 }}>
            <span className="ustBaslik">{acikKol.emoji} Koleksiyon</span>
            <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,38px)", margin: "6px 0 6px" }}>{acikKol.baslik}</h2>
            <p className="minik" style={{ maxWidth: "56ch" }}>{acikKol.aciklama}</p>
          </div>
          <div className="kartIzgara">
            {acikKol.sec(KATALOG).map((p, i) => (
              <ParfumKart key={p.id} parfum={p} sira={Math.min(i, 8)} onDetay={(x) => { setAcikKol(null); detay.ac(x); }} />
            ))}
          </div>
        </Modal>
      )}

      {detay.acik && (
        <DetayPanel parfum={detay.acik} onKapat={detay.kapat} onBenzerSec={detay.ac} />
      )}
    </div>
  );
}

// Yatay rafta gösterilen kompakt kart
function MiniKart({ parfum, onAc, favori, onFavori }: { parfum: Parfum; onAc: () => void; favori: boolean; onFavori: () => void }) {
  const topluluk = useMemo(() => toplulukVerisi(parfum), [parfum]);
  const anaAile = (Object.entries(parfum.aileler).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "amber") as Aile;
  return (
    <article className="miniKart cam" style={{ ["--sahne" as string]: AILE_RENK[anaAile] }}>
      <button className="miniSise" onClick={onAc} aria-label={`${parfum.ad} detayı`}>
        <SiseGorsel parfum={parfum} />
      </button>
      <button
        className={`kalp kalpMini ${favori ? "aktif" : ""}`}
        onClick={onFavori}
        aria-label={favori ? "Favoriden çıkar" : "Favorile"}
      >
        {favori ? "❤️" : "🤍"}
      </button>
      <div className="miniBilgi" onClick={onAc}>
        <div className="pMarka">{parfum.marka}</div>
        <div className="miniAd serif">{parfum.ad}</div>
        <div className="pMeta">
          <span className="yildiz">★ {topluluk.puan.toFixed(1)}</span>
          <span>·</span>
          <span>{AILE_ETIKET[anaAile]}</span>
        </div>
      </div>
    </article>
  );
}
