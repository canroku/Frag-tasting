// Desteklenen diller + çeviri sözlüğü.
// Arayüz "chrome"u (gezinme, butonlar, başlıklar, boş durumlar, karşılama,
// giriş, ruh halleri, durumlar) 10 dilde. Parfüm verisi/notalar özel ad
// olduğundan çevrilmez.
export const DILLER = [
  { kod: "tr", ad: "Türkçe", bayrak: "🇹🇷" },
  { kod: "en", ad: "English", bayrak: "🇬🇧" },
  { kod: "de", ad: "Deutsch", bayrak: "🇩🇪" },
  { kod: "fr", ad: "Français", bayrak: "🇫🇷" },
  { kod: "es", ad: "Español", bayrak: "🇪🇸" },
  { kod: "it", ad: "Italiano", bayrak: "🇮🇹" },
  { kod: "ru", ad: "Русский", bayrak: "🇷🇺" },
  { kod: "ar", ad: "العربية", bayrak: "🇸🇦" },
  { kod: "pt", ad: "Português", bayrak: "🇵🇹" },
  { kod: "zh", ad: "中文", bayrak: "🇨🇳" },
] as const;

export type Dil = (typeof DILLER)[number]["kod"];
export const RTL_DILLER: Dil[] = ["ar"];

// Sıra: tr, en, de, fr, es, it, ru, ar, pt, zh
type Satir = [string, string, string, string, string, string, string, string, string, string];
const DIL_SIRA: Dil[] = ["tr", "en", "de", "fr", "es", "it", "ru", "ar", "pt", "zh"];

