import { useEffect, useState } from "react";
import { useStore } from "./state/store";
import { Aurora } from "./components/ui";
import { sayfaGecisi } from "./components/gecis";
import { tamKatalogYukle } from "./data/catalog";
import { Karsilama } from "./screens/Karsilama";
import { Anket } from "./screens/Anket";
import { Onerilerim } from "./screens/Onerilerim";
import { Kesfet } from "./screens/Kesfet";
import { Koleksiyonlar } from "./screens/Koleksiyonlar";
import { Profil } from "./screens/Profil";

type Sekme = "onerilerim" | "kesfet" | "koleksiyonlar" | "profil";

export default function App() {
  const { hesap } = useStore();
  const [anketAcik, setAnketAcik] = useState(false);
  const [sekme, setSekme] = useState<Sekme>("onerilerim");

  // Tam katalog (29 bin parfüm) uygulama açılır açılmaz arka planda yüklenir;
  // kullanıcı ankette ilerlerken indirme tamamlanmış olur.
  useEffect(() => {
    tamKatalogYukle();
  }, []);

  const sekmeyeGec = (s: Sekme) => {
    if (s !== sekme) sayfaGecisi(() => setSekme(s));
  };
  const anketiAc = () => sayfaGecisi(() => setAnketAcik(true), "ileri");

  // Mevsime göre değişen arka plan tonu (Bölüm 10 — küçük dokunuşlar)
  useEffect(() => {
    const m = hesap?.profil?.mevsim;
    let sezon = "kis";
    if (m) {
      const enIyi = (Object.entries(m) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
      if (enIyi && enIyi[1] > 0) sezon = enIyi[0];
    } else {
      const ay = new Date().getMonth() + 1;
      sezon = ay >= 3 && ay <= 5 ? "ilkbahar" : ay >= 6 && ay <= 8 ? "yaz" : ay >= 9 && ay <= 11 ? "sonbahar" : "kis";
    }
    document.documentElement.dataset.sezon = sezon;
  }, [hesap?.profil]);

  const girisliVeAnketli = hesap && hesap.profil && !anketAcik;

  return (
    <>
      <Aurora />
      {girisliVeAnketli && (
        <header className="ustCubuk">
          <div className="ustCubukIc">
            <button
              className="logo logoBtn"
              onClick={() => sekmeyeGec("onerilerim")}
              title="Ana ekran — Senin Seçkin"
              aria-label="Ana ekrana dön"
            >
              Frag <em>Tasting</em>
            </button>
            <nav className="sekmeler">
              <SekmeBtn aktif={sekme === "onerilerim"} onClick={() => sekmeyeGec("onerilerim")}>Senin Seçkin</SekmeBtn>
              <SekmeBtn aktif={sekme === "koleksiyonlar"} onClick={() => sekmeyeGec("koleksiyonlar")}>Koleksiyonlar</SekmeBtn>
              <SekmeBtn aktif={sekme === "kesfet"} onClick={() => sekmeyeGec("kesfet")}>Keşfet</SekmeBtn>
            </nav>
            <button
              className={`avatar ${sekme === "profil" ? "aktif" : ""}`}
              onClick={() => sekmeyeGec("profil")}
              title={`${hesap.ad} — profilim`}
              aria-label="Profilim"
            >
              {hesap.ad.trim().charAt(0).toLocaleUpperCase("tr") || "🙂"}
            </button>
          </div>
        </header>
      )}

      <main className="kabuk">
        {!hesap ? (
          <Karsilama onDevam={anketiAc} />
        ) : !hesap.profil || anketAcik ? (
          <Anket
            onBitti={() =>
              sayfaGecisi(() => {
                setAnketAcik(false);
                setSekme("onerilerim");
              }, "ileri")
            }
          />
        ) : sekme === "onerilerim" ? (
          <Onerilerim onAnketeDon={anketiAc} />
        ) : sekme === "koleksiyonlar" ? (
          <Koleksiyonlar />
        ) : sekme === "kesfet" ? (
          <Kesfet />
        ) : (
          <Profil onAnketeDon={anketiAc} />
        )}
      </main>

      {girisliVeAnketli && (
        <nav className="altBar">
          <button className={`sekme ${sekme === "onerilerim" ? "aktif" : ""}`} onClick={() => sekmeyeGec("onerilerim")}>
            <span className="ikon">✦</span>Seçkin
          </button>
          <button className={`sekme ${sekme === "koleksiyonlar" ? "aktif" : ""}`} onClick={() => sekmeyeGec("koleksiyonlar")}>
            <span className="ikon">📚</span>Seçkiler
          </button>
          <button className={`sekme ${sekme === "kesfet" ? "aktif" : ""}`} onClick={() => sekmeyeGec("kesfet")}>
            <span className="ikon">⌕</span>Keşfet
          </button>
          <button className={`sekme ${sekme === "profil" ? "aktif" : ""}`} onClick={() => sekmeyeGec("profil")}>
            <span className="ikon">♡</span>Profil
          </button>
        </nav>
      )}
    </>
  );
}

function SekmeBtn({ aktif, onClick, children }: { aktif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`sekme ${aktif ? "aktif" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
