// Bölüm 3 + 8 — Hesap, oturum, favoriler, listeler, geçmiş, geri bildirim.
// MVP'de veriler tarayıcıda (localStorage) saklanır; gerçek dağıtımda bu katman
// API/Backend'e (JWT + bcrypt/argon2) taşınır — arayüz sözleşmesi aynı kalır.
import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import type { AnketCevaplari, ProfilVektoru } from "../engine/types";
import { profilVektoru, geriBildirimUygula } from "../engine/profile";

export interface Liste {
  id: string;
  ad: string;
  parfumler: string[];
}

// Koku günlüğü kaydı — "bugün ne süründün?" (SOTD: Scent of the Day)
export interface GunlukKayit {
  tarih: string; // YYYY-MM-DD
  parfumId: string;
  not?: string;
}

// Günlük seri (streak) — üst üste kaç gün uygulamaya girildi
export interface Seri {
  gun: number; // mevcut seri
  enUzun: number;
  sonZiyaret: string; // YYYY-MM-DD
}

export const bugunISO = () => new Date().toISOString().slice(0, 10);

export interface Hesap {
  email: string;
  ad: string;
  sifreHash: string; // demo: SHA-256; üretimde sunucu tarafında bcrypt/argon2
  anket?: AnketCevaplari;
  profil?: ProfilVektoru;
  favoriler: string[];
  listeler: Liste[];
  aramaGecmisi: string[];
  tiklananlar: string[];
  oneriGecmisi: string[]; // tekrarları azaltmak için
  geriBildirim: Record<string, "begen" | "begenme">;
  duello_sayisi?: number; // Koku Düellosu tur sayısı (rozetler için)
  gunluk?: GunlukKayit[]; // koku günlüğü (SOTD)
  seri?: Seri; // günlük giriş serisi
}

const HESAP_KEY = "frag_hesaplar_v1";
const OTURUM_KEY = "frag_oturum_v1";

