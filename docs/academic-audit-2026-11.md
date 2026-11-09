# Nurullah — Akademik Kalite Denetimi (9 Kasım 2026)

> **Durum:** Kaynak kodundaki mevcut ders ve oturum planının nicel denetimi. Gerçek öğrencinin ölçülmüş çalışma hızı değildir. Resmî 2027 ÖSYM kapsamı doğrulaması yerine geçmez.

## 1. Envanter ve dönemler

| Bölüm | Ana konu | Konu oturumu |
| --- | ---: | ---: |
| TYT | 148 | 197 |
| Sayısal AYT | 85 | 161 |
| **Toplam** | **233** | **358** |

- 1–25. gün: 147 TYT oturumu. AYT henüz başlamıyor.
- 26–45. gün: 50 TYT + 51 AYT oturumu; aynı dönemde iki sınavın yükü var.
- 46–75. gün: 110 AYT oturumu, TYT yeni konusu yok.
- 76–100. gün: 25 gün soru, deneme, yanlış analizi ve açık kapatma; yeni konu planlanmamış.
- İlk AYT konusu 26. gün, son TYT yeni konusu 43. gün, son AYT yeni konusu 75. gün.
- Kontrol edilen tüm derslerin oturumları **ders içindeki sıra düzenini koruyor**. Birbiri ardından gelen öğrenme oturumlarının günleri geriye gitmiyor.

## 2. Günlük iş yükü — bulgular

Yaklaşık günlük süre, `plan.js` içindeki konu tahmini süreleri ile paragraf, kitap okuma, problem, geometri testi, deneme ve haftalık kontrol varsayımlarının toplamından hesaplanmıştır. **Bu süreler öğrenci performansından ölçülmemiştir.**

| Gün aralığı | Ortalama tahmini toplam süre | Yorum |
| --- | ---: | --- |
| 1–25 | Yaklaşık 5,92 saat/gün | TYT yükü yoğun; süre değişkenliği öğrenciye bağlı |
| 26–45 | Yaklaşık 6,74 saat/gün | En riskli geçiş dönemi |
| 46–75 | Yaklaşık 6,38 saat/gün | AYT odaklı, konu başına süre artıyor |

En yüksek tahmini süre yaklaşık **7 saat 26 dakika** (35. gün). Mevcut varsayımlarda 7,5 saati aşan gün yok; buna karşın **26, 27, 28, 30, 33, 35, 36 ve 37. günler** 7 saatten uzun hesaplanıyor. Bu günlerde video hızının, ön bilgi düzeyinin ve pekiştirme ihtiyacının süreyi artırabileceği unutulmamalı.

## 3. Tek günde tekrarlanan çok bölümlü konular

Kod denetimi, aynı ana konunun iki oturumunun bazı günlerde bir araya geldiğini gösteriyor:

| Gün | Ders | Tek günde bulunan oturumlar |
| --- | --- | --- |
| 15 | TYT Matematik | Köklü Sayılar — 1/2 ve 2/2 |
| 21 | TYT Matematik | Problemler: Sayı ve Kesir — 1/2 ve 2/2 |
| 43 | AYT Matematik | Parabol — 1/3 ve 2/3 |
| 55 | AYT Matematik | Logaritma — 1/3 ve 2/3 |
| 61 | AYT Matematik | Limit — 1/3 ve 2/3 |

**Bu durum teknik bir eksik konu sorunu değildir:** Her oturum kayıtlı ve tekildir. Ancak sıfırdan öğrenen bir öğrenci için aynı gün iki ağır matematik oturumu, soru pekiştirmesiyle birlikte bilişsel yük oluşturabilir.

Herhangi bir konuyu sessizce silmeden, gerçek çalışma hızına göre bu oturumlardan bazılarını komşu günlere taşıyabiliriz. **Mevcut gün atamalarını bu denetimde değiştirmedik;** daha önce başlamış öğrencinin günlük programı beklenmedik biçimde değişmesin.

## 4. Kapsam açısından doğrulanmış / doğrulanmamış noktalar

**Kodla doğrulanmış:**
- 15 ders bölümü, 233 ana konu, 358 benzersiz konu oturumu
- Tüm konu oturumları 75. güne kadar planlanmış
- TYT, AYT kurs içi ilerleme sırası korunmuş
- 76–100 arası yeni konu eklenmemiş
- Günlük rutinler ve toplam 5 TYT + 5 AYT genel denemesi

**Henüz kanıtlanmamış:**
- 2027 için yayımlanacak nihai sınav kapsamıyla birebir uyum
- 2026 MEB kazanım belgesindeki **her alt kazanımın** mevcut ana konu adlarıyla bire bir eşleştirilip işlenmesi
- Nurullah'ın gerçek video seyri + soru çözümü sürelerinin günlük 7 saat hedefini karşılaması
- Konuların tamamlandığı işaretlendiğinde sınav düzeyinde kalıcı olarak öğrenilmiş olması
- 233 ana konunun her biri için doğrudan ve güncel video eşleşmesinin doğrulanması

## 5. Sonraki akademik kalite adımları

1. MEB 2026 kazanım PDF'indeki her alt kazanım için **ana konu kimliği → kazanım → doğrulama durumu** eşleştirme tablosu oluşturmak.
2. Matematikteki 5 çift oturumlu günü öğrencinin video/pekiştirme performansına göre yeniden dengelemek.
3. 26–45 arası 8 yoğun günü gerçek sürelerle izlemek; gerekirse yeni konu oturumlarını ileri almak, soru/deneme günlerini ona göre esnetmek.
4. Denemelerde ders bazlı net, yanlış sebebi ve tekrar ihtiyacını ayrıca izlemek.

## 6. Otomasyon ve koruma

- `node tests/validate.mjs`: 100 gün/233 konu/358 oturum, rutinler ve link veri yapısını denetler.
- `node tests/academic-audit.mjs`: öğrenme sıralaması, kurs bitiş aralığı, tahmini günlük yük ve aynı güne yığılan oturumları raporlar.
- `npm run test:e2e`: masaüstü ve mobil Chromium üzerinde gün seçimi, başlangıç tarihi, kilitler, notlar, JSON yedekleme, eğitmen tercihleri ve envanteri gerçek tarayıcıda test eder.
- GitHub Pages yayınlaması, bu kontroller geçtikten sonra statik uygulama dosyalarıyla gerçekleştirilir.

**Karar:** Mevcut planı koruyoruz; akademik kapsam doğrulamasını ve ağır gün dengelemesini ayrı, izlenebilir iyileştirme olarak sürdürüyoruz.
