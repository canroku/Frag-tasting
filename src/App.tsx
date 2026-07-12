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

type Tema = "koyu" | "aydinlik";

// İlk açılışta tema: kayıtlı tercih varsa o, yoksa saate göre (gündüz=sabah,
// gece=koyu). 7:00–19:00 arası sabah modu.
function baslangicTema(): Tema {
  const kayitli = localStorage.getItem("frag_tema");
  if (kayitli === "koyu" || kayitli === "aydinlik") return kayitli;
  const saat = new Date().getHours();
  return saat >= 7 && saat < 19 ? "aydinlik" : "koyu";
}

export default function App() {
  const { hesap } = useStore();
  const [anketAcik, setAnketAcik] = useState(false);
  const [sekme, setSekme] = useState<Sekme>("onerilerim");
  const [tema, setTema] = useState<Tema>(baslangicTema);

  // Tam katalog (29 bin parfüm) uygulama açılır açılmaz arka planda yüklenir;
  // kullanıcı ankette ilerlerken indirme tamamlanmış olur.
  useEffect(() => {
    tamKatalogYukle();
  }, []);

  // Tema kökte data-tema olarak uygulanır + kalıcılaştırılır
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "aydinlik" ? "#f7f1e8" : "#14060f");
    localStorage.setItem("frag_tema", tema);
  }, [tema]);

  const temaDegis = () => sayfaGecisi(() => setTema((t) => (t === "koyu" ? "aydinlik" : "koyu")), "sekme");

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
      {!girisliVeAnketli && <TemaBtn tema={tema} onDegis={temaDegis} serbest />}
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
            {(hesap.seri?.gun ?? 0) >= 2 && (
              <button className="seriRozet" onClick={() => sekmeyeGec("profil")} title={`${hesap.seri!.gun} günlük seri`}>
                🔥 {hesap.seri!.gun}
              </button>
            )}
            <TemaBtn tema={tema} onDegis={temaDegis} />
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

// Gece ↔ sabah modu düğmesi. serbest=true iken (karşılama) sağ üstte sabit.
function TemaBtn({ tema, onDegis, serbest = false }: { tema: Tema; onDegis: () => void; serbest?: boolean }) {
  const sabah = tema === "aydinlik";
  return (
    <button
      className={`temaBtn ${serbest ? "temaBtnSerbest" : ""}`}
      onClick={onDegis}
      title={sabah ? "Gece moduna geç" : "Sabah moduna geç"}
      aria-label={sabah ? "Gece moduna geç" : "Sabah moduna geç"}
    >
      {sabah ? "🌙" : "☀️"}
    </button>
  );
}
