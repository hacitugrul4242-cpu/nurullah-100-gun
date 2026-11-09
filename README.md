# Nurullah — 100 Günlük TYT + AYT Sayısal Çalışma Programı

Nurullah için, Yaver'in 67 günlük telafi programından bağımsız hazırlanmış, mobil uyumlu ve çevrimdışı kullanılabilir çalışma takip uygulamasıdır.

## 100 günlük yapı

| Gün | Amaç |
| --- | --- |
| 1–25 | TYT temel inşası; matematik, Türkçe, fen ve sosyal |
| 26–45 | TYT kalan konular + AYT fizik, kimya, biyoloji ve matematiğe geçiş |
| 46–75 | AYT matematik, geometri ve fen konularının tamamlanması |
| 76–100 | TYT/AYT genel denemeleri, branş soru çalışmaları, yanlış analizi, eksik kapatma, dengeli dinlenme |

**Kapsam denetimi:** 15 ders bölümü; TYT 148 ana konu/197 oturum, sayısal AYT 85 ana konu/161 oturum; toplam 233 ana konu/358 oturum. Her bir oturum ilk 75 güne bir kez planlanmıştır. Ana konu bitişi 75. gün için planlanmıştır; gerçek öğrenme hızı öğrencinin durumuna göre değişebilir.

## Günlük rutinler

- 30 dk Paragraf — her gün
- Problem Rutini — her gün
- 30 dk Kitap Okuma — her gün
- Geometri: 1 test — 5. günden itibaren her gün
- 1 Sayılar Denemesi — 18–70. günlerde altı günde bir
- 1 Dil Bilgisi Denemesi — 30–75. günlerde yedi günde bir

**TYT Türkçe Branş Denemesi** rutini bulunmaz. Son 25 günde 5 TYT ve 5 AYT genel denemesi ile aralarda soru/yanlış çalışmaları vardır. Görevlerde zorunlu soru sayısı veya konu süresi konulmaz.

## Kullanım

1. Uygulamayı açıp **Başlangıç tarihi** bölümünden takvim gününü seç.
2. Gün seçicisinde çalışacağın güne git. Gelecekteki günler incelenebilir ancak tarihleri gelmeden tamamlanamaz.
3. Günlük konu anlatımı ve pekiştirme oturumlarını, rutinleri ve tekrarları işaretle.
4. **Konu Envanteri** bölümünden tamamlanmış ana konuları ve ders ilerlemesini izle.
5. **İlerleme ve Yedekleme** bölümünde geciken görevlere bak ve JSON yedeğini indir. Geri yükleme aynı veriyi başka cihaza taşır.

**Önemli:** Kayıtlar ilk olarak tarayıcıda saklanır. Otomatik bulut senkronizasyonu yoktur; düzenli JSON yedeği alınmalıdır.


## Konu bazlı YouTube kaynakları

Uygulamada **Video Kaynakları** bölümü bulunur. Her ders için varsayılan eğitmen veya alternatif eğitmen seçilebilir. Bu seçim aynı dersin **Günlük Program** ve **Konu Envanteri** bağlantılarını değiştirir. Öğretmen tercihi `nurullah100-app-v1` tarayıcı kaydında ve JSON dışa/içe aktarmada saklanır; mevcut görev tamamlanma kimlikleri değişmez.

Varsayılan eğitmenler:
- Matematik: Yaşar Hoca MathMan
- Geometri: Kenan Kara ile Geometri
- Fizik: VIP Fizik
- Kimya: Görkem Şahin (Benim Hocam)
- Biyoloji: Zeliha Yücel (Benim Hocam)
- Türkçe: Kadir Gümüş (Benim Hocam)
- Tarih: Sadettin Akyayla (Benim Hocam)
- Coğrafya: Bayram Meral (Benim Hocam)
- Felsefe: Can Köni (Benim Hocam)
- Din kültürü: Enise Hocam

**Kaynak türleri:** `▶ İlk videoyu aç` doğrudan incelenmiş video eşleşmesi, `☷ Kamp listesi` doğrulanmış eğitmen oynatma listesi, `⌕ Hocada konuyu ara` ise sadece eğitmen + konu odaklı **YouTube arama sonucu** demektir. Arama sonucunun belirli bir videoya götürdüğü iddia edilmez. Birden çok çalışma oturumu olan ana konularda ilk video bağlantısı yalnızca ilk oturumda önerilir. Oynatma listeleri ilgili başlıktaki tüm alt kazanımları otomatik olarak garanti etmez.

Kaynak verisi `resources.js` içerisinde, otomatik kapsam denetimi `tests/validate.mjs` dosyasındadır. Toplam **15 ders bölümü**, **17 doğrulanmış ilk video** ve **4 doğrulanmış kamp listesi** eklenmiştir. Diğer başlıklar için 233 ana konu başlığına özel eğitmen araması kullanılır.

## Kaynak notu

MEB'in **2026 YKS ortak ders kazanım ve açıklamaları** ve standart YKS hazırlık konu adları esas alınmıştır. 2027 YKS için nihai resmî kapsam değildir. Programda görünür başlıklar sadeleştirilmiştir; ayrıntılı alt kazanımlar için proje konuşmasında teslim edilmiş **TYT + AYT Ayrıntılı Konu Envanteri PDF** kullanılmalıdır.

Proje harici kaynak olarak Yaver'in **arayüz yaklaşımından** yararlanır; onun konu dağılımı, tamamlanan konuları veya kayıtları alınmamıştır.
