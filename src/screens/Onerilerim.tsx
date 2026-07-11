// Bölüm 6 sonuç ekranı: kart galerisi, "neden önerildi", favori kalbi, tazele,
// ruh hali modu ve Koku Düellosu
import { useEffect, useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { oneriUret, sertFiltre } from "../engine/recommend";
import type { Oneri, Parfum, ProfilVektoru } from "../engine/types";
import { useStore } from "../state/store";
import { ParfumKart, DetayPanel, Partikuller, useDetay, BosDurum, SiseGorsel, SkorHalka } from "../components/ui";
import { AILE_RENK, AILE_ETIKET, AILELER, type Aile } from "../engine/types";
import { clamp01 } from "../engine/vector";

// Ruh hali → aile vurgusu: seçilince profil geçici olarak o yöne eğilir
const RUH_HALLERI: { id: string; etiket: string; emoji: string; aileler: Partial<Record<Aile, number>> }[] = [
  { id: "romantik", etiket: "Romantik", emoji: "💌", aileler: { cicek: 1, gurme: 0.5 } },
  { id: "enerjik", etiket: "Enerjik", emoji: "⚡", aileler: { narenciye: 1, aromatik: 0.8 } },
  { id: "gizemli", etiket: "Gizemli", emoji: "🌙", aileler: { amber: 1, deri: 0.6, odunsu: 0.4 } },
  { id: "huzurlu", etiket: "Huzurlu", emoji: "🍃", aileler: { yesil: 1, aromatik: 0.5 } },
  { id: "iddiali", etiket: "İddialı", emoji: "🔥", aileler: { sipr: 0.8, amber: 0.8 } },
  { id: "tatli", etiket: "Tatlı", emoji: "🍯", aileler: { gurme: 1 } },
];

function ruhHaliUygula(profil: ProfilVektoru, ruhHaliId: string | null): ProfilVektoru {
  if (!ruhHaliId) return profil;
  const ruh = RUH_HALLERI.find((r) => r.id === ruhHaliId);
  if (!ruh) return profil;
  const aile = { ...profil.aile };
  for (const a of AILELER) {
    aile[a] = clamp01(aile[a] * 0.55 + (ruh.aileler[a] ?? 0) * 0.45);
  }
  return { ...profil, aile };
}

export function Onerilerim({ onAnketeDon }: { onAnketeDon: () => void }) {
  const { hesap, oneriGecmisineEkle } = useStore();
  const detay = useDetay();
  const [hazirlaniyor, setHazirlaniyor] = useState(true);
  const [tur, setTur] = useState(0); // tazeleme sayacı
  const [oneriler, setOneriler] = useState<Oneri[]>([]);
  const [ruhHali, setRuhHali] = useState<string | null>(null);
  const [duelloAcik, setDuelloAcik] = useState(false);

  const profil = hesap?.profil ?? null;

  // Profil imzası: geri bildirimle vektör değiştikçe öneriler canlı güncellenir
  const profilImza = useMemo(() => JSON.stringify(profil), [profil]);

  useEffect(() => {
    // Düello sürerken yeniden hesaplama ertelenir; pencere kapanınca
    // biriken tüm galibiyet sinyalleriyle seçki tek seferde tazelenir.
    if (!profil || duelloAcik) return;
    setHazirlaniyor(true);
    const haric = tur > 0 ? new Set(hesap?.oneriGecmisi ?? []) : new Set<string>();
    const efektif = ruhHaliUygula(profil, ruhHali);
    const zaman = setTimeout(() => {
      setOneriler(oneriUret(efektif, KATALOG, { n: 12, haric }));
      setHazirlaniyor(false);
    }, tur === 0 ? 1600 : 700); // koku partikülleri animasyonu için kısa bekleme
    return () => clearTimeout(zaman);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilImza, tur, ruhHali, duelloAcik]);

  if (!profil) {
    return (
      <BosDurum
        ikon="🧪"
        baslik="Önce seni tanıyalım"
        alt={<button className="btn btnAna btnKucuk" onClick={onAnketeDon}>Ankete başla</button>}
      />
    );
  }

  if (hazirlaniyor) {
    return (
      <div className="hazirlaniyor">
        <Partikuller adet={26} />
        <div className="siseSalla">⚗️</div>
        <h3 className="serif">Koku profilin damıtılıyor…</h3>
        <p>Notalar eşleştiriliyor · aileler puanlanıyor · seçki çeşitlendiriliyor</p>
      </div>
    );
  }

  // Günün Kokusu: seçkiden güne göre dönen vitrin (her gün farklı)
  const gunIndeksi = Math.floor(Date.now() / 86400000) % Math.max(oneriler.length, 1);
  const gununKokusu = oneriler[gunIndeksi];

  return (
    <div className="girisAnim">
      {gununKokusu && (
        <GununKokusu oneri={gununKokusu} onDetay={detay.ac} />
      )}
      <div className="bolumBaslik">
        <h2>Senin Seçkin</h2>
        <span className="sayi">{oneriler.length} parfüm · sana göre puanlandı</span>
      </div>
      <p className="bolumAlt">
        Her kartta <em>neden önerildiğini</em> görürsün. 👍 / 👎 ile geri bildirim ver —
        profilin anında öğrenir ve seçki keskinleşir.
      </p>
      {/* Ruh hali modu: bugünkü moduna göre seçki anında yeniden puanlanır */}
      <div className="ruhKume">
        <span className="minik" style={{ marginRight: 4 }}>Bugün nasılsın?</span>
        {RUH_HALLERI.map((r) => (
          <button
            key={r.id}
            className={`cip ${ruhHali === r.id ? "secili" : ""}`}
            onClick={() => setRuhHali(ruhHali === r.id ? null : r.id)}
          >
            <span className="cipEmoji">{r.emoji}</span>
            {r.etiket}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          className="btn btnCizgi btnKucuk"
          onClick={() => {
            oneriGecmisineEkle(oneriler.map((o) => o.parfum.id));
            setTur((t) => t + 1);
          }}
        >
          ⟳ Yeni seçki getir
        </button>
        <button className="btn btnCizgi btnKucuk" onClick={() => setDuelloAcik(true)}>
          ⚔️ Koku Düellosu
        </button>
        <button className="btn btnCizgi btnKucuk" onClick={onAnketeDon}>
          Anketi güncelle
        </button>
      </div>

      <div className="kartIzgara">
        {oneriler.map((o, i) => (
          <ParfumKart key={o.parfum.id} parfum={o.parfum} oneri={o} sira={i} onDetay={detay.ac} />
        ))}
      </div>

      {duelloAcik && profil && (
        <KokuDuellosu profil={profil} onKapat={() => setDuelloAcik(false)} />
      )}

      {detay.acik && (
        <DetayPanel parfum={detay.acik} onKapat={detay.kapat} onBenzerSec={detay.ac} />
      )}
    </div>
  );
}

/* ⚔️ Koku Düellosu — "bu mu, şu mu?" 5 tur; her galip, öğrenen sisteme
   beğeni sinyali olarak akar ve seçki anında keskinleşir. */
function KokuDuellosu({ profil, onKapat }: { profil: ProfilVektoru; onKapat: () => void }) {
  const { duelloKaydet } = useStore();
  const TUR_SAYISI = 5;
  const [tur, setTur] = useState(0);

  const ciftler = useMemo(() => {
    const havuz = [...sertFiltre(KATALOG, profil)];
    for (let i = havuz.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [havuz[i], havuz[j]] = [havuz[j], havuz[i]];
    }
    const c: [Parfum, Parfum][] = [];
    for (let i = 0; i + 1 < havuz.length && c.length < TUR_SAYISI; i += 2) {
      c.push([havuz[i], havuz[i + 1]]);
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bitti = tur >= ciftler.length;
  const cift = ciftler[tur];

  function sec(kazanan: Parfum) {
    duelloKaydet(kazanan.id);
    setTur((t) => t + 1);
  }

  return (
    <div className="ortuKap" role="dialog" aria-modal>
      <div className="ortu" onClick={onKapat} />
      <div className="detayPanel duelloPanel">
        <button className="kapat" onClick={onKapat} aria-label="Kapat">✕</button>
        {bitti || !cift ? (
          <div className="duelloBitti">
            <div style={{ fontSize: 52 }}>✨</div>
            <h3 className="serif">Zevkin kaydedildi</h3>
            <p className="minik">
              {ciftler.length} tur boyunca verdiğin kararlar profil vektörüne işlendi —
              seçkin arka planda yeniden puanlandı.
            </p>
            <button className="btn btnAna" onClick={onKapat}>Seçkime dön</button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <span className="ustBaslik">⚔️ Koku Düellosu · {tur + 1} / {ciftler.length}</span>
              <h3 className="serif" style={{ fontSize: 26, marginTop: 8 }}>Hangisi daha çok sen?</h3>
            </div>
            <div className="duelloAlan">
              {[cift[0], cift[1]].map((p, i) => (
                <button key={p.id} className="duelloKart" onClick={() => sec(p)}>
                  <SiseGorsel parfum={p} />
                  <div className="pMarka">{p.marka}</div>
                  <div className="serif" style={{ fontSize: 19, lineHeight: 1.15 }}>{p.ad}</div>
                  <div className="etiketSira" style={{ justifyContent: "center", marginTop: 8 }}>
                    {Object.entries(p.aileler).sort((x, y) => (y[1] as number) - (x[1] as number)).slice(0, 2).map(([a]) => (
                      <span key={a} className="etiket">{AILE_ETIKET[a as Aile]}</span>
                    ))}
                  </div>
                  {i === 0 && <span className="duelloTus">← sol</span>}
                  {i === 1 && <span className="duelloTus">sağ →</span>}
                </button>
              ))}
              <div className="karsiVs serif duelloVs">vs</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GununKokusu({ oneri, onDetay }: { oneri: Oneri; onDetay: (p: Oneri["parfum"]) => void }) {
  const p = oneri.parfum;
  const anaAile = (Object.entries(p.aileler).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  )[0]?.[0] ?? "amber") as Aile;

  return (
    <section
      className="gununKokusu cam"
      style={{ ["--sahne" as string]: AILE_RENK[anaAile] }}
    >
      <div className="gununSise">
        <SiseGorsel parfum={p} buyuk />
      </div>
      <div className="gununIcerik">
        <span className="ustBaslik">✦ Günün Kokusu</span>
        <div className="pMarka" style={{ marginTop: 10 }}>{p.marka}</div>
        <h2 className="serif">{p.ad}</h2>
        <div className="etiketSira" style={{ margin: "8px 0 12px" }}>
          <span className="etiket">{AILE_ETIKET[anaAile]}</span>
          <span className="etiket notr">{p.nis_mi ? "Niş" : "Designer"}</span>
        </div>
        {oneri.neden[0] && <p className="minik" style={{ marginBottom: 16 }}>{oneri.neden[0]}.</p>}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btnAna btnKucuk" onClick={() => onDetay(p)}>Bugün bunu dene</button>
          <SkorHalka oran={oneri.skor} />
        </div>
      </div>
    </section>
  );
}
