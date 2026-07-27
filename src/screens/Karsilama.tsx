import { useState } from "react";
import { useStore } from "../state/store";
import { useDil } from "../i18n/DilContext";
import { Partikuller } from "../components/ui";

export function Karsilama({ onDevam }: { onDevam: () => void }) {
  const { t } = useDil();
  const [authAcik, setAuthAcik] = useState(false);
  if (authAcik) return <AuthEkrani onGeri={() => setAuthAcik(false)} onBasari={onDevam} />;

  return (
    <div className="karsilama girisAnim">
      <Partikuller adet={22} />
      <div className="sisePlaka" aria-hidden>⚗️</div>
      <span className="ustBaslik">Frag Tasting · {t("karsilama.ust")}</span>
      <h1>
        {t("karsilama.baslik1")} <span className="vurgu">{t("karsilama.baslikVurgu")}</span> {t("karsilama.baslik2")}
      </h1>
      <p className="alt">{t("karsilama.alt")}</p>
      <div className="karsilamaSatir">
        <button className="btn btnAna" onClick={() => setAuthAcik(true)}>
          {t("karsilama.baslaCta")}
        </button>
        <span className="minik">{t("karsilama.sure")}</span>
      </div>
    </div>
  );
}

function AuthEkrani({ onGeri, onBasari }: { onGeri: () => void; onBasari: () => void }) {
  const { kayitOl, girisYap } = useStore();
  const { t } = useDil();
  const [mod, setMod] = useState<"kayit" | "giris">("kayit");
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
        <h2>{mod === "kayit" ? t("karsilama.baslik1") + " " + t("karsilama.baslikVurgu") : t("nav.anaEkran")}</h2>

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
