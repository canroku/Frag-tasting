// Notalar Ansiklopedisi — notaları kategoriye göre gez, bir notaya tıkla,
// o notayı taşıyan en iyi parfümleri gör. Keşif + eğitim odaklı sayfa.
import { useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { NOTALAR, KATEGORI_RENK, KATEGORI_ETIKET, KATEGORI_SIRA, type Nota } from "../data/notes";
import { notaSayimlari, notaliParfumler } from "../engine/notaIstatistik";
import { useKatalogSurumu } from "../state/useKatalog";
import { ParfumKart, DetayPanel, useDetay, Modal } from "../components/ui";

export function Notalar() {
  const detay = useDetay();
  const katalogSurum = useKatalogSurumu();
  const [acikNota, setAcikNota] = useState<Nota | null>(null);
  const [sorgu, setSorgu] = useState("");

  const sayim = useMemo(() => notaSayimlari(KATALOG, katalogSurum), [katalogSurum]);

  const filtreli = useMemo(() => {
    const s = sorgu.trim().toLocaleLowerCase("tr");
    return s ? NOTALAR.filter((n) => n.ad.toLocaleLowerCase("tr").includes(s)) : NOTALAR;
  }, [sorgu]);

  const acikListe = useMemo(
    () => (acikNota ? notaliParfumler(KATALOG, acikNota.id, 30) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acikNota, katalogSurum]
  );

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>Notalar</h2>
        <span className="sayi">{NOTALAR.length} nota · kokuların yapı taşları</span>
      </div>
      <p className="bolumAlt">
        Bir notayı merak ediyorsan üstüne dokun — o notayı taşıyan en sevilen
        parfümleri gör, koku dünyanı notadan başlayarak keşfet.
      </p>

      <div className="aramaSatir">
        <div className="aramaKutu">
          <span className="buyutec">⌕</span>
          <input className="girdi" placeholder="Nota ara… (gül, vanilya, oud)" value={sorgu} onChange={(e) => setSorgu(e.target.value)} />
        </div>
      </div>

      {KATEGORI_SIRA.map((kat) => {
        const grup = filtreli.filter((n) => n.kategori === kat);
        if (grup.length === 0) return null;
        return (
          <div key={kat} className="notaKatBolum">
            <div className="notaGrupBaslik" style={{ marginTop: 26 }}>
              <span className="notaRenk" style={{ background: KATEGORI_RENK[kat] }} />
              {KATEGORI_ETIKET[kat]}
            </div>
            <div className="notaTuval">
              {grup.map((n) => (
                <button key={n.id} className="notaTasi" onClick={() => setAcikNota(n)} style={{ ["--kat" as string]: KATEGORI_RENK[n.kategori] }}>
                  <span className="notaTasiEmoji">{n.emoji}</span>
                  <span className="notaTasiAd">{n.ad}</span>
                  <span className="notaTasiSayi">{(sayim.get(n.id) ?? 0).toLocaleString("tr-TR")}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {acikNota && (
        <Modal onKapat={() => setAcikNota(null)} genis>
          <div style={{ marginBottom: 16 }}>
            <span className="ustBaslik" style={{ color: KATEGORI_RENK[acikNota.kategori] }}>
              {acikNota.emoji} {KATEGORI_ETIKET[acikNota.kategori]}
            </span>
            <h2 className="serif" style={{ fontSize: "clamp(26px,4vw,36px)", margin: "6px 0 4px" }}>{acikNota.ad}</h2>
            <p className="minik">
              Katalogda <strong>{(sayim.get(acikNota.id) ?? 0).toLocaleString("tr-TR")}</strong> parfümde geçiyor.
              En sevilenler:
            </p>
          </div>
          <div className="kartIzgara">
            {acikListe.map((p, i) => (
              <ParfumKart key={p.id} parfum={p} sira={Math.min(i, 8)} onDetay={(x) => { setAcikNota(null); detay.ac(x); }} />
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
