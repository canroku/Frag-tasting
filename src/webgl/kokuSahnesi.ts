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
    this.renderer.toneMappingExposure = 1.35;

    this.kurIsiklar();
    this.olusturKivilcimlar();
    this.olusturSise();

    this.rafId = requestAnimationFrame(this.animate);
  }

  // ---------- Işıklandırma: dramatik tek yönlü chiaroscuro ----------
  private kurIsiklar() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.12);
    this.scene.add(ambient);

    const anaIsik = new THREE.SpotLight(0xfff0e0, 14.0);
    anaIsik.position.set(4, 6, 3);
    anaIsik.angle = Math.PI / 4;
    anaIsik.penumbra = 0.9;
    anaIsik.castShadow = true;
    anaIsik.shadow.mapSize.set(2048, 2048);
    anaIsik.shadow.camera.near = 1.0;
    anaIsik.shadow.camera.far = 15;
    anaIsik.shadow.bias = -0.001;
    this.scene.add(anaIsik);

    const kenarIsik = new THREE.DirectionalLight(0x7fb8ff, 8.5);
    kenarIsik.position.set(-5, 3, -4);
    this.scene.add(kenarIsik);

    const dolduranIsik = new THREE.DirectionalLight(0xffd9b3, 0.7);
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

  // ---------- Şişe: LatheGeometry ile prosedürel olarak inşa edilir ----------
  private olusturSise() {
    this.sise = new THREE.Group();
    this.scene.add(this.sise);

    // Silüet profili (x = eksenden uzaklık, y = yükseklik) — taban→omuz→boyun→ağız
    const profil = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.62, 0.0),
      new THREE.Vector2(0.66, 0.04),
      new THREE.Vector2(0.66, 0.86),
      new THREE.Vector2(0.6, 0.98),
      new THREE.Vector2(0.42, 1.08),
      new THREE.Vector2(0.2, 1.14),
      new THREE.Vector2(0.19, 1.15),
      new THREE.Vector2(0.19, 1.34),
      new THREE.Vector2(0.24, 1.34),
      new THREE.Vector2(0.24, 1.15),
    ].map((v) => new THREE.Vector2(v.x, v.y));

    const disGeo = new THREE.LatheGeometry(profil, 48);
    const disMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff3e8,
      metalness: 0.05,
      roughness: 0.06,
      transmission: 0.92,
      thickness: 0.5,
      ior: 1.45,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });
    const disMesh = new THREE.Mesh(disGeo, disMat);
    disMesh.castShadow = true;
    disMesh.receiveShadow = true;

    // İç likit — camın biraz içinde, doygun kan kırmızısı-amber
    const likitProfil = profil
      .filter((v) => v.y <= 0.92)
      .map((v) => new THREE.Vector2(Math.max(0, v.x - 0.045), v.y));
    const likitGeo = new THREE.LatheGeometry(likitProfil, 48);
    const likitMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8322a,
      emissive: 0x5a0f0c,
      emissiveIntensity: 0.35,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.55,
      thickness: 1.2,
      ior: 1.35,
      transparent: true,
      opacity: 0.96,
    });
    const likitMesh = new THREE.Mesh(likitGeo, likitMat);
    likitMesh.castShadow = true;

    // Kapak — metalik altın-bronz
    const kapakGeo = new THREE.CylinderGeometry(0.27, 0.24, 0.22, 32);
    const kapakMat = new THREE.MeshStandardMaterial({ color: 0xcaa25a, metalness: 0.92, roughness: 0.32 });
    const kapakMesh = new THREE.Mesh(kapakGeo, kapakMat);
    kapakMesh.position.y = 1.45;
    kapakMesh.castShadow = true;

    // Etiket plakası — küçük dokulu bir plaka
    const etiketGeo = new THREE.PlaneGeometry(0.62, 0.34);
    const etiketMat = new THREE.MeshStandardMaterial({
      color: 0x120806,
      metalness: 0.1,
      roughness: 0.55,
      map: this.olusturEtiketTeksturu(),
      transparent: true,
    });
    const etiketMesh = new THREE.Mesh(etiketGeo, etiketMat);
    etiketMesh.position.set(0, 0.62, 0.665);

    this.sise.add(disMesh, likitMesh, kapakMesh, etiketMesh);

    // Ölçekle + tam merkeze al (bel yüksekliği referans alınarak)
    const kutu = new THREE.Box3().setFromObject(this.sise);
    const boyut = kutu.getSize(new THREE.Vector3());
    const maxBoyut = Math.max(boyut.x, boyut.y, boyut.z);
    const hedefOlcek = 2.6 / (maxBoyut || 1);
    this.sise.scale.setScalar(hedefOlcek);
    this.sise.updateMatrixWorld(true);

    const kutu2 = new THREE.Box3().setFromObject(this.sise);
    const merkez = kutu2.getCenter(new THREE.Vector3());
    this.sise.position.sub(merkez);
    this.sise.position.y -= 0.15;
  }

  private olusturEtiketTeksturu(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 140;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(18,8,6,0.001)";
    ctx.fillRect(0, 0, 256, 140);
    ctx.strokeStyle = "rgba(202,162,90,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 240, 124);
    ctx.fillStyle = "#f2e6d8";
    ctx.textAlign = "center";
    ctx.font = "24px Georgia, serif";
    ctx.fillText("FRAG", 128, 64);
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillStyle = "#caa25a";
    ctx.fillText("Tasting", 128, 96);
    return new THREE.CanvasTexture(c);
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
    const y = 0.35 + Math.sin(this.yumusakScroll * Math.PI) * 0.8;
    const radius = 4.0 - Math.sin(this.yumusakScroll * Math.PI) * 0.6;
    const x = radius * Math.sin(phi);
    const z = radius * Math.cos(phi);

    const gecis = Math.min(1.0, this.yumusakScroll / 0.28);
    const yumusatma = (Math.cos(gecis * Math.PI) + 1.0) * 0.5;
    const bakisXKaydirma = -0.9 * yumusatma;
    const hedefBakis = new THREE.Vector3(bakisXKaydirma, -0.1, 0);
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
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
  }
}
