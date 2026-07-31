// Sinematik "Koku ve Zaman" hero'su — Karşılama ekranının WebGL katmanı.
// 900vh'lik bir kaydırma boyunca kamera şişenin etrafında 360° döner, arka
// planda likit-amber dalga shader'ı nefes alır, koku zerrecikleri yükselir.
// Metin katmanı createPortal ile body'ye takılır (fixed, .kabuk'un dışında).
import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { KokuSahnesi } from "../webgl/kokuSahnesi";
import { useDil } from "../i18n/DilContext";
import { DilSecici } from "./ui";
import heroNoir from "../assets/hero-noir.png";

const HEDEF_SCROLL = [0.0, 0.34, 0.62, 0.94];

// Her başlığın karakterlerini <span class="char"> içine sarar, kademeli
// gecikmeyle harf harf açılan bulanık-yükseliş efekti için. <br> korunur.
function harflereBol() {
  document.querySelectorAll(".kokuBaslik").forEach((baslik) => {
    if (baslik.getAttribute("data-bolundu") === "1") return;
    const parcalar = baslik.innerHTML.split(/(<br\s*\/?>)/i);
    let html = "";
    let gecikme = 0;
    parcalar.forEach((parca) => {
      if (/^<br/i.test(parca)) { html += parca; return; }
      for (const karakter of parca) {
        if (karakter === " ") { html += " "; continue; }
        html += `<span class="char" style="transition-delay:${(gecikme * 0.035).toFixed(3)}s">${karakter}</span>`;
        gecikme++;
      }
    });
    baslik.innerHTML = html;
    baslik.setAttribute("data-bolundu", "1");
  });
}

