// Gerçek ürün fotoğrafı çözümleyici.
//
// GERÇEKLER (neden "Google'dan çekmiyoruz"):
//  • Google Görseller'in ücretsiz/yasal bir ürün-fotoğrafı API'si yoktur;
//    sonuç sayfasını kazımak Kullanım Şartları'na aykırıdır ve engellenir.
//  • Marka/Fragrantica/Parfumo görselleri teliflidir; kopyalayıp gömmek
//    hukuki risktir (algoritma dokümanı Bölüm 9 da bunu belirtir).
//  • Artifact önizlemesi harici host'ları CSP ile engeller; GitHub Pages
//    dağıtımında ise harici görsel yüklenebilir.
//
// ÇÖZÜM: Görselleri operatör kendi LİSANSLI kaynağından sağlar. İki yol var:
//  1) Parfüm kaydına `gorsel_url` yaz (CSV içe aktarma hattı bunu destekler).
//  2) Aşağıdaki GORSEL_TABANI'nı kendi CDN/bucket adresine ayarla; sistem
//     `{taban}/{id}.jpg` deseniyle otomatik dener. Görsel yoksa/yüklenemezse
//     uygulama sessizce özgün şişe illüstrasyonuna düşer (onError).
//
// Böylece elinde lisanslı bir görsel seti olduğunda TEK satır değişiklikle
// tüm katalog gerçek fotoğraflara geçer; kod hazır bekliyor.

import type { Parfum } from "../engine/types";

// Örn: "https://cdn.ornek.com/parfum" → çalışma anında localStorage ile de
// ayarlanabilir: localStorage.setItem("frag_gorsel_tabani", "https://...")
const VARSAYILAN_TABAN = "";

function taban(): string {
  try {
    return localStorage.getItem("frag_gorsel_tabani") || VARSAYILAN_TABAN;
  } catch {
    return VARSAYILAN_TABAN;
  }
}

export function gorselKaynak(p: Parfum): string | null {
  if (p.gorsel_url) return p.gorsel_url; // en yüksek öncelik: açıkça tanımlı
  const t = taban();
  if (t) return `${t.replace(/\/$/, "")}/${p.id}.jpg`;
  return null; // kaynak yok → illüstrasyon çizilir
}
