// Bölüm 7 — Arama & Keşif: serbest metin, filtreler, sıralama, "buna benzer"
import { useEffect, useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { ara, BOS_FILTRE, type AramaFiltre } from "../engine/search";
import { AILELER, AILE_ETIKET } from "../engine/types";
import type { Aile, Cinsiyet, Fiyat, Mevsim, Ortam } from "../engine/types";
import { NOTALAR } from "../data/notes";
import { useStore } from "../state/store";
import { ParfumKart, DetayPanel, useDetay, BosDurum } from "../components/ui";

export function Kesfet() {
  const { hesap, aramaKaydet } = useStore();
  const detay = useDetay();
  const [filtre, setFiltre] = useState<AramaFiltre>(BOS_FILTRE);

  const sonuclar = useMemo(
    () => ara(KATALOG, filtre, hesap?.profil ?? null),
    [filtre, hesap?.profil]
  );

  // arama geçmişi: yazma durunca kaydet (Bölüm 8)
  useEffect(() => {
    if (!filtre.metin.trim()) return;
    const z = setTimeout(() => aramaKaydet(filtre.metin), 1200);
    return () => clearTimeout(z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre.metin]);

  const g = (kismi: Partial<AramaFiltre>) => setFiltre((f) => ({ ...f, ...kismi }));

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>Keşfet</h2>
        <span className="sayi">{sonuclar.length} sonuç</span>
      </div>
      <p className="bolumAlt">
        Adıyla, markayla veya "vanilyalı kış kokusu" gibi serbest metinle ara.
      </p>

      <div className="aramaSatir">
        <div className="aramaKutu">
          <span className="buyutec">⌕</span>
          <input
            className="girdi"
            placeholder="Parfüm, marka veya nota ara…"
            value={filtre.metin}
            onChange={(e) => g({ metin: e.target.value })}
          />
        </div>
      </div>

      <div className="aramaSatir">
        <select className={`filtreSecici ${filtre.aile ? "dolu" : ""}`} value={filtre.aile ?? ""} onChange={(e) => g({ aile: (e.target.value || undefined) as Aile | undefined })}>
          <option value="">Aile</option>
          {AILELER.map((a) => <option key={a} value={a}>{AILE_ETIKET[a]}</option>)}
        </select>
        <select className={`filtreSecici ${filtre.nota ? "dolu" : ""}`} value={filtre.nota ?? ""} onChange={(e) => g({ nota: e.target.value || undefined })}>
          <option value="">Nota</option>
          {NOTALAR.map((n) => <option key={n.id} value={n.id}>{n.ad}</option>)}
        </select>
        <select className={`filtreSecici ${filtre.mevsim ? "dolu" : ""}`} value={filtre.mevsim ?? ""} onChange={(e) => g({ mevsim: (e.target.value || undefined) as Mevsim | undefined })}>
          <option value="">Mevsim</option>
          <option value="ilkbahar">İlkbahar</option>
          <option value="yaz">Yaz</option>
          <option value="sonbahar">Sonbahar</option>
          <option value="kis">Kış</option>
        </select>
        <select className={`filtreSecici ${filtre.ortam ? "dolu" : ""}`} value={filtre.ortam ?? ""} onChange={(e) => g({ ortam: (e.target.value || undefined) as Ortam | undefined })}>
          <option value="">Ortam</option>
          <option value="gunluk">Günlük</option>
          <option value="is">İş</option>
          <option value="gece">Gece</option>
          <option value="ozel">Özel gün</option>
          <option value="spor">Spor</option>
        </select>
        <select className={`filtreSecici ${filtre.cinsiyet ? "dolu" : ""}`} value={filtre.cinsiyet ?? ""} onChange={(e) => g({ cinsiyet: (e.target.value || undefined) as Cinsiyet | undefined })}>
          <option value="">Cinsiyet</option>
          <option value="kadin">Kadın</option>
          <option value="erkek">Erkek</option>
          <option value="unisex">Unisex</option>
        </select>
        <select className={`filtreSecici ${filtre.butce ? "dolu" : ""}`} value={filtre.butce ?? ""} onChange={(e) => g({ butce: (e.target.value || undefined) as Fiyat | undefined })}>
          <option value="">Bütçe</option>
          <option value="ekonomik">Ekonomik</option>
          <option value="orta">Orta</option>
          <option value="luks">Lüks</option>
        </select>
        <select className={`filtreSecici ${filtre.nis ? "dolu" : ""}`} value={filtre.nis ?? ""} onChange={(e) => g({ nis: (e.target.value || undefined) as "nis" | "designer" | undefined })}>
          <option value="">Niş / Designer</option>
          <option value="nis">Niş</option>
          <option value="designer">Designer</option>
        </select>
        <select className="filtreSecici dolu" value={filtre.siralama} onChange={(e) => g({ siralama: e.target.value as AramaFiltre["siralama"] })}>
          <option value="uygunluk">Uygunluğa göre</option>
          <option value="populerlik">Popülerliğe göre</option>
          <option value="yenilik">Yeniliğe göre</option>
          <option value="fiyat">Fiyata göre</option>
        </select>
        {(filtre.aile || filtre.nota || filtre.mevsim || filtre.ortam || filtre.cinsiyet || filtre.butce || filtre.nis || filtre.metin) && (
          <button className="btn btnCizgi btnKucuk" onClick={() => setFiltre(BOS_FILTRE)}>Temizle ✕</button>
        )}
      </div>

      {sonuclar.length === 0 ? (
        <BosDurum ikon="🫙" baslik="Bu filtrelerle sonuç yok" alt="Filtreleri gevşetmeyi dene." />
      ) : (
        <div className="kartIzgara" style={{ marginTop: 20 }}>
          {sonuclar.map((p, i) => (
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
