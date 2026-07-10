// Bölüm 8 + 10 — Profil: favoriler, listeler, geçmiş, koku profili, "anketi güncelle", veri silme
import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { PARFUM_MAP, KATALOG } from "../data/catalog";
import { AILELER, AILE_ETIKET } from "../engine/types";
import type { Parfum } from "../engine/types";
import { ParfumKart, DetayPanel, useDetay, BosDurum } from "../components/ui";

export function Profil({ onAnketeDon }: { onAnketeDon: () => void }) {
  const {
    hesap, cikisYap, listeOlustur, listeyeEkle, listedenCikar,
  } = useStore();
  const detay = useDetay();
  const [yeniListeAd, setYeniListeAd] = useState("");

  const favoriler = useMemo(
    () => (hesap?.favoriler ?? []).map((id) => PARFUM_MAP[id]).filter(Boolean) as Parfum[],
    [hesap?.favoriler]
  );
  const tiklananlar = useMemo(
    () => (hesap?.tiklananlar ?? []).slice(0, 8).map((id) => PARFUM_MAP[id]).filter(Boolean) as Parfum[],
    [hesap?.tiklananlar]
  );

  if (!hesap) return null;

  const aileProfili = hesap.profil
    ? AILELER.map((a) => ({ aile: a, deger: hesap.profil!.aile[a] })).sort((x, y) => y.deger - x.deger).slice(0, 6)
    : [];

  function verileriSil() {
    if (!confirm("Tüm hesap verilerin bu cihazdan kalıcı olarak silinecek. Emin misin?")) return;
    localStorage.clear();
    location.reload();
  }

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>Merhaba, {hesap.ad}</h2>
      </div>
      <p className="bolumAlt">{hesap.email}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <button className="btn btnCizgi btnKucuk" onClick={onAnketeDon}>Anketi güncelle</button>
        <button className="btn btnCizgi btnKucuk" onClick={cikisYap}>Çıkış yap</button>
        <button className="btn btnCizgi btnKucuk" style={{ color: "var(--danger)" }} onClick={verileriSil}>
          Verilerimi sil
        </button>
      </div>

      <div className="profilIzgara">
        {/* Koku profili */}
        <div className="profilKart cam">
          <h3>🧬 Koku Profilin</h3>
          {hesap.profil ? (
            <>
              {aileProfili.map(({ aile, deger }) => (
                <div key={aile} className="aileCubugu">
                  <span>{AILE_ETIKET[aile]}</span>
                  <div className="olcuYol"><div className="olcuDolgu" style={{ width: `${Math.round(deger * 100)}%` }} /></div>
                  <span>{Math.round(deger * 100)}</span>
                </div>
              ))}
              <p className="minik" style={{ marginTop: 12 }}>
                Profil, verdiğin her 👍/👎 ve favori ile canlı olarak öğrenir.
              </p>
            </>
          ) : (
            <p className="minik">Henüz anket doldurulmadı.</p>
          )}
        </div>

        {/* Listeler */}
        <div className="profilKart cam">
          <h3>🗂️ Koleksiyonların</h3>
          {hesap.listeler.length === 0 && (
            <p className="minik" style={{ marginBottom: 12 }}>
              "Kışlıklar", "Denemek istediklerim" gibi listeler oluştur.
            </p>
          )}
          {hesap.listeler.map((l) => (
            <div key={l.id} style={{ marginBottom: 10 }}>
              <div className="listeSatir">
                <strong>{l.ad}</strong>
                <span className="soluk">{l.parfumler.length} parfüm</span>
              </div>
              {l.parfumler.map((pid) => {
                const p = PARFUM_MAP[pid];
                if (!p) return null;
                return (
                  <div key={pid} className="listeSatir" style={{ paddingLeft: 12 }}>
                    <button className="minik" style={{ textAlign: "left" }} onClick={() => detay.ac(p)}>
                      {p.marka} — {p.ad}
                    </button>
                    <button className="soluk" onClick={() => listedenCikar(l.id, pid)}>✕</button>
                  </div>
                );
              })}
              {favoriler.length > 0 && (
                <FavoridenEkle
                  favoriler={favoriler.filter((f) => !l.parfumler.includes(f.id))}
                  onEkle={(pid) => listeyeEkle(l.id, pid)}
                />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              className="girdi"
              style={{ padding: "10px 14px", fontSize: 14 }}
              placeholder="Yeni liste adı…"
              value={yeniListeAd}
              onChange={(e) => setYeniListeAd(e.target.value)}
            />
            <button
              className="btn btnCizgi btnKucuk"
              onClick={() => {
                if (yeniListeAd.trim()) {
                  listeOlustur(yeniListeAd);
                  setYeniListeAd("");
                }
              }}
            >
              + Oluştur
            </button>
          </div>
        </div>

        {/* Geçmiş */}
        <div className="profilKart cam">
          <h3>⟳ Geçmişin</h3>
          {hesap.aramaGecmisi.length > 0 && (
            <>
              <p className="minik" style={{ marginBottom: 8 }}>Son aramaların</p>
              <div className="cipKume" style={{ marginBottom: 16 }}>
                {hesap.aramaGecmisi.slice(0, 8).map((s) => (
                  <span key={s} className="cip">{s}</span>
                ))}
              </div>
            </>
          )}
          {tiklananlar.length > 0 ? (
            <>
              <p className="minik" style={{ marginBottom: 8 }}>Son incelediklerin — kaldığın yerden devam et</p>
              {tiklananlar.map((p) => (
                <div key={p.id} className="listeSatir">
                  <button className="minik" style={{ textAlign: "left" }} onClick={() => detay.ac(p)}>
                    {p.marka} — {p.ad}
                  </button>
                </div>
              ))}
            </>
          ) : (
            hesap.aramaGecmisi.length === 0 && <p className="minik">Henüz bir hareket yok.</p>
          )}
        </div>
      </div>

      {/* Favoriler */}
      <div className="bolumBaslik" style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: 30 }}>♡ Favorilerin</h2>
        <span className="sayi">{favoriler.length}</span>
      </div>
      {favoriler.length === 0 ? (
        <BosDurum ikon="🤍" baslik="Henüz favorin yok" alt="Beğendiğin kartlardaki kalbe dokun." />
      ) : (
        <div className="kartIzgara">
          {favoriler.map((p, i) => (
            <ParfumKart key={p.id} parfum={p} sira={Math.min(i, 8)} onDetay={detay.ac} />
          ))}
        </div>
      )}

      {detay.acik && (
        <DetayPanel parfum={detay.acik} onKapat={detay.kapat} onBenzerSec={detay.ac} />
      )}
    </div>
  );
}

function FavoridenEkle({ favoriler, onEkle }: { favoriler: Parfum[]; onEkle: (id: string) => void }) {
  if (favoriler.length === 0) return null;
  return (
    <select
      className="filtreSecici"
      style={{ marginTop: 6, width: "100%" }}
      value=""
      onChange={(e) => e.target.value && onEkle(e.target.value)}
    >
      <option value="">+ Favorilerden ekle…</option>
      {favoriler.map((f) => (
        <option key={f.id} value={f.id}>{f.marka} — {f.ad}</option>
      ))}
    </select>
  );
}
