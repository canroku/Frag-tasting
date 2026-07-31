import { lazy, Suspense, useState } from "react";
import { useStore } from "../state/store";
import { useDil } from "../i18n/DilContext";

// Three.js + WebGL sahnesi (~500KB) ayrı bir parçada — yalnızca girişsiz
// ziyaretçi karşılama ekranına geldiğinde indirilir, giriş yapmış kullanıcının
// paketini şişirmez.
const KokuHero = lazy(() => import("../components/KokuHero").then((m) => ({ default: m.KokuHero })));

export function Karsilama({ onDevam }: { onDevam: () => void }) {
  const { t } = useDil();
  const [authAcik, setAuthAcik] = useState<false | "kayit" | "giris">(false);
  if (authAcik) return <AuthEkrani ilkMod={authAcik} onGeri={() => setAuthAcik(false)} onBasari={onDevam} />;

  return (
    <Suspense fallback={<div className="kokuYukleniyor" aria-hidden />}>
      <KokuHero onBasla={() => setAuthAcik("kayit")} onGiris={() => setAuthAcik("giris")} />
    </Suspense>
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
        <h2>{mod === "kayit" ? t("karsilama.imza1") + " " + t("karsilama.imza2") : t("nav.anaEkran")}</h2>

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
