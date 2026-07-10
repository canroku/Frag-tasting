# ⚗️ Frag Tasting

Kişisel koku danışmanı — kullanıcının yaşını, kişiliğini, mevsim ve koku
tercihlerini anlayıp ona en yakın 10–15 parfümü öneren; keşif, favori ve
Fragrantica yönlendirmesi içeren kişiselleştirilmiş öneri motoru.

Uygulama, **"Parfüm Öneri Uygulaması — Algoritma & Sistem Tasarımı v1.0"**
dokümanına birebir uyar. Aşağıdaki eşleme, doküman bölümü → kod konumunu gösterir.

## Çalıştırma

```bash
npm install
npm run dev      # geliştirme
npm run build    # üretim derlemesi (dist/)
npm run preview  # derlenmiş hâli sun
```

## Algoritma → Kod Eşlemesi

| Doküman | Ne yapar | Kod |
| --- | --- | --- |
| §3 Kayıt & Kimlik | E-posta + şifre (hash'li), oturum, profil saklama | `src/state/store.tsx` |
| §4 Onboarding Anketi | Tek soru/ekran, ilerleme çubuğu; demografi, kişilik→aile haritası, notalar, tohum parfüm, mevsim/ay/ortam, yoğunluk/kalıcılık | `src/screens/Anket.tsx`, `src/data/survey.ts` |
| §5 Veri Modeli | Parfüm şeması (aile ağırlıkları 0–1, nota piramidi, mevsim/ortam, `nis_mi`, `fragrantica_url`), 10 aile taksonomisi | `src/engine/types.ts`, `src/data/catalog.ts` (60 parfümlük başlangıç kataloğu), `src/data/notes.ts` |
| §6.1 Özellik vektörleri | Nota / aile / mevsim / ortam vektörleri + skaler hedefler | `src/engine/vector.ts`, `src/engine/profile.ts` |
| §6.2 Puanlama | `S(p) = 0.35·cos(nota) + 0.20·cos(aile) + 0.15·mevsim + 0.10·ortam + 0.10·(1−|Δyoğunluk|) + 0.10·deneyim − 0.25·sevilmeyenNota` | `src/engine/recommend.ts` → `puanla()` |
| §6.3 Sert filtreler | Bütçe, kesin cinsiyet, önerilmiş/favori düşürme, ≥3 sevilmeyen nota | `sertFiltre()` |
| §6.4 Çeşitlendirme | MMR, λ=0.7, ilk 60 aday üzerinden 12 seçim | `mmrSec()` |
| §6.5 Deneyim uyumu | İlk kez→popülerlik, koleksiyoner→niş+yenilik | `deneyimUyum()` |
| §6.6 Soğuk başlangıç | Anket=anında profil + tohum parfüm harmanı (tohum, öneri listesinden hariç tutulur) | `profilVektoru()`, `tohumHarmanla()` |
| §6.7 "Neden önerildi" | Her kartta 3 gerekçe rozeti | `nedenUret()` |
| §6.8 Öğrenen sistem | 👍/👎/favori profili çevrimiçi günceller, öneriler canlı keskinleşir | `geriBildirimUygula()` + `store.tsx` |
| §7 Arama & Keşif | Serbest metin ("vanilyalı kış kokusu"), aile/nota/mevsim/ortam/cinsiyet/bütçe/niş filtreleri, 4 sıralama, "buna benzer" | `src/engine/search.ts`, `src/screens/Kesfet.tsx`, `bunaBenzer()` |
| §8 Favoriler & Geçmiş | Tek dokunuş favori, koleksiyon listeleri ("Kışlıklar"), arama/tıklama geçmişi, öneri geçmişiyle tekrar önleme | `src/state/store.tsx`, `src/screens/Profil.tsx` |
| §9 Fragrantica | Uygulama içi hızlı önizleme (nota özeti) + yeni sekmede yönlendirme; içerik kazınmaz, yalnızca referral | `src/components/ui.tsx` → `DetayPanel` |
| §10 Tasarım | Doküman paleti (aubergine `#4A1F42`, gül kurusu, amber-altın, krem, yeşil) 2026 "boutique noir" yorumuyla: aurora zemin, cam kartlar, serif başlıklar, koku partikülü yükleme animasyonu, mevsime göre değişen vurgu tonu | `src/styles.css` |

## Mimari Notlar

- **MVP (Aşama 1)** tamamen istemci tarafında çalışır; hesap/favori/geçmiş
  verisi `localStorage`'ta tutulur. Store katmanının arayüzü, dokümandaki
  API/Backend sözleşmesiyle aynı olduğundan FastAPI + PostgreSQL(+pgvector)
  arka ucuna taşınırken ekran kodu değişmez.
- Şifreler demo amaçlı SHA-256 ile hash'lenir; üretimde doküman gereği sunucu
  tarafında **bcrypt/argon2** kullanılmalıdır.
- Ağırlıklar (`w₁…w₆`) `src/engine/recommend.ts` içindeki `W` sabitinde tek
  yerden ayarlanır — doküman uyarınca gerçek kullanıcı verisiyle A/B testine
  hazırdır (Aşama 3).
- Katalog 60 parfümle başlar; `src/data/catalog.ts` şemasına satır ekleyerek
  200–500 hedefine büyütülür.

## Yol Haritası Durumu

- ✅ Aşama 1 — MVP: kayıt/anket, puanlama+MMR, favoriler, Fragrantica, arama & filtre
- ✅ Aşama 2 (öne çekilenler): geri bildirim döngüsü, "buna benzer", koleksiyon listeleri
- ⏳ Aşama 3 — işbirlikçi filtreleme, A/B ağırlık optimizasyonu, yorumlar, bildirimler (sunucu gerektirir)
