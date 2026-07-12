// Bölüm 8 + 10 — Profil: favoriler, listeler, geçmiş, koku profili, "anketi güncelle", veri silme
import { useMemo, useState } from "react";
import { useStore, type Hesap } from "../state/store";
import { PARFUM_MAP, KATALOG } from "../data/catalog";
import { AILELER, AILE_ETIKET, AILE_RENK } from "../engine/types";
import type { Parfum } from "../engine/types";
import { ParfumKart, DetayPanel, useDetay, BosDurum, SiseGorsel } from "../components/ui";
import { kokuDna } from "../engine/dna";
import { gardiropAnalizi } from "../engine/gardirop";
import { selamla } from "../engine/selam";

// 🏅 Rozetler — kullanım verisinden hesaplanan başarımlar
const ROZETLER: { id: string; emoji: string; ad: string; kosulAciklama: string; kazanildi: (h: Hesap) => boolean }[] = [
  { id: "tadimci", emoji: "🧪", ad: "Tadımcı", kosulAciklama: "Anketi tamamla", kazanildi: (h) => !!h.profil },
  { id: "ilk_ask", emoji: "💘", ad: "İlk Aşk", kosulAciklama: "İlk favorini ekle", kazanildi: (h) => h.favoriler.length >= 1 },
  { id: "koleksiyon", emoji: "🗄️", ad: "Koleksiyoner", kosulAciklama: "5 favoriye ulaş", kazanildi: (h) => h.favoriler.length >= 5 },
  { id: "kasif", emoji: "🔭", ad: "Kâşif", kosulAciklama: "10 parfüm incele", kazanildi: (h) => h.tiklananlar.length >= 10 },
  { id: "egitmen", emoji: "🎓", ad: "Eğitmen", kosulAciklama: "5 kez 👍/👎 ver", kazanildi: (h) => Object.keys(h.geriBildirim).length >= 5 },
  { id: "duellocu", emoji: "⚔️", ad: "Düellocu", kosulAciklama: "5 düello turu oyna", kazanildi: (h) => (h.duello_sayisi ?? 0) >= 5 },
  { id: "arsivci", emoji: "🗂️", ad: "Arşivci", kosulAciklama: "Bir koleksiyon listesi kur", kazanildi: (h) => h.listeler.length >= 1 },
  { id: "avci", emoji: "🕵️", ad: "Nota Avcısı", kosulAciklama: "10+ sevilen nota seç", kazanildi: (h) => (h.anket?.sevilen_notalar.length ?? 0) >= 10 },
];

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
  const dna = hesap.profil ? kokuDna(hesap.profil) : null;
  const gardirop = hesap.profil ? gardiropAnalizi(favoriler, hesap.profil, KATALOG) : null;
  const kazanilanRozetler = ROZETLER.filter((r) => r.kazanildi(hesap)).length;

  function verileriSil() {
    if (!confirm("Tüm hesap verilerin bu cihazdan kalıcı olarak silinecek. Emin misin?")) return;
    localStorage.clear();
    location.reload();
  }

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>{selamla().selam}, {hesap.ad} {selamla().emoji}</h2>
      </div>
      <p className="bolumAlt">{hesap.email}</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <button className="btn btnCizgi btnKucuk" onClick={onAnketeDon}>Anketi güncelle</button>
        <button className="btn btnCizgi btnKucuk" onClick={cikisYap}>Çıkış yap</button>
        <button className="btn btnCizgi btnKucuk" style={{ color: "var(--danger)" }} onClick={verileriSil}>
          Verilerimi sil
        </button>
      </div>

      {/* 🧬 Koku DNA'sı — arketip + taç yaprağı grafiği */}
      {dna && (
        <section className="dnaKart cam">
          <div className="dnaGrafik" aria-hidden>
            <svg viewBox="0 0 200 200">
              {dna.yapraklar.map((y, i) => {
                const aci = (i / dna.yapraklar.length) * Math.PI * 2 - Math.PI / 2;
                const uzunluk = 26 + y.deger * 62;
                const x2 = 100 + Math.cos(aci) * uzunluk;
                const y2 = 100 + Math.sin(aci) * uzunluk;
                return (
                  <line
                    key={y.aile}
                    x1={100 + Math.cos(aci) * 14}
                    y1={100 + Math.sin(aci) * 14}
                    x2={x2}
                    y2={y2}
                    stroke={AILE_RENK[y.aile]}
                    strokeWidth="11"
                    strokeLinecap="round"
                    opacity={0.35 + y.deger * 0.65}
                  />
                );
              })}
              <circle cx="100" cy="100" r="9" fill="var(--cream)" opacity="0.9" />
            </svg>
          </div>
          <div>
            <span className="ustBaslik">🧬 Koku DNA'n</span>
            <h3 className="serif dnaArketip">{dna.arketip}</h3>
            <p className="minik" style={{ maxWidth: "42ch" }}>{dna.ozet}</p>
            <div className="etiketSira" style={{ marginTop: 12 }}>
              {dna.baskin.map((a) => (
                <span key={a} className="etiket">{AILE_ETIKET[a]}</span>
              ))}
            </div>
          </div>
        </section>
      )}

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

        {/* Gardırop Boşluk Analizi */}
        {gardirop && (
          <div className="profilKart cam">
            <h3>🧳 Gardırop Analizi</h3>
            {favoriler.length === 0 ? (
              <p className="minik">Favori ekledikçe koku gardırobunun mevsim kapsamasını burada analiz ederim.</p>
            ) : (
              <>
                {gardirop.kapsama.map((k) => (
                  <div key={k.etiket} className="aileCubugu">
                    <span>{k.emoji} {k.etiket}</span>
                    <div className="olcuYol"><div className="olcuDolgu" style={{ width: `${Math.round(k.deger * 100)}%` }} /></div>
                    <span>{Math.round(k.deger * 100)}</span>
                  </div>
                ))}
                {gardirop.bosluk && gardirop.oneri ? (
                  <div className="boslukOneri">
                    <p className="minik" style={{ marginBottom: 10 }}>
                      Gardırobunda <strong>{gardirop.bosluk.emoji} {gardirop.bosluk.etiket}</strong> boşluğu var — şunu dene:
                    </p>
                    <button className="boslukKart" onClick={() => detay.ac(gardirop.oneri!)}>
                      <div className="boslukSise"><SiseGorsel parfum={gardirop.oneri} /></div>
                      <span>
                        <span className="pMarka">{gardirop.oneri.marka}</span>
                        <span style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: 16 }}>{gardirop.oneri.ad}</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <p className="minik" style={{ marginTop: 10 }}>✅ Dört mevsimi de kapsıyorsun — gardırop dengede.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Rozetler */}
        <div className="profilKart cam">
          <h3>🏅 Rozetler <span className="minik" style={{ fontFamily: "var(--font-sans)" }}>{kazanilanRozetler}/{ROZETLER.length}</span></h3>
          <div className="rozetIzgara">
            {ROZETLER.map((r) => {
              const acik = r.kazanildi(hesap);
              return (
                <div key={r.id} className={`basarim ${acik ? "acik" : ""}`} title={r.kosulAciklama}>
                  <span className="basarimEmoji">{acik ? r.emoji : "🔒"}</span>
                  <span className="basarimAd">{r.ad}</span>
                  <span className="basarimKosul">{r.kosulAciklama}</span>
                </div>
              );
            })}
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
