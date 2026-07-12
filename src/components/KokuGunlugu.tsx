// Koku Günlüğü (SOTD) — "Bugün ne süründün?" günlük kayıt kartı.
// Günlük tutmak güçlü bir alışkanlık/geri dönüş mekaniğidir.
import { useMemo, useState } from "react";
import { KATALOG, PARFUM_MAP } from "../data/catalog";
import { useStore, bugunISO } from "../state/store";
import { SiseGorsel } from "./ui";
import type { Parfum } from "../engine/types";

export function SotdKart({ onDetay }: { onDetay: (p: Parfum) => void }) {
  const { hesap, gunlugeEkle, gunluktenCikar, favoriToggle } = useStore();
  const [seciciAcik, setSeciciAcik] = useState(false);
  const bugun = bugunISO();
  const bugunku = hesap?.gunluk?.find((g) => g.tarih === bugun);
  const parfum = bugunku ? PARFUM_MAP[bugunku.parfumId] : null;

  return (
    <section className="sotdKart cam">
      <div className="sotdBas">
        <span className="ustBaslik">📖 Koku Günlüğü</span>
        {(hesap?.gunluk?.length ?? 0) > 0 && (
          <span className="minik">{hesap!.gunluk!.length} gün kayıtlı</span>
        )}
      </div>

      {parfum ? (
        <div className="sotdDolu">
          <button className="sotdSise" onClick={() => onDetay(parfum)} aria-label={`${parfum.ad} detayı`}>
            <SiseGorsel parfum={parfum} />
          </button>
          <div className="sotdBilgi">
            <div className="minik">Bugün süründüğün:</div>
            <div className="pMarka">{parfum.marka}</div>
            <h3 className="serif" style={{ fontSize: 22, margin: "2px 0 8px" }}>{parfum.ad}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btnCizgi btnKucuk" onClick={() => setSeciciAcik(true)}>Değiştir</button>
              <button className="btn btnCizgi btnKucuk" onClick={() => gunluktenCikar(bugun)}>Kaldır</button>
              <button
                className={`btn btnKucuk ${hesap?.favoriler.includes(parfum.id) ? "btnCizgi" : "btnAna"}`}
                onClick={() => favoriToggle(parfum.id)}
              >
                {hesap?.favoriler.includes(parfum.id) ? "❤️ Favoride" : "🤍 Favorile"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="sotdBos">
          <p>Bugün hangi kokuyu süründün? Günlüğüne ekle — profilin öğrenir, serin büyür.</p>
          <button className="btn btnAna btnKucuk" onClick={() => setSeciciAcik(true)}>+ Bugünü kaydet</button>
        </div>
      )}

      {seciciAcik && (
        <SotdSecici
          onSec={(p) => { gunlugeEkle(p.id); setSeciciAcik(false); }}
          onKapat={() => setSeciciAcik(false)}
          favoriler={(hesap?.favoriler ?? []).map((id) => PARFUM_MAP[id]).filter(Boolean) as Parfum[]}
        />
      )}
    </section>
  );
}

function SotdSecici({ onSec, onKapat, favoriler }: { onSec: (p: Parfum) => void; onKapat: () => void; favoriler: Parfum[] }) {
  const [sorgu, setSorgu] = useState("");
  const sonuclar = useMemo(() => {
    const s = sorgu.trim().toLocaleLowerCase("tr");
    if (!s) return [];
    return KATALOG.filter(
      (p) => p.ad.toLocaleLowerCase("tr").includes(s) || p.marka.toLocaleLowerCase("tr").includes(s)
    ).slice(0, 6);
  }, [sorgu]);

  return (
    <div className="sotdSecici">
      <input
        className="girdi"
        autoFocus
        placeholder="Parfüm veya marka ara…"
        value={sorgu}
        onChange={(e) => setSorgu(e.target.value)}
      />
      {sorgu.trim() === "" && favoriler.length > 0 && (
        <>
          <p className="minik" style={{ margin: "10px 0 6px" }}>Favorilerinden hızlı seç:</p>
          <div className="cipKume">
            {favoriler.slice(0, 8).map((p) => (
              <button key={p.id} className="cip" onClick={() => onSec(p)}>{p.ad}</button>
            ))}
          </div>
        </>
      )}
      {sonuclar.map((p) => (
        <button key={p.id} className="karsiSonuc" onClick={() => onSec(p)}>
          <span className="pMarka">{p.marka}</span> {p.ad}
        </button>
      ))}
      <button className="atlaBtn" style={{ marginTop: 10 }} onClick={onKapat}>Vazgeç</button>
    </div>
  );
}
