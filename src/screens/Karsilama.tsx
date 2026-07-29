import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "../state/store";
import { useDil } from "../i18n/DilContext";
import heroNoir from "../assets/hero-noir.png";

export function Karsilama({ onDevam }: { onDevam: () => void }) {
  const { t } = useDil();
  const [authAcik, setAuthAcik] = useState<false | "kayit" | "giris">(false);
  if (authAcik) return <AuthEkrani ilkMod={authAcik} onGeri={() => setAuthAcik(false)} onBasari={onDevam} />;

  return (
    <section className="heroYeni">
      <div className="heroBlob heroBlobA" aria-hidden />
      <div className="heroBlob heroBlobB" aria-hidden />

      <div className="heroIzgara">
        <div className="heroMetin girisAnim">
          <span className="heroRozet">
            <Sparkles size={14} />
            {t("karsilama.ust")}
          </span>

          <h1 className="heroBaslik">
            {t("karsilama.imza1")}
            <br />
            <em className="parlamaMetin">{t("karsilama.imza2")}</em>
          </h1>

          <p className="heroAciklama">{t("karsilama.alt")}</p>

          <div className="heroBtnSira">
            <button className="btn btnAna heroBtnParla" onClick={() => setAuthAcik("kayit")}>
              {t("karsilama.baslaCta")}
              <ArrowRight size={16} className="heroBtnOk" />
            </button>
            <button className="btn btnCizgi" onClick={() => setAuthAcik("giris")}>
              {t("auth.girisBtn")}
            </button>
          </div>

          <div className="heroIstat">
            <div>
              <p className="heroIstatSayi">29K+</p>
              <p>{t("karsilama.istatParfum")}</p>
            </div>
            <span className="heroIstatCizgi" />
            <div>
              <p className="heroIstatSayi">10</p>
              <p>{t("karsilama.istatDil")}</p>
            </div>
            <span className="heroIstatCizgi" />
            <div>
              <p className="heroIstatSayi">%96</p>
              <p>{t("karsilama.istatEslesme")}</p>
            </div>
          </div>
        </div>

        <div className="heroGorselKutu girisAnim" style={{ animationDelay: "0.15s" }}>
          <div className="heroFoto cam">
            <img
              src={heroNoir}
              alt="Kan kırmızısı likit dolu lüks parfüm şişesi, dramatik ışık huzmesi"
              width={720}
              height={860}
            />
            <div className="heroFotoFade" aria-hidden />
          </div>
        </div>
      </div>
    </section>
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