const S: Record<string, Satir> = {
  // Gezinme
  "nav.oneriler": ["Senin Seçkin", "Your Edit", "Deine Auswahl", "Ta Sélection", "Tu Selección", "La Tua Selezione", "Твоя подборка", "اختيارك", "Sua Seleção", "你的精选"],
  "nav.koleksiyonlar": ["Koleksiyonlar", "Collections", "Kollektionen", "Collections", "Colecciones", "Collezioni", "Коллекции", "المجموعات", "Coleções", "收藏"],
  "nav.notalar": ["Notalar", "Notes", "Noten", "Notes", "Notas", "Note", "Ноты", "النوتات", "Notas", "香调"],
  "nav.kesfet": ["Keşfet", "Explore", "Entdecken", "Explorer", "Explorar", "Esplora", "Обзор", "استكشف", "Explorar", "探索"],
  "nav.profil": ["Profil", "Profile", "Profil", "Profil", "Perfil", "Profilo", "Профиль", "الملف", "Perfil", "个人"],
  "nav.anaEkran": ["Ana ekran", "Home", "Startseite", "Accueil", "Inicio", "Home", "Главная", "الرئيسية", "Início", "首页"],

  // Karşılama
  "karsilama.ust": ["Kişisel Koku Danışmanın", "Your Personal Scent Advisor", "Dein persönlicher Duftberater", "Ton conseiller parfum personnel", "Tu asesor de fragancias personal", "Il tuo consulente di profumi", "Твой личный парфюмерный советник", "مستشار العطور الشخصي", "Seu consultor de fragrâncias", "你的私人香氛顾问"],
  "karsilama.satir1": ["Kendi", "Discover", "Entdecke", "Découvre", "Descubre", "Scopri", "Найди", "اكتشف", "Descubra", "发现"],
  "karsilama.satir2": ["Kokunu", "Your Own", "Deinen Eigenen", "Ton Propre", "Tu Propio", "Il Tuo", "Свой", "عطرك", "Seu Próprio", "专属于你的"],
  "karsilama.satir3": ["Keşfet", "Scent", "Duft", "Parfum", "Aroma", "Profumo", "Аромат", "الخاص", "Aroma", "香气"],
  "karsilama.alt": [
    "Yaşını, karakterini ve koku zevkini anlayan kişisel bir koku danışmanı. Kısa bir tadım anketi — sana en yakın 10–15 parfüm, nedenleriyle birlikte.",
    "A personal advisor that understands your age, character and scent taste. A short tasting survey — your closest 10–15 perfumes, with reasons.",
    "Ein persönlicher Berater, der dein Alter, deinen Charakter und deinen Duftgeschmack versteht. Ein kurzer Fragebogen — deine 10–15 besten Parfums, mit Begründung.",
    "Un conseiller personnel qui comprend ton âge, ton caractère et ton goût olfactif. Un court questionnaire — tes 10–15 parfums les plus proches, avec explications.",
    "Un asesor personal que entiende tu edad, carácter y gusto olfativo. Una breve encuesta — tus 10–15 perfumes más afines, con motivos.",
    "Un consulente che capisce la tua età, il carattere e il gusto olfattivo. Un breve sondaggio — i tuoi 10–15 profumi più affini, con le ragioni.",
    "Личный советник, понимающий твой возраст, характер и вкус. Короткий опрос — твои 10–15 ближайших ароматов с объяснениями.",
    "مستشار شخصي يفهم عمرك وشخصيتك وذوقك في العطور. استبيان قصير — أقرب 10–15 عطرًا لك، مع الأسباب.",
    "Um consultor pessoal que entende sua idade, caráter e gosto olfativo. Uma pesquisa curta — seus 10–15 perfumes mais próximos, com motivos.",
    "懂你年龄、性格与香氛品味的私人顾问。简短测试——为你精选最契合的 10–15 款香水，并附推荐理由。",
  ],
  "karsilama.baslaCta": ["Tadıma Başla", "Start Tasting", "Tasting starten", "Commencer", "Empezar", "Inizia", "Начать", "ابدأ", "Começar", "开始品鉴"],
  "karsilama.sure": ["≈ 2 dakika sürer · ücretsiz", "≈ 2 minutes · free", "≈ 2 Minuten · kostenlos", "≈ 2 minutes · gratuit", "≈ 2 minutos · gratis", "≈ 2 minuti · gratis", "≈ 2 минуты · бесплатно", "≈ دقيقتان · مجاني", "≈ 2 minutos · grátis", "≈ 2 分钟 · 免费"],

  // Ortak butonlar
  "btn.devam": ["Devam →", "Continue →", "Weiter →", "Continuer →", "Continuar →", "Continua →", "Далее →", "متابعة →", "Continuar →", "继续 →"],
  "btn.geri": ["← Geri", "← Back", "← Zurück", "← Retour", "← Atrás", "← Indietro", "← Назад", "← رجوع", "← Voltar", "← 返回"],
  "btn.atla": ["Atla", "Skip", "Überspringen", "Passer", "Saltar", "Salta", "Пропустить", "تخطي", "Pular", "跳过"],
  "btn.incele": ["İncele", "View", "Ansehen", "Voir", "Ver", "Vedi", "Смотреть", "عرض", "Ver", "查看"],
  "btn.favorile": ["🤍 Favorile", "🤍 Favorite", "🤍 Merken", "🤍 Favori", "🤍 Favorito", "🤍 Preferito", "🤍 В избранное", "🤍 المفضلة", "🤍 Favoritar", "🤍 收藏"],
  "btn.favoride": ["❤️ Favoride", "❤️ Favorited", "❤️ Gemerkt", "❤️ Favori", "❤️ En favoritos", "❤️ Preferito", "❤️ В избранном", "❤️ في المفضلة", "❤️ Favoritado", "❤️ 已收藏"],
  "btn.karsilastir": ["⚖️ Karşılaştır", "⚖️ Compare", "⚖️ Vergleichen", "⚖️ Comparer", "⚖️ Comparar", "⚖️ Confronta", "⚖️ Сравнить", "⚖️ قارن", "⚖️ Comparar", "⚖️ 对比"],
  "btn.dahaFazla": ["Daha fazla göster", "Show more", "Mehr anzeigen", "Voir plus", "Ver más", "Mostra altro", "Показать ещё", "عرض المزيد", "Ver mais", "显示更多"],
  "btn.anketiGuncelle": ["Anketi güncelle", "Update survey", "Umfrage aktualisieren", "Modifier le questionnaire", "Actualizar encuesta", "Aggiorna sondaggio", "Обновить опрос", "تحديث الاستبيان", "Atualizar pesquisa", "更新问卷"],

  // Öneriler ekranı
  "oneri.baslik": ["Senin Seçkin", "Your Edit", "Deine Auswahl", "Ta Sélection", "Tu Selección", "La Tua Selezione", "Твоя подборка", "اختيارك", "Sua Seleção", "你的精选"],
  "oneri.altSayi": ["parfüm · sana göre puanlandı", "perfumes · scored for you", "Parfums · für dich bewertet", "parfums · notés pour toi", "perfumes · puntuados para ti", "profumi · valutati per te", "ароматов · подобрано для тебя", "عطرًا · مُقيَّمة لك", "perfumes · pontuados para você", "款香水 · 为你评分"],
  "oneri.yeniSecki": ["⟳ Yeni seçki getir", "⟳ New edit", "⟳ Neue Auswahl", "⟳ Nouvelle sélection", "⟳ Nueva selección", "⟳ Nuova selezione", "⟳ Новая подборка", "⟳ اختيار جديد", "⟳ Nova seleção", "⟳ 换一批"],
  "oneri.duello": ["⚔️ Koku Düellosu", "⚔️ Scent Duel", "⚔️ Duft-Duell", "⚔️ Duel de parfums", "⚔️ Duelo de aromas", "⚔️ Duello olfattivo", "⚔️ Дуэль ароматов", "⚔️ مبارزة العطور", "⚔️ Duelo de aromas", "⚔️ 香氛对决"],
  "oneri.bugunNasilsin": ["Bugün nasılsın?", "How do you feel today?", "Wie fühlst du dich heute?", "Comment te sens-tu ?", "¿Cómo te sientes hoy?", "Come ti senti oggi?", "Как настроение?", "كيف تشعر اليوم؟", "Como você está hoje?", "今天心情如何？"],
  "oneri.gununKokusu": ["✦ Günün Kokusu", "✦ Scent of the Day", "✦ Duft des Tages", "✦ Parfum du jour", "✦ Aroma del día", "✦ Profumo del giorno", "✦ Аромат дня", "✦ عطر اليوم", "✦ Perfume do dia", "✦ 今日之香"],
  "oneri.bugunDene": ["Bugün bunu dene", "Try this today", "Heute testen", "Essaie-le aujourd'hui", "Prueba esto hoy", "Prova questo oggi", "Попробуй сегодня", "جربه اليوم", "Experimente hoje", "今天试试它"],

  // Ruh halleri
  "ruh.romantik": ["Romantik", "Romantic", "Romantisch", "Romantique", "Romántico", "Romantico", "Романтичное", "رومانسي", "Romântico", "浪漫"],
  "ruh.enerjik": ["Enerjik", "Energetic", "Energiegeladen", "Énergique", "Enérgico", "Energico", "Энергичное", "نشيط", "Energético", "活力"],
  "ruh.gizemli": ["Gizemli", "Mysterious", "Geheimnisvoll", "Mystérieux", "Misterioso", "Misterioso", "Загадочное", "غامض", "Misterioso", "神秘"],
  "ruh.huzurlu": ["Huzurlu", "Calm", "Ruhig", "Serein", "Sereno", "Sereno", "Спокойное", "هادئ", "Tranquilo", "宁静"],
  "ruh.iddiali": ["İddialı", "Bold", "Kühn", "Audacieux", "Atrevido", "Audace", "Дерзкое", "جريء", "Ousado", "大胆"],
  "ruh.tatli": ["Tatlı", "Sweet", "Süß", "Sucré", "Dulce", "Dolce", "Сладкое", "حلو", "Doce", "甜美"],

  // Koku Günlüğü
  "sotd.baslik": ["📖 Koku Günlüğü", "📖 Scent Diary", "📖 Dufttagebuch", "📖 Journal olfactif", "📖 Diario de aromas", "📖 Diario olfattivo", "📖 Дневник ароматов", "📖 مذكرات العطور", "📖 Diário de aromas", "📖 香氛日记"],
  "sotd.soru": ["Bugün hangi kokuyu süründün? Günlüğüne ekle — profilin öğrenir, serin büyür.", "Which scent did you wear today? Add it — your profile learns, your streak grows.", "Welchen Duft trägst du heute? Trag ihn ein — dein Profil lernt, deine Serie wächst.", "Quel parfum portes-tu aujourd'hui ? Ajoute-le — ton profil apprend, ta série grandit.", "¿Qué aroma llevas hoy? Añádelo — tu perfil aprende, tu racha crece.", "Che profumo indossi oggi? Aggiungilo — il profilo impara, la serie cresce.", "Какой аромат сегодня? Добавь — профиль учится, серия растёт.", "أي عطر ارتديت اليوم؟ أضِفه — يتعلّم ملفك وتكبر سلسلتك.", "Qual aroma você usou hoje? Adicione — seu perfil aprende, sua sequência cresce.", "今天用了哪款香？记录一下——档案会学习，连续天数增长。"],
  "sotd.kaydet": ["+ Bugünü kaydet", "+ Log today", "+ Heute eintragen", "+ Enregistrer", "+ Registrar hoy", "+ Registra oggi", "+ Отметить день", "+ سجّل اليوم", "+ Registrar hoje", "+ 记录今天"],
  "sotd.bugunku": ["Bugün süründüğün:", "Today you wore:", "Heute getragen:", "Aujourd'hui :", "Hoy llevaste:", "Oggi indossi:", "Сегодня:", "اليوم ارتديت:", "Hoje você usou:", "今天所用："],
  "sotd.degistir": ["Değiştir", "Change", "Ändern", "Changer", "Cambiar", "Cambia", "Изменить", "تغيير", "Trocar", "更换"],
  "sotd.kaldir": ["Kaldır", "Remove", "Entfernen", "Retirer", "Quitar", "Rimuovi", "Убрать", "إزالة", "Remover", "移除"],

  // Anlık Öneri
  "anlik.baslik": ["Bugün ne var?", "What's on today?", "Was steht heute an?", "Quoi de prévu ?", "¿Qué hay hoy?", "Cosa c'è oggi?", "Какие планы?", "ما خططك اليوم؟", "O que tem hoje?", "今天有什么安排？"],
  "anlik.girisAlt": ["Randevu, iş, gece… ana göre hızlı koku + kombin önerisi", "Date, work, night out… quick scent + outfit for the moment", "Date, Arbeit, Ausgehen… schneller Duft + Outfit", "Rendez-vous, travail, soirée… parfum + tenue express", "Cita, trabajo, noche… aroma + outfit al momento", "Appuntamento, lavoro, sera… profumo + outfit al volo", "Свидание, работа, вечер… аромат + образ", "موعد، عمل، سهرة… عطر + إطلالة سريعة", "Encontro, trabalho, noite… aroma + look na hora", "约会、工作、夜晚……即刻香氛 + 穿搭"],
  "anlik.durumSec": ["Durumu seç — o ana en uygun kokulara saniyeler içinde ulaş.", "Pick the moment — reach the best scents in seconds.", "Wähle den Anlass — die besten Düfte in Sekunden.", "Choisis l'occasion — les meilleurs parfums en quelques secondes.", "Elige la ocasión — los mejores aromas en segundos.", "Scegli l'occasione — i migliori profumi in pochi secondi.", "Выбери повод — лучшие ароматы за секунды.", "اختر المناسبة — أفضل العطور في ثوانٍ.", "Escolha o momento — os melhores aromas em segundos.", "选择场合——几秒钟找到最合适的香气。"],
  "anlik.buAn": ["Bu an için seçkin", "Your edit for this moment", "Deine Auswahl", "Ta sélection", "Tu selección", "La tua selezione", "Твоя подборка", "اختيارك لهذه اللحظة", "Sua seleção", "此刻精选"],
  "anlik.kombinOner": ["👔 Kombin öner", "👔 Outfit idea", "👔 Outfit-Idee", "👔 Idée tenue", "👔 Idea de outfit", "👔 Idea outfit", "👔 Идея образа", "👔 اقتراح إطلالة", "👔 Ideia de look", "👔 穿搭建议"],
  "anlik.kombinBaslik": ["👗 Kombin Önerisi", "👗 Outfit Suggestion", "👗 Outfit-Vorschlag", "👗 Suggestion de tenue", "👗 Sugerencia de outfit", "👗 Suggerimento outfit", "👗 Образ", "👗 اقتراح الإطلالة", "👗 Sugestão de look", "👗 穿搭建议"],
  "anlik.renkDoku": ["🎨 Renk & doku", "🎨 Color & texture", "🎨 Farbe & Textur", "🎨 Couleur & texture", "🎨 Color y textura", "🎨 Colore & texture", "🎨 Цвет и текстура", "🎨 اللون والملمس", "🎨 Cor e textura", "🎨 色彩与质感"],
  "anlik.tumDetay": ["Parfümün tüm detayı →", "Full perfume details →", "Alle Details →", "Tous les détails →", "Todos los detalles →", "Tutti i dettagli →", "Все детали →", "كل التفاصيل →", "Todos os detalhes →", "查看完整详情 →"],

  // Durumlar
  "okazyon.randevu": ["Randevu", "Date", "Date", "Rendez-vous", "Cita", "Appuntamento", "Свидание", "موعد", "Encontro", "约会"],
  "okazyon.is": ["İş / Toplantı", "Work / Meeting", "Arbeit / Meeting", "Travail / Réunion", "Trabajo / Reunión", "Lavoro / Riunione", "Работа / Встреча", "عمل / اجتماع", "Trabalho / Reunião", "工作 / 会议"],
  "okazyon.gece": ["Gece Çıkışı", "Night Out", "Ausgehen", "Sortie du soir", "Salida nocturna", "Serata fuori", "Вечеринка", "سهرة", "Balada", "夜出"],
  "okazyon.gunluk": ["Günlük", "Everyday", "Alltag", "Quotidien", "Diario", "Quotidiano", "Повседневное", "يومي", "Dia a dia", "日常"],
  "okazyon.spor": ["Spor", "Sport", "Sport", "Sport", "Deporte", "Sport", "Спорт", "رياضة", "Esporte", "运动"],
  "okazyon.davet": ["Özel Davet", "Special Event", "Besonderer Anlass", "Événement", "Evento especial", "Evento speciale", "Особое событие", "مناسبة خاصة", "Evento especial", "特别场合"],

  // Cinsiyet
  "cins.kadin": ["Kadın", "Women", "Damen", "Femme", "Mujer", "Donna", "Женское", "نسائي", "Feminino", "女士"],
  "cins.erkek": ["Erkek", "Men", "Herren", "Homme", "Hombre", "Uomo", "Мужское", "رجالي", "Masculino", "男士"],
  "cins.hepsi": ["Hepsi", "All", "Alle", "Tous", "Todos", "Tutti", "Все", "الكل", "Todos", "全部"],

  // Keşfet
  "kesfet.baslik": ["Keşfet", "Explore", "Entdecken", "Explorer", "Explorar", "Esplora", "Обзор", "استكشف", "Explorar", "探索"],
  "kesfet.sonuc": ["sonuç", "results", "Ergebnisse", "résultats", "resultados", "risultati", "результатов", "نتيجة", "resultados", "个结果"],
  "kesfet.araPlaceholder": ["Parfüm, marka veya nota ara…", "Search perfume, brand or note…", "Parfum, Marke oder Note suchen…", "Rechercher parfum, marque ou note…", "Busca perfume, marca o nota…", "Cerca profumo, marca o nota…", "Поиск аромата, бренда, ноты…", "ابحث عن عطر أو ماركة أو نوتة…", "Buscar perfume, marca ou nota…", "搜索香水、品牌或香调……"],
  "kesfet.sasirt": ["🎲 Şaşırt Beni", "🎲 Surprise Me", "🎲 Überrasch mich", "🎲 Surprends-moi", "🎲 Sorpréndeme", "🎲 Sorprendimi", "🎲 Удиви меня", "🎲 فاجئني", "🎲 Surpreenda-me", "🎲 随便来一个"],
  "kesfet.yukleniyor": ["· tam katalog yükleniyor…", "· loading full catalog…", "· Katalog wird geladen…", "· chargement du catalogue…", "· cargando catálogo…", "· caricamento catalogo…", "· загрузка каталога…", "· جارٍ تحميل الكتالوج…", "· carregando catálogo…", "· 正在加载完整目录……"],
  "filtre.temizle": ["Temizle ✕", "Clear ✕", "Löschen ✕", "Effacer ✕", "Limpiar ✕", "Cancella ✕", "Сброс ✕", "مسح ✕", "Limpar ✕", "清除 ✕"],

  // Notalar
  "notalar.baslik": ["Notalar", "Notes", "Noten", "Notes", "Notas", "Note", "Ноты", "النوتات", "Notas", "香调"],
  "notalar.alt": ["Bir notayı merak ediyorsan üstüne dokun — o notayı taşıyan en sevilen parfümleri gör.", "Curious about a note? Tap it — see the most loved perfumes featuring it.", "Neugierig auf eine Note? Tippe sie an — die beliebtesten Parfums damit.", "Curieux d'une note ? Touche-la — les parfums préférés qui la contiennent.", "¿Te intriga una nota? Tócala — los perfumes favoritos que la llevan.", "Curioso di una nota? Toccala — i profumi più amati che la contengono.", "Интересна нота? Нажми — любимые ароматы с ней.", "فضولي حول نوتة؟ المسها — أكثر العطور المحبوبة التي تحتويها.", "Curioso sobre uma nota? Toque — os perfumes mais amados com ela.", "对某个香调好奇？点一下——看看含它的热门香水。"],
  "notalar.notaAra": ["Nota ara… (gül, vanilya, oud)", "Search note… (rose, vanilla, oud)", "Note suchen… (Rose, Vanille, Oud)", "Rechercher une note…", "Buscar nota…", "Cerca nota…", "Поиск ноты…", "ابحث عن نوتة…", "Buscar nota…", "搜索香调……"],

  // Profil selamlama
  "selam.gunaydin": ["Günaydın", "Good morning", "Guten Morgen", "Bonjour", "Buenos días", "Buongiorno", "Доброе утро", "صباح الخير", "Bom dia", "早上好"],
  "selam.iyiGunler": ["İyi günler", "Good afternoon", "Guten Tag", "Bon après-midi", "Buenas tardes", "Buon pomeriggio", "Добрый день", "طاب يومك", "Boa tarde", "下午好"],
  "selam.iyiAksamlar": ["İyi akşamlar", "Good evening", "Guten Abend", "Bonsoir", "Buenas noches", "Buonasera", "Добрый вечер", "مساء الخير", "Boa noite", "晚上好"],
  "selam.iyiGeceler": ["İyi geceler", "Good night", "Gute Nacht", "Bonne nuit", "Buenas noches", "Buonanotte", "Доброй ночи", "تصبح على خير", "Boa noite", "晚安"],

  // Auth
  "auth.hesapOlustur": ["Hesap Oluştur", "Sign Up", "Registrieren", "Créer un compte", "Crear cuenta", "Registrati", "Регистрация", "إنشاء حساب", "Criar conta", "注册"],
  "auth.giris": ["Giriş", "Log In", "Anmelden", "Connexion", "Iniciar sesión", "Accedi", "Вход", "تسجيل الدخول", "Entrar", "登录"],
  "auth.adin": ["Adın", "Your name", "Dein Name", "Ton nom", "Tu nombre", "Il tuo nome", "Имя", "اسمك", "Seu nome", "你的名字"],
  "auth.eposta": ["E-posta", "Email", "E-Mail", "E-mail", "Correo", "Email", "Эл. почта", "البريد", "E-mail", "邮箱"],
  "auth.sifre": ["Şifre", "Password", "Passwort", "Mot de passe", "Contraseña", "Password", "Пароль", "كلمة المرور", "Senha", "密码"],
  "auth.kayitBtn": ["Kayıt Ol ve Başla", "Sign Up & Start", "Registrieren & Los", "S'inscrire et commencer", "Regístrate y empieza", "Registrati e inizia", "Зарегистрироваться", "سجّل وابدأ", "Cadastrar e começar", "注册并开始"],
  "auth.girisBtn": ["Giriş Yap", "Log In", "Anmelden", "Se connecter", "Iniciar sesión", "Accedi", "Войти", "دخول", "Entrar", "登录"],

  // Boş durumlar / genel
  "genel.dil": ["Dil", "Language", "Sprache", "Langue", "Idioma", "Lingua", "Язык", "اللغة", "Idioma", "语言"],
  "genel.oy": ["oy", "votes", "Stimmen", "avis", "votos", "voti", "оценок", "تقييم", "votos", "评价"],
};

export function ceviriBul(anahtar: string, dil: Dil): string {
  const satir = S[anahtar];
  if (!satir) return anahtar;
  const idx = DIL_SIRA.indexOf(dil);
  const deger = satir[idx];
  // Boş string bilinçli olabilir (ör. dil bazlı kelime sırası); yalnızca
  // tanımsızsa Türkçeye düş.
  return deger !== undefined ? deger : satir[0];
}

export function tarayiciDili(): Dil {
  if (typeof navigator === "undefined") return "tr";
  const diller = [navigator.language, ...(navigator.languages ?? [])];
  for (const d of diller) {
    const kok = d.slice(0, 2).toLowerCase() as Dil;
    if (DILLER.some((x) => x.kod === kok)) return kok;
  }
  return "en"; // tanınmayan dil → İngilizce
}
