import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/store";
import { useDil } from "../i18n/DilContext";

export function Karsilama({ onDevam }: { onDevam: () => void }) {
  const { t } = useDil();
  const [authAcik, setAuthAcik] = useState<false | "kayit" | "giris">(false);
  if (authAcik) return <AuthEkrani ilkMod={authAcik} onGeri={() => setAuthAcik(false)} onBasari={onDevam} />;

  return (
    <div className="ajansHero girisAnim">
      <div className="ajansZemin" aria-hidden />
      <ImlecIzi />

      <nav className="ajansNav">
        <span className="ajansNavOge">{t("kesfet.baslik")}</span>
        <span className="ajansNavOge">{t("notalar.baslik")}</span>
        <button className="ajansNavOge ajansNavAktif" onClick={() => setAuthAcik("giris")}>
          {t("auth.giris")} ↗
        </button>
      </nav>

      <div className="ajansGovde">
        <h1 className="ajansBaslik">
          <span className="ajansSatir">{t("karsilama.satir1")}</span>
          <span className="ajansSatir">{t("karsilama.satir2")}</span>
          <span className="ajansSatir ajansVurgu">{t("karsilama.satir3")}</span>
        </h1>
        <div className="ajansAlt">
          <p className="ajansAciklama">{t("karsilama.alt")}</p>
          <div className="ajansCtaGrup">
            <button className="ajansCta" onClick={() => setAuthAcik("kayit")}>
              <span>{t("karsilama.baslaCta")}</span>
              <span className="ajansCtaOk">→</span>
            </button>
            <span className="ajansSure minik">{t("karsilama.sure")}</span>
          </div>
        </div>
      </div>

      <footer className="ajansFooter">
        <span className="ajansLogo">⚗️ Frag <em>Tasting</em></span>
        <span className="ajansFooterMetin minik">{t("karsilama.ust")}</span>
      </footer>
    </div>
  );
}

// Fareyi izleyen, kısa süre sonra sönümlenen sarı iz noktaları.
// Yalnızca hassas işaretçili (masaüstü) cihazlarda ve hareket azaltma
// kapalıyken çalışır — dokunmatik/erişilebilirlik maliyeti yok.
function ImlecIzi() {
  const [noktalar, setNoktalar] = useState<{ x: number; y: number; id: number }[]>([]);
  const sayac = useRef(0);
  const sonZaman = useRef(0);

  useEffect(() => {
    const hassas = window.matchMedia("(pointer: fine)").matches;
    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hassas || azHareket) return;

    function hareket(e: MouseEvent) {
      const simdi = performance.now();
      if (simdi - sonZaman.current < 35) return;
      sonZaman.current = simdi;
      const id = sayac.current++;
      setNoktalar((n) => [...n.slice(-11), { x: e.clientX, y: e.clientY, id }]);
    }
    window.addEventListener("mousemove", hareket);
    return () => window.removeEventListener("mousemove", hareket);
  }, []);

  useEffect(() => {
    if (!noktalar.length) return;
    const zaman = setTimeout(() => setNoktalar((n) => n.slice(1)), 250);
    return () => clearTimeout(zaman);
  }, [noktalar]);

  return (
    <div className="imlecIzi" aria-hidden>
      {noktalar.map((n, i) => (
        <span
          key={n.id}
          className="imlecNokta"
          style={{ left: n.x, top: n.y, opacity: ((i + 1) / noktalar.length) * 0.8 }}
        />
      ))}
    </div>
  );
}

function AuthEkrani({
  ilkMod, onGeri, onBasari,
}: { ilkMod: "kayit" | "giris"; onGeri: () => void; onBasari: () => void }) {
  const { kayitOl, girisYap } = useStore();
  const { t } = useDil();
  const [mod, setMod] = useState<"kayit" | "giris">(ilkMod);
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setBekliyor(true);
    setHata(null);
    const sonuc =
      mod === "kayit" ? await kayitOl(ad, email, sifre) : await girisYap(email, sifre);
    setBekliyor(false);
    if (sonuc) setHata(sonuc);
    else onBasari();
  }

  return (
    <div className="girisAnim">
      <form className="authKutu cam" onSubmit={gonder}>
        <span className="ustBaslik">{mod === "kayit" ? t("auth.hesapOlustur") : t("auth.giris")}</span>
        <h2>{mod === "kayit" ? t("karsilama.satir2") + " " + t("karsilama.satir3") : t("nav.anaEkran")}</h2>

        {mod === "kayit" && (
          <div className="alanGrup">
            <label htmlFor="ad">{t("auth.adin")}</label>
            <input id="ad" className="girdi" value={ad} onChange={(e) => setAd(e.target.value)} placeholder={t("auth.adin")} />
          </div>
        )}
        <div className="alanGrup">
          <label htmlFor="email">{t("auth.eposta")}</label>
          <input
            id="email" type="email" required className="girdi" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="sen@ornek.com"
          />
        </div>
        <div className="alanGrup">
          <label htmlFor="sifre">{t("auth.sifre")}</label>
          <input
            id="sifre" type="password" required className="girdi" value={sifre}
            onChange={(e) => setSifre(e.target.value)} placeholder="••••••••"
          />
        </div>

        {hata && <p className="hataMetin">{hata}</p>}

        <button className="btn btnAna" style={{ width: "100%" }} disabled={bekliyor}>
          {bekliyor ? "…" : mod === "kayit" ? t("auth.kayitBtn") : t("auth.girisBtn")}
        </button>

        <p className="authAlt">
          <button type="button" onClick={() => { setMod(mod === "kayit" ? "giris" : "kayit"); setHata(null); }}>
            {mod === "kayit" ? t("auth.giris") : t("auth.hesapOlustur")}
          </button>
        </p>
        <p className="authAlt">
          <button type="button" onClick={onGeri}>{t("btn.geri")}</button>
        </p>
      </form>
    </div>
  );
}