export function KokuHero({ onBasla, onGiris }: { onBasla: () => void; onGiris: () => void }) {
  const { t, dil } = useDil();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imlecIcRef = useRef<HTMLDivElement>(null);
  const imlecDisRef = useRef<HTMLDivElement>(null);
  const slaytRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gorselRef = useRef<HTMLDivElement>(null);
  const dashRefs = useRef<(HTMLDivElement | null)[]>([]);
  const noktaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    document.body.classList.add("kokuImlecAktif");
    const canvas = canvasRef.current;
    if (!canvas) return;

    let imlecX = window.innerWidth / 2, imlecY = window.innerHeight / 2;
    let disX = imlecX, disY = imlecY;
    let fareHedefX = 0, fareHedefY = 0;

    const sahne = new KokuSahnesi({
      canvas,
      kareBasi: (scroll) => {
        // Dış imleç halkası, iç imlece doğru yumuşak kayar
        disX += (imlecX - disX) * 0.2;
        disY += (imlecY - disY) * 0.2;
        if (imlecDisRef.current) {
          imlecDisRef.current.style.left = `${disX}px`;
          imlecDisRef.current.style.top = `${disY}px`;
        }

        // Izgara noktaları — yatay-benzeri sürüklenme
        noktaRefs.current.forEach((nokta, i) => {
          if (!nokta) return;
          const baslangicY = (i * 17) % 80 + 10;
          let hiz = 90 + (i * 55) % 180;
          if (i % 2 === 0) hiz = -hiz;
          let y = baslangicY + scroll * hiz;
          y = ((y % 100) + 100) % 100;
          nokta.style.top = `${y}%`;
        });

        // İlerleme çizgileri (4 dilim)
        dashRefs.current.forEach((dash, i) => {
          if (!dash) return;
          const basla = i * 0.25, bitir = (i + 1) * 0.25;
          let ilerleme = (scroll - basla) / (bitir - basla);
          ilerleme = Math.max(0, Math.min(1, ilerleme));
          dash.style.height = `${ilerleme * 100}%`;
        });

        // Slayt aktiflik aralıkları
        const aralik = (v: number, a: number, b: number) => v >= a && v <= b;
        const durumlar = [
          aralik(scroll, -0.1, 0.12),
          aralik(scroll, 0.28, 0.4),
          aralik(scroll, 0.56, 0.68),
          aralik(scroll, 0.84, 1.05),
        ];
        slaytRefs.current.forEach((el, i) => el?.classList.toggle("aktif", durumlar[i]));
        gorselRef.current?.classList.toggle("aktif", durumlar[1]);
      },
    });

    function scrollGuncelle() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const oran = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      sahne.guncelleScroll(oran);
    }
    function fareGuncelle(e: MouseEvent) {
      imlecX = e.clientX; imlecY = e.clientY;
      if (imlecIcRef.current) {
        imlecIcRef.current.style.left = `${imlecX}px`;
        imlecIcRef.current.style.top = `${imlecY}px`;
      }
      fareHedefX = (e.clientX / window.innerWidth) * 2 - 1;
      fareHedefY = (e.clientY / window.innerHeight) * 2 - 1;
      sahne.guncelleFare(fareHedefX, fareHedefY);
    }
    function boyutGuncelle() { sahne.yenidenBoyutlandir(); }

    window.addEventListener("scroll", scrollGuncelle, { passive: true });
    window.addEventListener("mousemove", fareGuncelle);
    window.addEventListener("resize", boyutGuncelle);
    scrollGuncelle();

    return () => {
      document.body.classList.remove("kokuImlecAktif");
      window.removeEventListener("scroll", scrollGuncelle);
      window.removeEventListener("mousemove", fareGuncelle);
      window.removeEventListener("resize", boyutGuncelle);
      sahne.yoketme();
      window.scrollTo(0, 0);
    };
  }, []);

  // Dil değişince başlıklar yeniden render edilir (data-bolundu sıfırlanır) —
  // yeni metni tekrar harflere böl. useLayoutEffect: boyanmadan önce çalışır,
  // düz metnin bir kare görünüp kaybolmasını (flaş) engeller.
  useLayoutEffect(() => {
    document.querySelectorAll(".kokuBaslik[data-bolundu]").forEach((el) => el.removeAttribute("data-bolundu"));
    harflereBol();
  }, [dil]);

  function navaGit(i: number) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * HEDEF_SCROLL[i], behavior: "smooth" });
  }

  return (
    <>
      {/* Kaydırma uzunluğunu oluşturan görünmez blok — asıl görsel her şey fixed */}
      <div className="kokuUzunluk" aria-hidden />
      {createPortal(
        <>
          <div className="kokuImlecIc" ref={imlecIcRef} />
          <div className="kokuImlecDis" ref={imlecDisRef} />
          <canvas id="koku-webgl" ref={canvasRef} />

          <header className="kokuUst">
            <div className="kokuMarka">Frag <em>Tasting</em></div>
            <nav className="kokuNav">
              {[t("koku.nav1"), t("koku.nav2"), t("koku.nav3"), t("koku.nav4")].map((etiket, i) => (
                <a key={i} href={`#slide-${i + 1}`} className="kokuNavLink" onClick={(e) => { e.preventDefault(); navaGit(i); }}>
                  {etiket}
                </a>
              ))}
            </nav>
            <div className="kokuAksiyon">
              <DilSecici />
              <button className="kokuCta" onClick={onBasla}>
                {t("karsilama.baslaCta")} <span className="kokuCtaCember" />
              </button>
            </div>
          </header>

          <div className="kokuSlaytKumesi">
            <div className="kokuSlayt kokuSlayt1" ref={(el) => { slaytRefs.current[0] = el; }}>
              <h2 className="kokuBaslik">
                {t("koku.slide1Satir1")} <br /> {t("koku.slide1Satir2")}
              </h2>
              <div className="kokuAciklamaSira">
                <p className="kokuAciklama kokuCol1">{t("koku.slide1Col1")}</p>
                <p className="kokuAciklama kokuCol2">{t("koku.slide1Col2")}</p>
              </div>
            </div>

            <div className="kokuGorselMaske" ref={gorselRef}>
              <img src={heroNoir} alt="Frag Tasting — kan kırmızısı likit parfüm şişesi" />
            </div>
            <div className="kokuSlayt kokuSlayt2" ref={(el) => { slaytRefs.current[1] = el; }}>
              <h2 className="kokuBaslik">{t("koku.slide2Baslik")}</h2>
              <p className="kokuAciklama kokuSlayt2Desc">{t("koku.slide2Desc")}</p>
            </div>

            <div className="kokuSlayt kokuSlayt3" ref={(el) => { slaytRefs.current[2] = el; }}>
              <h2 className="kokuBaslik">{t("koku.slide3Baslik")}</h2>
              <p className="kokuAciklama">{t("koku.slide3Desc")}</p>
            </div>

            <div className="kokuSlayt kokuSlayt4" ref={(el) => { slaytRefs.current[3] = el; }}>
              <h2 className="kokuBaslik">
                {t("koku.slide4Satir1")} <br /> {t("koku.slide4Satir2")}
              </h2>
              <p className="kokuAciklama">{t("koku.slide4Desc")}</p>
              <button className="kokuGirisLink" onClick={onGiris}>{t("auth.girisBtn")} →</button>
            </div>
          </div>

          <div className="kokuYatayCizgi" />
          <div className="kokuIzgara">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`kokuSatir ${i === 4 ? "kokuIlerlemeSutun" : ""}`}>
                <div className="kokuNokta ust" ref={(el) => { noktaRefs.current[i * 2] = el; }} />
                <div className="kokuNokta alt" ref={(el) => { noktaRefs.current[i * 2 + 1] = el; }} />
                {i === 4 && (
                  <div className="kokuDashlar">
                    {[0, 1, 2, 3].map((d) => (
                      <div key={d} className="kokuDash">
                        <div className="kokuDashDolgu" ref={(el) => { dashRefs.current[d] = el; }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
