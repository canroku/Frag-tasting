// Sinematik parfüm şişesi sahnesi — Three.js.
// Kaydırma (scroll) kamerayı şişenin etrafında 360° döndürür, arka planda
// yavaş nefes alan bir "likit amber" dalga shader'ı akar, etrafında koku
// zerrecikleri (sparks) yükselir. Tüm sahne DOM'dan bağımsız, imperatif bir
// sınıf: React katmanı yalnızca kaydırma/fare konumunu besler.
import * as THREE from "three";

export interface KokuSahnesiSecenek {
  canvas: HTMLCanvasElement;
  // Her karede çağrılır — overlay DOM güncellemeleri (slaytlar, izgara
  // noktaları, ilerleme çizgileri) React tarafında yapılsın diye.
  kareBasi?: (yumusakScroll: number) => void;
}

const KIVILCIM_ADEDI = 420;

export class KokuSahnesi {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private sise: THREE.Group | null = null;
  private kivilcimlar!: THREE.Points;
  private kivilcimVeri: { hx: number; hy: number; hz: number; salinimHiz: number; salinimYaricap: number; faz: number }[] = [];
  private bgUniform: { uTime: { value: number }; uResolution: { value: THREE.Vector2 }; uMouse: { value: THREE.Vector2 }; uScroll: { value: number } };
  private ortamHedefi: THREE.WebGLRenderTarget | null = null;

  private hedefScroll = 0;
  private yumusakScroll = 0;
  private fareX = 0;
  private fareY = 0;
  private yumusakFareX = 0;
  private yumusakFareY = 0;

  private rafId = 0;
  private durduruldu = false;
  private kareBasi?: (v: number) => void;

  constructor({ canvas, kareBasi }: KokuSahnesiSecenek) {
    this.canvas = canvas;
    this.kareBasi = kareBasi;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const boy = window.innerWidth, en = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, boy / en, 0.1, 100);
    this.camera.position.set(0, 0.2, 3.0);
    this.scene.add(this.camera);

