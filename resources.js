/* Verified video references + separate lesson-search fallback. Never treat search links as checked videos. */
window.NURULLAH_LESSON_SOURCES = {
  "version": "2026-11-teacher-resources-v1",
  "description": "Ders bazlı eğitmen kaynakları. Doğrulanmış video ve oynatma listeleri ile öğretmen+konu YouTube araması ayrı türlerdir.",
  "courses": {
    "tyt-mat": {
      "defaults": "yasar",
      "options": [
        {
          "id": "yasar",
          "name": "Yaşar Hoca MathMan",
          "query": "Yaşar Hoca MathMan",
          "channel": "https://www.youtube.com/@yasarhocamathman"
        },
        {
          "id": "mert",
          "name": "Mert Hoca",
          "query": "Mert Hoca TYT Matematik"
        },
        {
          "id": "rehber",
          "name": "Rehber Matematik",
          "query": "Rehber Matematik TYT"
        }
      ]
    },
    "ayt-mat": {
      "defaults": "yasar",
      "options": [
        {
          "id": "yasar",
          "name": "Yaşar Hoca MathMan",
          "query": "Yaşar Hoca MathMan AYT Matematik",
          "channel": "https://www.youtube.com/@yasarhocamathman"
        },
        {
          "id": "mert",
          "name": "Mert Hoca",
          "query": "Mert Hoca AYT Matematik"
        },
        {
          "id": "eyup",
          "name": "Eyüp Boncuk",
          "query": "Eyüp Boncuk AYT Matematik"
        }
      ]
    },
    "tyt-geo": {
      "defaults": "kenan",
      "options": [
        {
          "id": "kenan",
          "name": "Kenan Kara ile Geometri",
          "query": "Kenan Kara ile Geometri 2027"
        },
        {
          "id": "burak",
          "name": "Burak Köse Geometri",
          "query": "Burak Köse Geometri"
        },
        {
          "id": "mert",
          "name": "Mert Hoca Geometri",
          "query": "Mert Hoca Geometri"
        }
      ]
    },
    "ayt-geo": {
      "defaults": "kenan",
      "options": [
        {
          "id": "kenan",
          "name": "Kenan Kara ile Geometri",
          "query": "Kenan Kara ile Geometri AYT 2027"
        },
        {
          "id": "burak",
          "name": "Burak Köse Geometri",
          "query": "Burak Köse Analitik Geometri"
        },
        {
          "id": "mert",
          "name": "Mert Hoca Geometri",
          "query": "Mert Hoca Geometri"
        }
      ]
    },
    "tyt-tur": {
      "defaults": "kadir",
      "options": [
        {
          "id": "kadir",
          "name": "Kadir Gümüş (Benim Hocam)",
          "query": "Kadir Gümüş TYT Türkçe"
        },
        {
          "id": "rustu",
          "name": "Rüştü Hoca ile Türkçe",
          "query": "Rüştü Hoca ile Türkçe"
        },
        {
          "id": "cansu",
          "name": "Cansu Bolat Türkçe",
          "query": "Cansu Bolat Türkçe TYT"
        }
      ]
    },
    "tyt-fiz": {
      "defaults": "vip",
      "options": [
        {
          "id": "vip",
          "name": "VIP Fizik",
          "query": "VIP Fizik TYT 2027",
          "playlist": "https://www.youtube.com/playlist?list=PL9mxuVBieFNHWQSftkoEu7cuEefE39qSB"
        },
        {
          "id": "ozcan",
          "name": "Özcan Aykın Fizik",
          "query": "Özcan Aykın TYT Fizik"
        },
        {
          "id": "ertan",
          "name": "Ertan Sinan Şahin",
          "query": "Ertan Sinan Şahin TYT Fizik"
        }
      ]
    },
    "ayt-fiz": {
      "defaults": "vip",
      "options": [
        {
          "id": "vip",
          "name": "VIP Fizik",
          "query": "VIP Fizik AYT 2027",
          "playlist": "https://www.youtube.com/playlist?list=PL9mxuVBieFNFwNyRWqgo9KIfdEZV0Otof"
        },
        {
          "id": "ozcan",
          "name": "Özcan Aykın Fizik",
          "query": "Özcan Aykın AYT Fizik"
        },
        {
          "id": "ertan",
          "name": "Ertan Sinan Şahin",
          "query": "Ertan Sinan Şahin AYT Fizik"
        }
      ]
    },
    "tyt-kim": {
      "defaults": "gorkem",
      "options": [
        {
          "id": "gorkem",
          "name": "Görkem Şahin (Benim Hocam)",
          "query": "Görkem Şahin TYT Kimya 2027",
          "playlist": "https://www.youtube.com/playlist?list=PL5kIOunpmSBNBWMQWLo0vjOZcNx5I_L7p"
        },
        {
          "id": "ada",
          "name": "Kimya Adası",
          "query": "Kimya Adası TYT"
        },
        {
          "id": "ferrum",
          "name": "Ferrum",
          "query": "Ferrum TYT Kimya"
        }
      ]
    },
    "ayt-kim": {
      "defaults": "gorkem",
      "options": [
        {
          "id": "gorkem",
          "name": "Görkem Şahin (Benim Hocam)",
          "query": "Görkem Şahin AYT Kimya 2027",
          "playlist": "https://www.youtube.com/playlist?list=PL5kIOunpmSBOaWNDVqqwfRoEyfl9Vp7RC"
        },
        {
          "id": "ada",
          "name": "Kimya Adası",
          "query": "Kimya Adası AYT"
        },
        {
          "id": "ferrum",
          "name": "Ferrum",
          "query": "Ferrum AYT Kimya"
        }
      ]
    },
    "tyt-biy": {
      "defaults": "zeliha",
      "options": [
        {
          "id": "zeliha",
          "name": "Zeliha Yücel (Benim Hocam)",
          "query": "Zeliha Yücel Benim Hocam TYT Biyoloji"
        },
        {
          "id": "drbio",
          "name": "Dr. Biyoloji",
          "query": "Dr. Biyoloji TYT"
        },
        {
          "id": "selin",
          "name": "Selin Hoca Biyoloji",
          "query": "Selin Hoca TYT Biyoloji"
        }
      ]
    },
    "ayt-biy": {
      "defaults": "zeliha",
      "options": [
        {
          "id": "zeliha",
          "name": "Zeliha Yücel (Benim Hocam)",
          "query": "Zeliha Yücel Benim Hocam AYT Biyoloji"
        },
        {
          "id": "drbio",
          "name": "Dr. Biyoloji",
          "query": "Dr. Biyoloji AYT 2027"
        },
        {
          "id": "selin",
          "name": "Selin Hoca Biyoloji",
          "query": "Selin Hoca AYT Biyoloji"
        }
      ]
    },
    "tyt-tar": {
      "defaults": "sadettin",
      "options": [
        {
          "id": "sadettin",
          "name": "Sadettin Akyayla (Benim Hocam)",
          "query": "Sadettin Akyayla TYT Tarih"
        },
        {
          "id": "atolye",
          "name": "Tarih Sosyal Atölyesi",
          "query": "Tarih Sosyal Atölyesi TYT"
        }
      ]
    },
    "tyt-cog": {
      "defaults": "bayram",
      "options": [
        {
          "id": "bayram",
          "name": "Bayram Meral (Benim Hocam)",
          "query": "Bayram Meral TYT Coğrafya"
        },
        {
          "id": "kodlar",
          "name": "Coğrafyanın Kodları",
          "query": "Coğrafyanın Kodları TYT"
        }
      ]
    },
    "tyt-fel": {
      "defaults": "can",
      "options": [
        {
          "id": "can",
          "name": "Can Köni (Benim Hocam)",
          "query": "Can Köni TYT Felsefe"
        },
        {
          "id": "felsefast",
          "name": "FelseFast",
          "query": "FelseFast TYT Felsefe"
        }
      ]
    },
    "tyt-din": {
      "defaults": "enise",
      "options": [
        {
          "id": "enise",
          "name": "Enise Hocam",
          "query": "Enise Hocam TYT Din Kültürü"
        },
        {
          "id": "benim",
          "name": "Benim Hocam Din Kültürü",
          "query": "Benim Hocam TYT Din Kültürü"
        }
      ]
    }
  },
  "verifiedFirstVideos": {
    "tyt-mat-01": {
      "url": "https://www.youtube.com/watch?v=oUzcDg8VKBs",
      "title": "Sayı Kümeleri — Yaşar Hoca MathMan (2027)",
      "instructor": "yasar"
    },
    "tyt-mat-02": {
      "url": "https://www.youtube.com/watch?v=t6ZA-wFuP0s",
      "title": "Sayı Basamakları — Yaşar Hoca MathMan (2027)",
      "instructor": "yasar"
    },
    "tyt-geo-01": {
      "url": "https://www.youtube.com/watch?v=LvbYFvig5qI",
      "title": "Temel Kavramlar — Kenan Kara (2027)",
      "instructor": "kenan"
    },
    "tyt-geo-02": {
      "url": "https://www.youtube.com/watch?v=e0QPTS2J660",
      "title": "Üçgende Açı — Kenan Kara (2027)",
      "instructor": "kenan"
    },
    "tyt-kim-01": {
      "url": "https://www.youtube.com/watch?v=2yNIHz64ATk",
      "title": "Simyadan Kimyaya — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "tyt-kim-03": {
      "url": "https://www.youtube.com/watch?v=fOxQ-grkGIQ",
      "title": "Kimyasal Türler Arası Etkileşimler — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "tyt-kim-04": {
      "url": "https://www.youtube.com/watch?v=FMDY3oLFHPQ",
      "title": "Maddenin Hâlleri — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "tyt-kim-06": {
      "url": "https://www.youtube.com/watch?v=WNhcJcaed_0",
      "title": "Kimyanın Temel Kanunları — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "tyt-kim-07": {
      "url": "https://www.youtube.com/watch?v=_ldRyM53r7U",
      "title": "Mol Kavramı 1 — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "tyt-kim-10": {
      "url": "https://www.youtube.com/watch?v=izH7mvYDRu4",
      "title": "Asitler ve Bazlar — Görkem Şahin (2026)",
      "instructor": "gorkem"
    },
    "ayt-kim-01": {
      "url": "https://www.youtube.com/watch?v=UFSUD8zm_P4",
      "title": "Atomun Kuantum Modeli 1 — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-02": {
      "url": "https://www.youtube.com/watch?v=hr_HjFHtJZc",
      "title": "Gazların Özellikleri — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-04": {
      "url": "https://www.youtube.com/watch?v=Nci6ydFSDNw",
      "title": "Kimyasal Tepkimelerde Enerji — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-05": {
      "url": "https://www.youtube.com/watch?v=ULEbfTi1Hn4",
      "title": "Tepkime Hızları — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-06": {
      "url": "https://www.youtube.com/watch?v=nLrV-62MCZ0",
      "title": "Kimyasal Denge — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-08": {
      "url": "https://www.youtube.com/watch?v=3wup50JJ5_o",
      "title": "Çözünürlük Dengesi — Görkem Şahin (2027)",
      "instructor": "gorkem"
    },
    "ayt-kim-10": {
      "url": "https://www.youtube.com/watch?v=Sxi_dmFEF2o",
      "title": "Karbon Kimyasına Giriş — Görkem Şahin (2027)",
      "instructor": "gorkem"
    }
  },
  "searchLabels": {
    "tyt-mat-01": "Sayı Kümeleri Temel Kavramlar",
    "tyt-mat-02": "Sayı Basamakları",
    "tyt-geo-01": "Temel Geometrik Kavramlar",
    "tyt-geo-02": "Üçgende Açılar",
    "ayt-mat-01": "Fonksiyonlar",
    "ayt-mat-07": "Trigonometri",
    "ayt-mat-08": "Trigonometri Özdeşlikler",
    "ayt-geo-02": "Çemberin Analitiği",
    "ayt-geo-06": "Geometrik Dönüşümler",
    "tyt-tur-20": "Metin Analizi ve Paragraf",
    "tyt-fiz-01": "Fizik Bilimine Giriş",
    "ayt-fiz-09": "Basit Makineler",
    "tyt-biy-01": "Canlıların Ortak Özellikleri",
    "ayt-biy-13": "Nükleik Asitler",
    "ayt-biy-14": "Protein Sentezi",
    "ayt-biy-24": "Bitkilerde Üreme"
  }
};
