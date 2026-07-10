import { useState } from "react";
import { useStore } from "../state/store";
import { Partikuller } from "../components/ui";

export function Karsilama({ onDevam }: { onDevam: () => void }) {
  const [authAcik, setAuthAcik] = useState(false);
  if (authAcik) return <AuthEkrani onGeri={() => setAuthAcik(false)} onBasari={onDevam} />;

  return (
    <div className="karsilama girisAnim">
      <Partikuller adet={22} />
      <div className="sisePlaka" aria-hidden>⚗️</div>
      <span className="ustBaslik">Frag Tasting · 2026 Collection</span>
      <h1>
        Sana özel <span className="vurgu">kokunu</span> bulalım
      </h1>
      <p className="alt">
        Yaşını, karakterini ve koku zevkini anlayan kişisel bir koku danışmanı.
        Kısa bir tadım anketi — sana en yakın 10–15 parfüm, nedenleriyle birlikte.
      </p>
      <div className="karsilamaSatir">
        <button className="btn btnAna" onClick={() => setAuthAcik(true)}>
          Tadıma Başla ✦
        </button>
        <span className="minik">≈ 2 dakika sürer · ücretsiz</span>
      </div>
    </div>
  );
}

function AuthEkrani({ onGeri, onBasari }: { onGeri: () => void; onBasari: () => void }) {
  const { kayitOl, girisYap } = useStore();
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
        <span className="ustBaslik">{mod === "kayit" ? "Hesap Oluştur" : "Tekrar Hoş Geldin"}</span>
        <h2>{mod === "kayit" ? "Koku yolculuğun başlasın" : "Kaldığın yerden devam et"}</h2>

        {mod === "kayit" && (
          <div className="alanGrup">
            <label htmlFor="ad">Adın</label>
            <input id="ad" className="girdi" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Adın" />
          </div>
        )}
        <div className="alanGrup">
          <label htmlFor="email">E-posta</label>
          <input
            id="email" type="email" required className="girdi" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="sen@ornek.com"
          />
        </div>
        <div className="alanGrup">
          <label htmlFor="sifre">Şifre</label>
          <input
            id="sifre" type="password" required className="girdi" value={sifre}
            onChange={(e) => setSifre(e.target.value)} placeholder="••••••••"
          />
        </div>

        {hata && <p className="hataMetin">{hata}</p>}

        <button className="btn btnAna" style={{ width: "100%" }} disabled={bekliyor}>
          {bekliyor ? "Bekle…" : mod === "kayit" ? "Kayıt Ol ve Başla" : "Giriş Yap"}
        </button>

        <p className="authAlt">
          {mod === "kayit" ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
          <button type="button" onClick={() => { setMod(mod === "kayit" ? "giris" : "kayit"); setHata(null); }}>
            {mod === "kayit" ? "Giriş yap" : "Kayıt ol"}
          </button>
        </p>
        <p className="authAlt" style={{ fontSize: 12.5, marginTop: 12 }}>
          Verilerin yalnızca öneri için, bu cihazda saklanır. İstediğinde profil
          ekranından tamamen silebilirsin (KVKK/GDPR).
        </p>
        <p className="authAlt">
          <button type="button" onClick={onGeri}>← Geri</button>
        </p>
      </form>
    </div>
  );
}