    this.bgUniform = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(boy, en) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    };
    this.olusturArkaPlanShader();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(boy, en);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.kurOrtamHaritasi();
    this.kurIsiklar();
    this.olusturKivilcimlar();
    this.olusturSise();

    this.rafId = requestAnimationFrame(this.animate);
  }

  /* ---------- Stüdyo ortam haritası ----------
     Camın "cam gibi" görünmesinin asıl sebebi yansımadır: ışık kaynağının
     kendisi değil, yansıdığı parlak yüzeyler. Burada ürün fotoğrafçılığındaki
     softbox düzeni prosedürel olarak kurulup PMREM ile ortam haritasına
     çevrilir — camın kenarlarındaki uzun dikey parlamalar buradan gelir. */
  private kurOrtamHaritasi() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const studyo = new THREE.Scene();
    studyo.background = new THREE.Color(0x04060b);

    const softbox = (
      w: number, h: number, renk: number, guc: number,
      konum: [number, number, number], donme: [number, number, number] = [0, 0, 0]
    ) => {
      const mat = new THREE.MeshBasicMaterial({ color: renk });
      mat.color.multiplyScalar(guc); // HDR: PMREM yarı-float hedefe render eder, 1'in üstü korunur
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(...konum);
      mesh.rotation.set(...donme);
      studyo.add(mesh);
    };

    // Klasik ürün çekimi: iki uzun dikey şerit ışık (camın kenar parlamaları),
    // tepeden geniş bir softbox, arkadan sıcak bir vurgu.
    softbox(1.2, 9, 0xffffff, 7.0, [-5, 0, 1.5], [0, Math.PI / 2, 0]);
    softbox(0.9, 9, 0xdce8ff, 5.0, [5, 0, 0.5], [0, -Math.PI / 2, 0]);
    softbox(8, 3.5, 0xffffff, 3.2, [0, 5.5, 0], [Math.PI / 2, 0, 0]);
    softbox(5, 4, 0xff6a3c, 2.4, [1.5, 0.5, -6], [0, 0, 0]);
    softbox(6, 2, 0x2a1410, 1.0, [0, -4.5, 0], [-Math.PI / 2, 0, 0]);

    this.ortamHedefi = pmrem.fromScene(studyo, 0.04);
    this.scene.environment = this.ortamHedefi.texture;

    studyo.traverse((o) => {
      if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
    });
    pmrem.dispose();
  }

  /* ---------- Işıklandırma ----------
     Ortam haritası artık genel aydınlatmayı ve yansımaları taşıdığı için
     ışıklar yalnızca yön ve kontrast veriyor; eski (env'siz) değerlerinin
     çok altındalar, yoksa cam yanıp beyaza doyuyordu. */
  private kurIsiklar() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.04);
    this.scene.add(ambient);

    const anaIsik = new THREE.SpotLight(0xfff0e0, 7.0);
    anaIsik.position.set(4, 6, 3);
    anaIsik.angle = Math.PI / 4;
    anaIsik.penumbra = 0.9;
    anaIsik.castShadow = true;
    anaIsik.shadow.mapSize.set(2048, 2048);
    anaIsik.shadow.camera.near = 1.0;
    anaIsik.shadow.camera.far = 15;
    anaIsik.shadow.bias = -0.0015;
    anaIsik.shadow.radius = 4;
    this.scene.add(anaIsik);

    const kenarIsik = new THREE.DirectionalLight(0x8fc0ff, 2.6);
    kenarIsik.position.set(-5, 3, -4);
    this.scene.add(kenarIsik);

    // Arkadan geçen ışık — likidin içinden sızıp parfümü "ışıldatan" ışık.
    // Şeffaf malzemede derinliğe göre renklenmeyi görünür kılan asıl kaynak.
    const arkaIsik = new THREE.PointLight(0xff8a5c, 6.0, 12, 2);
    arkaIsik.position.set(-0.6, 0.5, -2.2);
    this.scene.add(arkaIsik);

    const dolduranIsik = new THREE.DirectionalLight(0xffd9b3, 0.35);
    dolduranIsik.position.set(-2, -4, 2);
    this.scene.add(dolduranIsik);
  }

  // ---------- Koku zerrecikleri: kırmızı-amber + soğuk mavi karışımı ----------
  private olusturKivilcimTeksturu(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = 16; c.height = 16;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.6, "rgba(255,255,255,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(c);
  }

  private olusturKivilcimlar() {
    const geo = new THREE.BufferGeometry();
    const konum = new Float32Array(KIVILCIM_ADEDI * 3);
    const renk = new Float32Array(KIVILCIM_ADEDI * 3);

    for (let i = 0; i < KIVILCIM_ADEDI; i++) {
      const x = (Math.random() - 0.5) * 6.5;
      const y = (Math.random() - 0.5) * 5.0 - 0.5;
      const z = (Math.random() - 0.5) * 6.5;
      konum[i * 3] = x; konum[i * 3 + 1] = y; konum[i * 3 + 2] = z;

      if (Math.random() < 0.62) {
        // sıcak kehribar/kan kırmızısı zerrecik
        renk[i * 3] = 0.95 + Math.random() * 0.05;
        renk[i * 3 + 1] = 0.28 + Math.random() * 0.2;
        renk[i * 3 + 2] = 0.1 + Math.random() * 0.08;
      } else {
        // soğuk mavimsi zerrecik (kenar ışığıyla uyumlu)
        renk[i * 3] = 0.5 + Math.random() * 0.15;
        renk[i * 3 + 1] = 0.75 + Math.random() * 0.12;
        renk[i * 3 + 2] = 1.0;
      }

      this.kivilcimVeri.push({
        hx: (Math.random() - 0.5) * 0.4,
        hy: 0.15 + Math.random() * 0.3,
        hz: (Math.random() - 0.5) * 0.4,
        salinimHiz: 0.5 + Math.random() * 1.5,
        salinimYaricap: 0.05 + Math.random() * 0.15,
        faz: Math.random() * Math.PI * 2,
      });
    }

    geo.setAttribute("position", new THREE.BufferAttribute(konum, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(renk, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.olusturKivilcimTeksturu(),
    });

    this.kivilcimlar = new THREE.Points(geo, mat);
    this.scene.add(this.kivilcimlar);
  }

  /* ---------- Şişe ----------
     Prosedürel flakon. Gerçekçilik için üç şey kritik:
     1) Silüet spline'dan 90 noktaya örneklenir → köşeli bant yerine akıcı omuz.
     2) Gövde z ekseninde yassılaştırılır → silindir değil, gerçek flakon oranı.
     3) Renk boyadan değil, likidin kalınlığa bağlı soğurmasından (attenuation)
        gelir: kenarlar açık, göbek koyu — gerçek şişelerdeki derinlik hissi. */
  private olusturSise() {
    this.sise = new THREE.Group();
    this.scene.add(this.sise);

    // Yassı flakon oranı; dönme dış grupta, yassılaştırma içeride kalır.
    const govde = new THREE.Group();
    govde.scale.set(1, 1, 0.58);
    this.sise.add(govde);

    // Silüet kontrol noktaları (x = eksenden uzaklık, y = yükseklik)
    const kontrol = [
      new THREE.Vector2(0.001, 0.0),
      new THREE.Vector2(0.40, 0.0),
      new THREE.Vector2(0.62, 0.005),
      new THREE.Vector2(0.68, 0.055),
      new THREE.Vector2(0.695, 0.16),
      new THREE.Vector2(0.695, 0.70),
      new THREE.Vector2(0.685, 0.85),
      new THREE.Vector2(0.63, 0.97),
      new THREE.Vector2(0.50, 1.07),
      new THREE.Vector2(0.34, 1.13),
      new THREE.Vector2(0.235, 1.17),
      new THREE.Vector2(0.205, 1.22),
      new THREE.Vector2(0.20, 1.33),
    ];
    const profil = new THREE.SplineCurve(kontrol).getPoints(90);

    const disGeo = new THREE.LatheGeometry(profil, 128);
    // Gerçek optik cam: tam iletim + kalınlık + kırılma indisi.
    const disMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.035,
      transmission: 1,
      thickness: 0.32,
      ior: 1.52,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.7,
      transparent: true,
      side: THREE.FrontSide,
    });
    const disMesh = new THREE.Mesh(disGeo, disMat);
    disMesh.castShadow = true;

    // Likit: aynı silüetin içe kaydırılmış hâli, dolum çizgisinde düz yüzeyle kapanır
    const dolumY = 0.76;
    const likitNokta: THREE.Vector2[] = [];
    for (const p of profil) {
      if (p.y <= dolumY) likitNokta.push(new THREE.Vector2(Math.max(0.001, p.x - 0.05), p.y));
    }
    const yuzeyR = likitNokta[likitNokta.length - 1]?.x ?? 0.6;
    for (let i = 1; i <= 10; i++) {
      likitNokta.push(new THREE.Vector2(yuzeyR * (1 - i / 10) + 0.001, dolumY));
    }
    const likitGeo = new THREE.LatheGeometry(likitNokta, 128);
    /* Likit bilerek transmission KULLANMIYOR: three.js, iletim (refraction)
       geçişini çizerken sahnedeki diğer iletken nesneleri hariç tutar — likit
       de iletken olsaydı camın arkasında hiç görünmezdi. Opak ama parlak ve
       hafif kendinden ışıklı bir malzeme, camın kırılma tamponuna girer ve
       şişenin içinden gerçekten görünür. */
    const likitMat = new THREE.MeshPhysicalMaterial({
      color: 0x8e1c14,
      metalness: 0,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      emissive: 0x4a0a06,
      emissiveIntensity: 0.55,
      envMapIntensity: 1.1,
      side: THREE.FrontSide,
    });
    const likitMesh = new THREE.Mesh(likitGeo, likitMat);

    // Kapak: koyu, mat-metal blok + ince altın bilezik (referans fotoğraftaki gibi)
    const kapakMat = new THREE.MeshStandardMaterial({
      color: 0x15100e, metalness: 1, roughness: 0.28, envMapIntensity: 1.5,
    });
    const kapak = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.275, 0.30, 64, 1, false), kapakMat);
    kapak.position.y = 1.44;
    kapak.castShadow = true;

    const bilezikMat = new THREE.MeshStandardMaterial({
      color: 0xd8b06a, metalness: 1, roughness: 0.18, envMapIntensity: 1.8,
    });
    const bilezik = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.05, 64), bilezikMat);
    bilezik.position.y = 1.275;
    bilezik.castShadow = true;

    // Etiket: gövdenin eğrisine oturan ince kabuk (düz plaka "yapıştırma" duruyordu)
    const etiketGeo = new THREE.CylinderGeometry(0.702, 0.702, 0.36, 64, 1, true, -0.62, 1.24);
    const etiketMat = new THREE.MeshStandardMaterial({
      map: this.olusturEtiketTeksturu(),
      transparent: true,
      metalness: 0.25,
      roughness: 0.45,
      envMapIntensity: 0.8,
      side: THREE.DoubleSide,
    });
    const etiket = new THREE.Mesh(etiketGeo, etiketMat);
    etiket.position.y = 0.52;

    govde.add(disMesh, likitMesh, kapak, bilezik, etiket);

    // Ölçekle + tam merkeze al
    const kutu = new THREE.Box3().setFromObject(this.sise);
    const boyut = kutu.getSize(new THREE.Vector3());
    const maxBoyut = Math.max(boyut.x, boyut.y, boyut.z);
    this.sise.scale.setScalar(2.6 / (maxBoyut || 1));
    this.sise.updateMatrixWorld(true);

    const merkez = new THREE.Box3().setFromObject(this.sise).getCenter(new THREE.Vector3());
    this.sise.position.sub(merkez);
    this.sise.position.y -= 0.15;
  }

  /* Etiket dokusu. Silindir kabuğun UV'si tüm çevreyi kapladığından doku da
     tam genişliktir; yazı yalnızca ortadaki dar şeride basılır, kalanı
     saydam kalır — böylece etiket şişenin sadece ön yüzünde görünür. */
  private olusturEtiketTeksturu(): THREE.CanvasTexture {
    const G = 1024, Y = 320;
    const c = document.createElement("canvas");
    c.width = G; c.height = Y;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, G, Y);

    const ox = G / 2, oy = Y / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // İnce altın çerçeve
    ctx.strokeStyle = "rgba(216,176,106,0.85)";
    ctx.lineWidth = 3;
    ctx.strokeRect(ox - 210, oy - 118, 420, 236);
    ctx.lineWidth = 1;
    ctx.strokeRect(ox - 199, oy - 107, 398, 214);

    ctx.fillStyle = "#f6ece0";
    ctx.font = "600 62px Georgia, 'Times New Roman', serif";
    ctx.letterSpacing = "14px";
    ctx.fillText("FRAG", ox, oy - 38);

    ctx.fillStyle = "#d8b06a";
    ctx.font = "italic 54px Georgia, 'Times New Roman', serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("Tasting", ox, oy + 30);

    ctx.letterSpacing = "8px";
    ctx.fillStyle = "rgba(246,236,224,0.62)";
    ctx.font = "20px Georgia, serif";
    ctx.fillText("EAU DE PARFUM", ox, oy + 88);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  // ---------- Arka plan: yavaş nefes alan likit dalga shader'ı ----------
  private olusturArkaPlanShader() {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uScroll;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
        float aspect = uResolution.x / uResolution.y;
        float time = uTime * 0.08;
        float scroll = uScroll;

        float angle1 = 0.6, angle2 = -0.7, angle3 = 1.2;
        float freq1 = 2.4, freq2 = 3.2, freq3 = 4.0;

        vec2 warpedUv = uv;
        float scrollDeform = scroll * 5.0;
        warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
        warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;
        warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
        warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;

        vec2 scrollDrift = vec2(scroll * 0.04, -scroll * 0.02);
        vec2 mouseShift = vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
        warpedUv += scrollDrift + mouseShift;

        vec2 dir1 = vec2(cos(angle1), sin(angle1));
        vec2 dir2 = vec2(cos(angle2), sin(angle2));
        vec2 dir3 = vec2(cos(angle3), sin(angle3));

        float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
        float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
        float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);
        float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;

        float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
        float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
        float crest = wideSheen * 0.5 + crispSpecular * 0.9;

        // Üst (scroll=0): kan kırmızısı / kehribar — Alt (scroll=1): gece lacivert-siyahı
        vec3 c0_shadow = vec3(0.0018, 0.0004, 0.0004);
        vec3 c0_wave1  = vec3(0.095, 0.028, 0.018);
        vec3 c0_wave2  = vec3(0.055, 0.014, 0.010);
        vec3 c0_crest  = vec3(0.50, 0.22, 0.13);

        vec3 c1_shadow = vec3(0.0005, 0.0006, 0.0014);
        vec3 c1_wave1  = vec3(0.020, 0.028, 0.060);
        vec3 c1_wave2  = vec3(0.010, 0.016, 0.040);
        vec3 c1_crest  = vec3(0.16, 0.28, 0.50);

        float t = smoothstep(0.0, 1.0, scroll);
        vec3 colShadow = mix(c0_shadow, c1_shadow, t);
        vec3 colWave1  = mix(c0_wave1, c1_wave1, t);
        vec3 colWave2  = mix(c0_wave2, c1_wave2, t);
        vec3 colCrest  = mix(c0_crest, c1_crest, t);

        vec3 color = colShadow;
        color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
        color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
        color += colCrest * crest * 1.4;

        float vignette = 1.0 - dot(uv, uv) * 0.12;
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.bgUniform,
      depthWrite: false,
      depthTest: false,
    });
    const geo = new THREE.PlaneGeometry(30, 30);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, -8);
    mesh.renderOrder = -10;
    this.camera.add(mesh);
  }

  // ---------- Dışa açık API ----------
  guncelleScroll(v: number) { this.hedefScroll = v; }
  guncelleFare(x: number, y: number) { this.fareX = x; this.fareY = y; }

  yenidenBoyutlandir() {
    const boy = window.innerWidth, en = window.innerHeight;
    this.camera.aspect = boy / en;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(boy, en);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.bgUniform.uResolution.value.set(boy, en);
  }

  private animate = () => {
    if (this.durduruldu) return;
    this.rafId = requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();

    this.yumusakScroll += (this.hedefScroll - this.yumusakScroll) * 0.06;
    this.yumusakFareX += (this.fareX - this.yumusakFareX) * 0.05;
    this.yumusakFareY += (this.fareY - this.yumusakFareY) * 0.05;

    if (this.sise) {
      this.sise.rotation.y = this.yumusakFareX * 0.25;
      this.sise.rotation.x = this.yumusakFareY * 0.15;
    }

    // Zerrecik fiziği — hızlı kaydırmada türbülans artar
    const konum = this.kivilcimlar.geometry.attributes.position.array as Float32Array;
    const zaman = this.clock.getElapsedTime();
    const scrollHizi = Math.abs(this.hedefScroll - this.yumusakScroll);
    const hizCarpani = 1.0 + scrollHizi * 9.0;
    const turbulans = scrollHizi * 0.8;
    for (let i = 0; i < KIVILCIM_ADEDI; i++) {
      const idx = i * 3;
      const veri = this.kivilcimVeri[i];
      konum[idx] += veri.hx * dt * hizCarpani;
      konum[idx + 1] += veri.hy * dt * hizCarpani;
      konum[idx + 2] += veri.hz * dt * hizCarpani;
      const salinim = veri.salinimYaricap * (1.0 + turbulans * 4.0);
      konum[idx] += Math.sin(zaman * veri.salinimHiz + veri.faz) * salinim * dt;
      konum[idx + 2] += Math.cos(zaman * veri.salinimHiz + veri.faz) * salinim * dt;
      if (konum[idx + 1] > 3.0 || Math.abs(konum[idx]) > 3.5 || Math.abs(konum[idx + 2]) > 3.5) {
        konum[idx + 1] = -2.5;
        konum[idx] = (Math.random() - 0.5) * 3.0;
        konum[idx + 2] = (Math.random() - 0.5) * 3.0;
      }
    }
    this.kivilcimlar.geometry.attributes.position.needsUpdate = true;

    // Kamera 360° yörünge
    const phi = this.yumusakScroll * Math.PI * 2.0;
    const y = 0.3 + Math.sin(this.yumusakScroll * Math.PI) * 0.8;
    // Şişe kadraja tam otursun diye yarıçap geniş tutulur; orta kaydırmada
    // hafifçe yaklaşıp yine uzaklaşır.
    const radius = 4.9 - Math.sin(this.yumusakScroll * Math.PI) * 0.6;
    const x = radius * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const gecis = Math.min(1.0, this.yumusakScroll / 0.28);
    const yumusatma = (Math.cos(gecis * Math.PI) + 1.0) * 0.5;
    const bakisXKaydirma = -1.05 * yumusatma;
    const hedefBakis = new THREE.Vector3(bakisXKaydirma, -0.05, 0);
    const hedefKonum = new THREE.Vector3(x, y, z);
    this.camera.position.lerp(hedefKonum, 0.03);
    this.camera.lookAt(hedefBakis);

    this.bgUniform.uTime.value = zaman;
    this.bgUniform.uMouse.value.set(this.yumusakFareX, -this.yumusakFareY);
    this.bgUniform.uScroll.value = this.yumusakScroll;

    this.kareBasi?.(this.yumusakScroll);
    this.renderer.render(this.scene, this.camera);
  };

  yoketme() {
    this.durduruldu = true;
    cancelAnimationFrame(this.rafId);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        const mat = obj.material;
        const bosalt = (m: THREE.Material) => {
          const kaynak = m as unknown as Record<string, unknown>;
          for (const anahtar of ["map", "alphaMap", "emissiveMap"]) {
            (kaynak[anahtar] as THREE.Texture | undefined)?.dispose();
          }
          m.dispose();
        };
        if (Array.isArray(mat)) mat.forEach(bosalt);
        else if (mat) bosalt(mat);
      }
    });
    this.ortamHedefi?.dispose();
    this.scene.environment = null;
    this.renderer.dispose();
  }
}
