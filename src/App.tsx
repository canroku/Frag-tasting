import { useEffect, useState } from "react";
import { useStore } from "./state/store";
import { Aurora } from "./components/ui";
import { Karsilama } from "./screens/Karsilama";
import { Anket } from "./screens/Anket";
import { Onerilerim } from "./screens/Onerilerim";
import { Kesfet } from "./screens/Kesfet";
import { Profil } from "./screens/Profil";

type Sekme = "onerilerim" | "kesfet" | "profil";

export default function App() {
  const { hesap } = useStore();
  const [anketAcik, setAnketAcik] = useState(false);
  const [sekme, setSekme] = useState<Sekme>("onerilerim");

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
            <span className="logo">
              Frag <em>Tasting</em>
            </span>
            <nav className="sekmeler">
              <SekmeBtn aktif={sekme === "onerilerim"} onClick={() => setSekme("onerilerim")}>Senin Seçkin</SekmeBtn>
              <SekmeBtn aktif={sekme === "kesfet"} onClick={() => setSekme("kesfet")}>Keşfet</SekmeBtn>
              <SekmeBtn aktif={sekme === "profil"} onClick={() => setSekme("profil")}>Profil</SekmeBtn>
            </nav>
          </div>
        </header>
      )}

      <main className="kabuk">
        {!hesap ? (
          <Karsilama onDevam={() => setAnketAcik(true)} />
        ) : !hesap.profil || anketAcik ? (
          <Anket
            onBitti={() => {
              setAnketAcik(false);
              setSekme("onerilerim");
            }}
          />
        ) : sekme === "onerilerim" ? (
          <Onerilerim onAnketeDon={() => setAnketAcik(true)} />
        ) : sekme === "kesfet" ? (
          <Kesfet />
        ) : (
          <Profil onAnketeDon={() => setAnketAcik(true)} />
        )}
      </main>

      {girisliVeAnketli && (
        <nav className="altBar">
          <button className={`sekme ${sekme === "onerilerim" ? "aktif" : ""}`} onClick={() => setSekme("onerilerim")}>
            <span className="ikon">✦</span>Seçkin
          </button>
          <button className={`sekme ${sekme === "kesfet" ? "aktif" : ""}`} onClick={() => setSekme("kesfet")}>
            <span className="ikon">⌕</span>Keşfet
          </button>
          <button className={`sekme ${sekme === "profil" ? "aktif" : ""}`} onClick={() => setSekme("profil")}>
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