function hesaplariOku(): Record<string, Hesap> {
  try {
    return JSON.parse(localStorage.getItem(HESAP_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function hesaplariYaz(h: Record<string, Hesap>) {
  localStorage.setItem(HESAP_KEY, JSON.stringify(h));
}

export async function sifreHashle(sifre: string): Promise<string> {
  const veri = new TextEncoder().encode(`frag-tasting::${sifre}`);
  const ozet = await crypto.subtle.digest("SHA-256", veri);
  return Array.from(new Uint8Array(ozet))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface StoreDegerleri {
  hesap: Hesap | null;
  kayitOl: (ad: string, email: string, sifre: string) => Promise<string | null>;
  girisYap: (email: string, sifre: string) => Promise<string | null>;
  cikisYap: () => void;
  anketiKaydet: (cevaplar: AnketCevaplari) => void;
  favoriToggle: (id: string) => void;
  listeOlustur: (ad: string) => void;
  listeyeEkle: (listeId: string, parfumId: string) => void;
  listedenCikar: (listeId: string, parfumId: string) => void;
  aramaKaydet: (sorgu: string) => void;
  tiklamaKaydet: (id: string) => void;
  oneriGecmisineEkle: (ids: string[]) => void;
  geriBildirimVer: (id: string, tur: "begen" | "begenme") => void;
  duelloKaydet: (kazananId: string) => void;
  gunlugeEkle: (parfumId: string, not?: string) => void;
  gunluktenCikar: (tarih: string) => void;
}

const StoreContext = createContext<StoreDegerleri | null>(null);

// İki ISO tarih arasındaki gün farkı
function gunFarki(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hesap, setHesap] = useState<Hesap | null>(() => {
    const email = localStorage.getItem(OTURUM_KEY);
    if (!email) return null;
    return hesaplariOku()[email] ?? null;
  });

  // her değişiklikte kalıcılaştır
  useEffect(() => {
    if (!hesap) return;
    const h = hesaplariOku();
    h[hesap.email] = hesap;
    hesaplariYaz(h);
  }, [hesap]);

  // Günlük seri: oturum açık her gün ilk girişte güncellenir
  useEffect(() => {
    if (!hesap) return;
    const bugun = bugunISO();
    const s = hesap.seri;
    if (s?.sonZiyaret === bugun) return; // bugün zaten sayıldı
    setHesap((eski) => {
      if (!eski) return eski;
      const onceki = eski.seri;
      let gun = 1;
      if (onceki) {
        const fark = gunFarki(onceki.sonZiyaret, bugun);
        gun = fark === 1 ? onceki.gun + 1 : fark <= 0 ? onceki.gun : 1;
      }
      const enUzun = Math.max(onceki?.enUzun ?? 0, gun);
      return { ...eski, seri: { gun, enUzun, sonZiyaret: bugun } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hesap?.email]);

  const degerler = useMemo<StoreDegerleri>(() => {
    const guncelle = (fn: (h: Hesap) => Hesap) =>
      setHesap((eski) => (eski ? fn(eski) : eski));

    return {
      hesap,
      async kayitOl(ad, email, sifre) {
        const e = email.trim().toLocaleLowerCase("tr");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return "Geçerli bir e-posta gir.";
        if (sifre.length < 6) return "Şifre en az 6 karakter olmalı.";
        const h = hesaplariOku();
        if (h[e]) return "Bu e-posta ile zaten bir hesap var.";
        const yeni: Hesap = {
          email: e,
          ad: ad.trim() || e.split("@")[0],
          sifreHash: await sifreHashle(sifre),
          favoriler: [],
          listeler: [],
          aramaGecmisi: [],
          tiklananlar: [],
          oneriGecmisi: [],
          geriBildirim: {},
        };
        h[e] = yeni;
        hesaplariYaz(h);
        localStorage.setItem(OTURUM_KEY, e);
        setHesap(yeni);
        return null;
      },
      async girisYap(email, sifre) {
        const e = email.trim().toLocaleLowerCase("tr");
        const h = hesaplariOku();
        const mevcut = h[e];
        if (!mevcut) return "Hesap bulunamadı.";
        if (mevcut.sifreHash !== (await sifreHashle(sifre))) return "Şifre hatalı.";
        localStorage.setItem(OTURUM_KEY, e);
        setHesap(mevcut);
        return null;
      },
      cikisYap() {
        localStorage.removeItem(OTURUM_KEY);
        setHesap(null);
      },
      anketiKaydet(cevaplar) {
        guncelle((h) => ({
          ...h,
          anket: cevaplar,
          profil: profilVektoru(cevaplar),
          oneriGecmisi: [], // yeni profil → öneri geçmişi sıfırlanır
        }));
      },
      favoriToggle(id) {
        guncelle((h) => {
          const varMi = h.favoriler.includes(id);
          const favoriler = varMi
            ? h.favoriler.filter((f) => f !== id)
            : [...h.favoriler, id];
          // Favori, öneri motoruna pozitif sinyaldir (Bölüm 8)
          const profil =
            !varMi && h.profil ? geriBildirimUygula(h.profil, id, "favori") : h.profil;
          return { ...h, favoriler, profil };
        });
      },
      listeOlustur(ad) {
        guncelle((h) => ({
          ...h,
          listeler: [
            ...h.listeler,
            { id: `l_${Date.now()}`, ad: ad.trim() || "Yeni liste", parfumler: [] },
          ],
        }));
      },
      listeyeEkle(listeId, parfumId) {
        guncelle((h) => ({
          ...h,
          listeler: h.listeler.map((l) =>
            l.id === listeId && !l.parfumler.includes(parfumId)
              ? { ...l, parfumler: [...l.parfumler, parfumId] }
              : l
          ),
        }));
      },
      listedenCikar(listeId, parfumId) {
        guncelle((h) => ({
          ...h,
          listeler: h.listeler.map((l) =>
            l.id === listeId
              ? { ...l, parfumler: l.parfumler.filter((p) => p !== parfumId) }
              : l
          ),
        }));
      },
      aramaKaydet(sorgu) {
        const s = sorgu.trim();
        if (!s) return;
        guncelle((h) => ({
          ...h,
          aramaGecmisi: [s, ...h.aramaGecmisi.filter((x) => x !== s)].slice(0, 20),
        }));
      },
      tiklamaKaydet(id) {
        guncelle((h) => ({
          ...h,
          tiklananlar: [id, ...h.tiklananlar.filter((x) => x !== id)].slice(0, 50),
        }));
      },
      oneriGecmisineEkle(ids) {
        guncelle((h) => ({
          ...h,
          oneriGecmisi: [...new Set([...h.oneriGecmisi, ...ids])].slice(-200),
        }));
      },
      duelloKaydet(kazananId) {
        guncelle((h) => ({
          ...h,
          duello_sayisi: (h.duello_sayisi ?? 0) + 1,
          // düello galibi, öğrenen sisteme "beğen" sinyali olarak akar (Bölüm 6.8)
          profil: h.profil ? geriBildirimUygula(h.profil, kazananId, "begen") : h.profil,
        }));
      },
      geriBildirimVer(id, tur) {
        guncelle((h) => {
          const ayni = h.geriBildirim[id] === tur;
          const geriBildirim = { ...h.geriBildirim };
          if (ayni) delete geriBildirim[id];
          else geriBildirim[id] = tur;
          // Geri bildirim döngüsü: profil vektörü çevrimiçi güncellenir (Bölüm 6.8)
          const profil =
            !ayni && h.profil ? geriBildirimUygula(h.profil, id, tur) : h.profil;
          return { ...h, geriBildirim, profil };
        });
      },
      gunlugeEkle(parfumId, not) {
        const tarih = bugunISO();
        guncelle((h) => {
          const gunluk = [
            { tarih, parfumId, not },
            ...(h.gunluk ?? []).filter((g) => g.tarih !== tarih), // günde tek kayıt
          ];
          // günlüğe eklemek beğeni sinyali: profil buna göre keskinleşir
          const profil = h.profil ? geriBildirimUygula(h.profil, parfumId, "favori") : h.profil;
          return { ...h, gunluk, profil };
        });
      },
      gunluktenCikar(tarih) {
        guncelle((h) => ({ ...h, gunluk: (h.gunluk ?? []).filter((g) => g.tarih !== tarih) }));
      },
    };
  }, [hesap]);

  return <StoreContext.Provider value={degerler}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreDegerleri {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore, StoreProvider içinde kullanılmalı");
  return ctx;
}
