// Bölüm 6 sonuç ekranı: kart galerisi, "neden önerildi", favori kalbi, tazele
import { useEffect, useMemo, useState } from "react";
import { KATALOG } from "../data/catalog";
import { oneriUret } from "../engine/recommend";
import type { Oneri } from "../engine/types";
import { useStore } from "../state/store";
import { ParfumKart, DetayPanel, Partikuller, useDetay, BosDurum } from "../components/ui";

export function Onerilerim({ onAnketeDon }: { onAnketeDon: () => void }) {
  const { hesap, oneriGecmisineEkle } = useStore();
  const detay = useDetay();
  const [hazirlaniyor, setHazirlaniyor] = useState(true);
  const [tur, setTur] = useState(0); // tazeleme sayacı
  const [oneriler, setOneriler] = useState<Oneri[]>([]);

  const profil = hesap?.profil ?? null;

  // Profil imzası: geri bildirimle vektör değiştikçe öneriler canlı güncellenir
  const profilImza = useMemo(() => JSON.stringify(profil), [profil]);

  useEffect(() => {
    if (!profil) return;
    setHazirlaniyor(true);
    const haric = tur > 0 ? new Set(hesap?.oneriGecmisi ?? []) : new Set<string>();
    const zaman = setTimeout(() => {
      setOneriler(oneriUret(profil, KATALOG, { n: 12, haric }));
      setHazirlaniyor(false);
    }, tur === 0 ? 1600 : 900); // koku partikülleri animasyonu için kısa bekleme
    return () => clearTimeout(zaman);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilImza, tur]);

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

  return (
    <div className="girisAnim">
      <div className="bolumBaslik">
        <h2>Senin Seçkin</h2>
        <span className="sayi">{oneriler.length} parfüm · sana göre puanlandı</span>
      </div>
      <p className="bolumAlt">
        Her kartta <em>neden önerildiğini</em> görürsün. 👍 / 👎 ile geri bildirim ver —
        profilin anında öğrenir ve seçki keskinleşir.
      </p>
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
        <button className="btn btnCizgi btnKucuk" onClick={onAnketeDon}>
          Anketi güncelle
        </button>
      </div>

      <div className="kartIzgara">
        {oneriler.map((o, i) => (
          <ParfumKart key={o.parfum.id} parfum={o.parfum} oneri={o} sira={i} onDetay={detay.ac} />
        ))}
      </div>

      {detay.acik && (
        <DetayPanel parfum={detay.acik} onKapat={detay.kapat} onBenzerSec={detay.ac} />
      )}
    </div>
  );
}
