const SB_URL="https://zpgxxqzgqeogupzltrqp.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ3h4cXpncWVvZ3Vwemx0cnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzkxNTUsImV4cCI6MjA1NzExNTE1NX0.qEHBDKb4JKuAHGjqGMBnMBqUolr7VhPkHHBLdM8Trac";
const PRAYERS=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
const PICONS={Fajr:"🌅",Dhuhr:"☀️",Asr:"🌤️",Maghrib:"🌆",Isha:"🌙"};
const SALAWAT_TARGET=12000;

const OUMRA_STEPS=[
  {id:"bagages",icon:"🎒",titre:"Bagages"},
  {id:"interdits",icon:"🚫",titre:"Interdits"},
  {id:"sante",icon:"💊",titre:"Santé"},
  {id:"ihram",icon:"🤍",titre:"Ihram"},
  {id:"voyage",icon:"✈️",titre:"Voyage"},
  {id:"intention",icon:"🤲",titre:"Intention"},
  {id:"talbiya",icon:"📣",titre:"Talbiya"},
  {id:"makkah",icon:"🕌",titre:"Makkah"},
  {id:"haram",icon:"🕋",titre:"Al-Haram"},
  {id:"tawaf",icon:"🌀",titre:"Tawaf"},
  {id:"rakah",icon:"🙏",titre:"2 Rak'ah"},
  {id:"zamzam",icon:"💧",titre:"Zamzam"},
  {id:"safa",icon:"⛰️",titre:"Sa'i"},
  {id:"fin",icon:"✅",titre:"Fin Oumra"},
  {id:"rawda",icon:"🌿",titre:"Rawda"},
];

const OUMRA_DATA={
  bagages:{
    titre:"🎒 Liste des Bagages",
    couleur:"linear-gradient(135deg,#1A237E,#283593)",
    intro:"Préparez vos bagages au moins 1 semaine avant le départ.",
    invocations:[
      {titre:"👘 Ihram & Vêtements",ar:"",translit:"",fr:"· 2 pièces Ihram (Izar + Rida)\n· Ceinture\n· Vêtements légers\n· Sandales ouvertes",note:"Les hommes: uniquement 2 pièces blanches non cousues en état d'Ihram"},
      {titre:"💊 Santé & Hygiène",ar:"",translit:"",fr:"· Médicaments personnels\n· Paracétamol, Ibuprofène\n· Crème solaire SPF 50+\n· Masque anti-poussière",note:"Emportez votre stock pour toute la durée + 3 jours de réserve"},
      {titre:"📿 Spirituel",ar:"",translit:"",fr:"· Coran de poche\n· Ce guide Kyswa Travel\n· Chapelet (Tasbih)\n· Carnet de du'a personnels",note:""},
      {titre:"📋 Documents obligatoires",ar:"",translit:"",fr:"· Passeport (valide 6 mois minimum)\n· Visa Oumra\n· Billets avion imprimés\n· Numéro urgence Kyswa : +221 78 781 16 16",note:"⚠️ Sans visa Oumra valide, l'accès à La Mecque est interdit"},
    ]
  },
  interdits:{
    titre:"🚫 Interdits de l'Ihram",
    couleur:"linear-gradient(135deg,#B71C1C,#C62828)",
    intro:"Dès que vous prononcez l'intention d'Ihram au Miqat, vous entrez dans un état sacré.",
    invocations:[
      {titre:"🧔 INTERDITS POUR LES HOMMES",ar:"",translit:"",fr:"🧵 Vêtements cousus\n🧢 Couvrir la tête\n✂️ Se couper cheveux ou ongles\n🌹 Parfum\n💏 Relations conjugales",note:"'Pas de rapport conjugal, pas de perversité, pas de dispute.' — Al-Baqara 2:197"},
      {titre:"🧕 INTERDITS POUR LES FEMMES",ar:"",translit:"",fr:"✂️ Se couper cheveux ou ongles\n🌹 Parfum\n💏 Relations conjugales",note:"La femme garde ses vêtements normaux"},
      {titre:"✅ CE QUI EST PERMIS",ar:"",translit:"",fr:"✅ Porter des lunettes de soleil\n✅ Ceinture\n✅ Se laver sans parfum\n✅ Porter montre ou sac",note:"En cas de doute, abstenez-vous"},
    ]
  },
  sante:{
    titre:"💊 Conseils Santé",
    couleur:"linear-gradient(135deg,#00695C,#00897B)",
    intro:"La Mecque peut atteindre 45°C en été. Une bonne préparation physique est indispensable.",
    invocations:[
      {titre:"☀️ Coup de chaleur",ar:"",translit:"",fr:"· Boire minimum 3L d'eau par jour\n· Éviter le soleil entre 11h et 15h\n· Parapluie anti-UV obligatoire",note:"Le coup de chaleur peut être fatal — Buvez même sans soif"},
      {titre:"👟 Ampoules aux pieds",ar:"",translit:"",fr:"· Porter vos sandales AVANT le voyage plusieurs semaines\n· Emporter pansements hydrocolloïdes",note:"Tawaf + Sa'i = environ 5 à 7 km de marche"},
      {titre:"🏥 Urgences",ar:"",translit:"",fr:"· Hôpitaux autour du Haram gratuits pour pèlerins\n· Urgence Kyswa Travel : +221 78 781 16 16",note:""},
    ]
  },
  ihram:{
    titre:"🤍 Ihram & Préparation",
    couleur:"linear-gradient(135deg,#005C40,#00815A)",
    intro:"L'Ihram est l'état de sacralisation. Faites le Ghusl, parfumez-vous le corps, revêtez les deux pièces blanches.",
    invocations:[
      {titre:"Niyyah — Intention de l'Ihram",ar:"نَوَيْتُ الإِحْرَامَ بِعُمْرَةٍ لِلَّهِ تَعَالَى",translit:"Nawaytu al-ihrâma bi-'Umratin lillâhi ta'âlâ",fr:"J'ai l'intention de revêtir l'Ihram pour accomplir la Omra pour Allah le Très-Haut",note:"À réciter au moment de revêtir les deux pièces blanches"},
      {titre:"Du'a de départ",ar:"اللَّهُمَّ بِكَ أَصُولُ وَبِكَ أَجُولُ وَبِكَ أَسِيرُ",translit:"Allâhumma bika asûlu wa bika ajûlu wa bika asîru",fr:"Ô Allah, c'est grâce à Toi que j'agis, que je me déplace et que je chemine",note:""},
    ]
  },
  voyage:{
    titre:"✈️ Invocations de Voyage",
    couleur:"linear-gradient(135deg,#0D47A1,#1565C0)",
    intro:"En montant dans le véhicule ou l'avion, récitez ces invocations.",
    invocations:[
      {titre:"Du'a en montant dans le véhicule",ar:"بِسْمِ اللهِ، اَللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى",translit:"Bismillâh, Allâhumma innâ nas'aluka fî safarinâ hâdhâ al-birra wat-taqwâ",fr:"Au nom d'Allah. Ô Allah, nous Te demandons dans ce voyage la piété et la crainte de Toi",note:"Hadith authentique — Rapporté par Muslim"},
      {titre:"Du'a pendant le vol",ar:"سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",translit:"Subhâna-lladhi sakhkhara lanâ hâdhâ wa mâ kunnâ lahu muqrinîn",fr:"Gloire à Celui qui nous a assujetti ceci alors que nous n'en étions pas capables",note:"Sourate Az-Zukhruf 43:13"},
    ]
  },
  intention:{
    titre:"🤲 Intention au Miqat",
    couleur:"linear-gradient(135deg,#4A148C,#6A1B9A)",
    intro:"Le Miqat est le lieu où vous prononcez l'intention. Pour les pèlerins venant par avion, c'est souvent au-dessus du Miqat.",
    invocations:[
      {titre:"Talbiya — À réciter à partir du Miqat",ar:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",translit:"Labbayka Allâhumma labbayk, labbayka lâ sharîka laka labbayk, inna al-hamda wan-ni'mata laka wal-mulk, lâ sharîka lak",fr:"Me voici ô Allah, me voici ! Me voici, Tu n'as pas d'associé, me voici ! Louange et bienfait T'appartiennent, ainsi que la royauté. Tu n'as pas d'associé.",note:"À répéter continuellement à voix haute pour les hommes, à voix basse pour les femmes"},
    ]
  },
  talbiya:{
    titre:"📣 La Talbiya",
    couleur:"linear-gradient(135deg,#1B5E20,#2E7D32)",
    intro:"La Talbiya doit être récitée depuis le Miqat jusqu'au début du Tawaf. Les hommes la disent à voix haute.",
    invocations:[
      {titre:"Talbiya complète",ar:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ",translit:"Labbayka Allâhumma labbayk...",fr:"Me voici ô Allah, me voici ! Me voici, Tu n'as pas d'associé, me voici !",note:"Les hommes élèvent la voix. Les femmes la disent doucement."},
      {titre:"Du'a en voyant la Kaaba",ar:"اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفاً وَتَعْظِيماً وَتَكْرِيماً وَمَهَابَةً",translit:"Allâhumma zid hâdha al-bayta tashrîfan wa ta'zîman wa takrîman wa mahâbah",fr:"Ô Allah, augmente l'honneur, la grandeur, le respect et la majesté de cette Maison",note:"À réciter en voyant la Kaaba pour la première fois"},
    ]
  },
  makkah:{
    titre:"🕌 Entrée à Makkah",
    couleur:"linear-gradient(135deg,#3D1A00,#6D3400)",
    intro:"En entrant à Makkah, récitez cette invocation. Entrez de préférence par la porte de Bani Shayba.",
    invocations:[
      {titre:"Du'a d'entrée à Makkah",ar:"اللَّهُمَّ هَذَا حَرَمُكَ وَأَمْنُكَ فَحَرِّمْنِي عَلَى النَّارِ",translit:"Allâhumma hâdhâ haramuka wa amnuka fa-harrimnî 'ala an-nâr",fr:"Ô Allah, ceci est Ton sanctuaire et Ta sécurité, préserve-moi du Feu",note:""},
    ]
  },
  haram:{
    titre:"🕋 Entrée au Masjid Al-Haram",
    couleur:"linear-gradient(135deg,#4E342E,#6D4C41)",
    intro:"Entrez par le pied droit en récitant la Bismillah et la prière sur le Prophète ﷺ.",
    invocations:[
      {titre:"Du'a d'entrée à la mosquée",ar:"بِسْمِ اللهِ وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللهِ، اَللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",translit:"Bismillâh was-salâtu was-salâmu 'alâ rasûlillâh, Allâhumma iftah lî abwâba rahmatik",fr:"Au nom d'Allah, que la paix et la bénédiction soient sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde",note:"À réciter en entrant dans la mosquée"},
    ]
  },
  tawaf:{
    titre:"🌀 Le Tawaf",
    couleur:"linear-gradient(135deg,#006064,#00838F)",
    intro:"Le Tawaf consiste à tourner 7 fois autour de la Kaaba dans le sens inverse des aiguilles d'une montre, en commençant par la Pierre Noire.",
    invocations:[
      {titre:"Niyyah du Tawaf",ar:"اَللَّهُمَّ إِنِّي أُرِيدُ الطَّوَافَ بِبَيْتِكَ الْحَرَامِ",translit:"Allâhumma innî urîdu at-tawâfa bi-baytika al-harâm",fr:"Ô Allah, je veux effectuer le Tawaf autour de Ta Maison Sacrée",note:""},
      {titre:"Au niveau de la Pierre Noire",ar:"بِسْمِ اللهِ وَاللهُ أَكْبَرُ",translit:"Bismillâh, Allâhu Akbar",fr:"Au nom d'Allah, Allah est le Plus Grand",note:"Pointer la main droite vers la Pierre Noire en disant Allâhu Akbar"},
      {titre:"Entre les deux piliers yéménites",ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",translit:"Rabbanâ âtinâ fid-dunyâ hasanatan wa fil-âkhirati hasanatan wa qinâ 'adhâba an-nâr",fr:"Seigneur, accorde-nous le bien ici-bas et le bien dans l'au-delà, et préserve-nous du châtiment du Feu",note:"À réciter entre le pilier yéménite et la Pierre Noire"},
    ]
  },
  rakah:{
    titre:"🙏 Prière de 2 Rak'ah",
    couleur:"linear-gradient(135deg,#1A237E,#283593)",
    intro:"Après le Tawaf, priez 2 Rak'ah derrière le Maqam Ibrahim si possible, sinon n'importe où dans la mosquée.",
    invocations:[
      {titre:"Intention des 2 Rak'ah du Tawaf",ar:"اُصَلِّي رَكْعَتَيْنِ لِلَّهِ تَعَالَى",translit:"Usallî rak'atayn lillâhi ta'âlâ",fr:"Je prie 2 Rak'ah pour Allah le Très-Haut",note:"Réciter Al-Fatiha + Al-Kafirun (1ère Rak'ah), Al-Fatiha + Al-Ikhlas (2ème)"},
      {titre:"Du'a après les 2 Rak'ah",ar:"اَللَّهُمَّ تَقَبَّلْ مِنِّي وَيَسِّرْ لِي أَمْرِي",translit:"Allâhumma taqabbal minnî wa yassir lî amrî",fr:"Ô Allah, accepte de moi et facilite-moi mon affaire",note:""},
    ]
  },
  zamzam:{
    titre:"💧 Eau de Zamzam",
    couleur:"linear-gradient(135deg,#006064,#004D51)",
    intro:"Buvez l'eau de Zamzam en faisant face à la Kaaba, debout, en 3 respirations.",
    invocations:[
      {titre:"Du'a en buvant Zamzam",ar:"اَللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً وَرِزْقاً وَاسِعاً وَشِفَاءً مِنْ كُلِّ دَاءٍ",translit:"Allâhumma innî as'aluka 'ilman nâfi'an wa rizqan wâsi'an wa shifâ'an min kulli dâ'",fr:"Ô Allah, je Te demande une science utile, une subsistance abondante et une guérison de toute maladie",note:"Boire debout, en faisant face à la Kaaba, en 3 fois"},
    ]
  },
  safa:{
    titre:"⛰️ Le Sa'i — Safa et Marwa",
    couleur:"linear-gradient(135deg,#7B1FA2,#8E24AA)",
    intro:"Le Sa'i consiste à marcher 7 fois entre les collines de Safa et Marwa (4 vers Marwa, 3 retours).",
    invocations:[
      {titre:"Du'a en montant sur As-Safa",ar:"إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللهِ، أَبْدَأُ بِمَا بَدَأَ اللهُ بِهِ",translit:"Inna as-safâ wal-marwata min sha'â'irillâh, abd'au bimâ bada'a Allâhu bih",fr:"Assurément, Safa et Marwa font partie des symboles d'Allah. Je commence par ce qu'Allah a commencé.",note:"À réciter en montant sur As-Safa pour la première fois — Sourate Al-Baqara 2:158"},
      {titre:"Dhikr sur As-Safa et Al-Marwa",ar:"اَللهُ أَكْبَرُ، اَللهُ أَكْبَرُ، اَللهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ",translit:"Allâhu Akbar, Allâhu Akbar, Allâhu Akbar, wa lillâhi al-hamd",fr:"Allah est le Plus Grand (3 fois), et louange à Allah",note:"Faire face à la Kaaba et lever les mains en suppliant"},
    ]
  },
  fin:{
    titre:"✅ Fin de l'Oumra",
    couleur:"linear-gradient(135deg,#1B5E20,#2E7D32)",
    intro:"Après le Sa'i, l'Oumra est terminée. Les hommes se rasent la tête (Halq) ou raccourcissent les cheveux (Taqsir). Les femmes coupent seulement une mèche.",
    invocations:[
      {titre:"Du'a après la fin de l'Oumra",ar:"اَللَّهُمَّ تَقَبَّلْ مِنِّي عُمْرَتِي",translit:"Allâhumma taqabbal minnî 'Umratî",fr:"Ô Allah, accepte mon Oumra",note:"Mabrouk ! Votre Oumra est accomplie — que Allah l'accepte"},
    ]
  },
  rawda:{
    titre:"🌿 Rawda — Médine",
    couleur:"linear-gradient(135deg,#1A237E,#1565C0)",
    intro:"La Rawda est le jardin entre la tombe du Prophète ﷺ et son Minbar. C'est l'un des jardins du Paradis (Hadith).",
    invocations:[
      {titre:"Du'a en entrant à la mosquée du Prophète",ar:"اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",translit:"Allâhumma salli 'alâ Muhammad wa iftah lî abwâba rahmatik",fr:"Ô Allah, bénis Muhammad et ouvre-moi les portes de Ta miséricorde",note:""},
      {titre:"Salutation au Prophète ﷺ",ar:"اَلسَّلاَمُ عَلَيْكَ يَا رَسُولَ اللهِ، اَلسَّلاَمُ عَلَيْكَ يَا نَبِيَّ اللهِ",translit:"As-salâmu 'alayka yâ rasûlallâh, as-salâmu 'alayka yâ nabiyyallâh",fr:"Que la paix soit sur toi, ô Messager d'Allah ! Que la paix soit sur toi, ô Prophète d'Allah !",note:"Devant la tombe bénie du Prophète ﷺ"},
    ]
  },
};

const DHIKRS=[
  {id:"subhan",ar:"سُبْحَانَ اللهِ",translit:"SubhânAllâh",fr:"Gloire à Allah",target:33},
  {id:"hamd",ar:"اَلْحَمْدُ لِلَّهِ",translit:"Alhamdulillâh",fr:"Louange à Allah",target:33},
  {id:"akbar",ar:"اَللهُ أَكْبَرُ",translit:"Allâhu Akbar",fr:"Allah est le Plus Grand",target:34},
  {id:"tasbih",ar:"سُبْحَانَ اللهِ وَبِحَمْدِهِ",translit:"SubhânAllâhi wa bihamdih",fr:"Gloire à Allah et Sa louange",target:100},
  {id:"istighfar",ar:"أَسْتَغْفِرُ اللهَ",translit:"Astaghfirullâh",fr:"Je demande pardon à Allah",target:100},
  {id:"salawat",ar:"اَللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",translit:"Allâhumma salli 'alâ Muhammad",fr:"Ô Allah, bénis Muhammad ﷺ",target:100},
  {id:"hawqala",ar:"لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ",translit:"Lâ hawla wa lâ quwwata illâ billâh",fr:"Il n'y a de force et de puissance qu'en Allah",target:100},
  {id:"basmala",ar:"بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",translit:"Bismillâhi r-rahmâni r-rahîm",fr:"Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",target:100},
];

const AZKAR_MATIN=[
  {ar:"أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",translit:"A'ûdhu billâhi mina ash-shaytâni ar-rajîm",fr:"Je cherche refuge auprès d'Allah contre Satan le maudit",repetitions:1,source:"Avant la récitation"},
  {ar:"اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",translit:"Allâhumma bika asbahna wa bika amsaynâ wa bika nahyâ wa bika namûtu wa ilayka an-nushûr",fr:"Ô Allah, grâce à Toi nous entrons dans le matin, grâce à Toi dans le soir, grâce à Toi nous vivons, grâce à Toi nous mourons, et c'est vers Toi la résurrection",repetitions:1,source:"Abû Dâwûd"},
  {ar:"أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ وَعَلَى كَلِمَةِ الإِخْلاَصِ",translit:"Asbahna 'alâ fitrati al-Islâm wa 'alâ kalimat al-ikhlâs",fr:"Nous entrons dans le matin sur la disposition naturelle de l'Islam et sur la parole de sincérité",repetitions:1,source:"Ahmad"},
];

const AZKAR_SOIR=[
  {ar:"اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",translit:"Allâhumma bika amsaynâ wa bika asbahna wa bika nahyâ wa bika namûtu wa ilayka al-masîr",fr:"Ô Allah, grâce à Toi nous entrons dans le soir, grâce à Toi dans le matin, grâce à Toi nous vivons et mourons, et c'est vers Toi le retour",repetitions:1,source:"Abû Dâwûd"},
  {ar:"سُبْحَانَ اللهِ وَبِحَمْدِهِ",translit:"SubhânAllâhi wa bihamdih",fr:"Gloire à Allah et Sa louange — quiconque le dit 100 fois le soir, Allah lui efface ses erreurs",repetitions:100,source:"Bukhâri & Muslim"},
];

const AZKAR_SOMMEIL=[
  {ar:"بِسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",translit:"Bismika Allâhumma amûtu wa ahyâ",fr:"En Ton nom, ô Allah, je meurs et je vis",repetitions:1,source:"Bukhâri"},
  {ar:"سُبْحَانَ اللهِ",translit:"SubhânAllâh",fr:"Gloire à Allah",repetitions:33,source:"Bukhâri & Muslim"},
  {ar:"اَلْحَمْدُ لِلَّهِ",translit:"Alhamdulillâh",fr:"Louange à Allah",repetitions:33,source:"Bukhâri & Muslim"},
  {ar:"اَللهُ أَكْبَرُ",translit:"Allâhu Akbar",fr:"Allah est le Plus Grand",repetitions:34,source:"Bukhâri & Muslim"},
];

const POST_40=[
  {jour:1,titre:"Prière de l'aube",desc:"Accomplir Fajr en jamaah",pts:50},
  {jour:2,titre:"Lecture du Coran",desc:"Lire au moins 1 page du Coran",pts:30},
  {jour:3,titre:"Azkar du matin",desc:"Réciter les azkar du matin complets",pts:40},
  {jour:4,titre:"Sadaqa",desc:"Donner quelque chose à un nécessiteux",pts:60},
  {jour:5,titre:"Jeûne Sunnah",desc:"Jeûner le lundi ou jeudi",pts:100},
  {jour:6,titre:"Prière de nuit",desc:"Accomplir 2 rak'ah avant Fajr",pts:80},
  {jour:7,titre:"Du'a pour les parents",desc:"Faire du'a pour ses parents décédés ou vivants",pts:50},
  {jour:8,titre:"Enseigner",desc:"Enseigner une chose islamique à quelqu'un",pts:70},
  {jour:9,titre:"Istighfar",desc:"Dire Astaghfirullâh 100 fois",pts:40},
  {jour:10,titre:"Salawat 1000x",desc:"Envoyer les bénédictions sur le Prophète ﷺ 1000 fois",pts:90},
];

const SIRA_LECONS=[
  {num:1,titre:"Makkah avant l'Islam",contenu:"Makkah était un centre commercial important de la péninsule arabique. La tribu des Quraysh gardait la Kaaba et avait une influence considérable sur toute la région.",hadith:"«J'ai été envoyé pour parfaire la morale.» — Bukhâri"},
  {num:2,titre:"La naissance du Prophète ﷺ",contenu:"Muhammad ﷺ naquit le 12 Rabi' al-Awwal, l'An de l'Éléphant (570 CE). Son père Abdullah était mort avant sa naissance. Sa mère Amina le confia à la nourrice Halima.",hadith:"«Le meilleur d'entre vous est celui qui a la meilleure moralité.» — Bukhâri"},
  {num:3,titre:"L'enfance et la jeunesse",contenu:"Orphelin à 6 ans (mort de sa mère), élevé par son grand-père Abd al-Muttalib, puis par son oncle Abu Talib. Il était connu pour son honnêteté; on l'appelait Al-Amin (le Fidèle).",hadith:"«Chaque enfant naît sur la fitrah (la disposition naturelle).» — Bukhâri"},
  {num:4,titre:"Le mariage avec Khadîja",contenu:"À 25 ans, Muhammad ﷺ épousa Khadîja bint Khuwaylid, une riche veuve de 40 ans qui l'avait embauché pour ses caravanes. Ce fut un mariage heureux qui dura 25 ans.",hadith:"«Elle me croyait quand les autres me rejetaient.» — Bukhâri"},
  {num:5,titre:"La Révélation",contenu:"À 40 ans, lors d'une retraite dans la grotte de Hira, l'ange Jibril lui apporta la première révélation: «Lis au nom de ton Seigneur» (Sourate Al-'Alaq 96:1). Il rentra tremblant chez Khadîja.",hadith:"«Lis au nom de ton Seigneur qui a créé.» — Al-'Alaq 96:1"},
  {num:6,titre:"Les premiers musulmans",contenu:"Les premiers à embrasser l'Islam furent: Khadîja (épouse), Ali ibn Abi Talib (cousin, enfant), Abu Bakr (ami), Zayd ibn Haritha (affranchi), puis Uthman, Bilal et autres.",hadith:"«Abu Bakr était le plus digne des hommes envers moi.» — Bukhâri"},
  {num:7,titre:"La persécution des Quraysh",contenu:"Les musulmans furent persécutés. Bilal fut torturé sous le soleil. Les Quraysh boycottèrent les Banu Hashim pendant 3 ans. Le Prophète ﷺ endura patiemment.",hadith:"«Soyez patients, car votre rendez-vous est le Paradis.» — Bukhâri"},
  {num:8,titre:"L'Isra et le Mi'raj",contenu:"Le Prophète ﷺ fut transporté nuitamment de la Mosquée Sacrée à la Mosquée Al-Aqsa (Isra), puis élevé aux cieux (Mi'raj) où il rencontra les prophètes et Allah lui prescrit les 5 prières.",hadith:"«Ils devront les accomplir: cinq prières quotidiennes.» — Bukhâri"},
  {num:9,titre:"L'Hégire vers Médine",contenu:"En 622 CE, face à la persécution croissante, le Prophète ﷺ émigra vers Médine (alors Yathrib). Cette date marque le début du calendrier islamique.",hadith:"«Les actions ne valent que par leurs intentions.» — Bukhâri"},
  {num:10,titre:"La Constitution de Médine",contenu:"À Médine, le Prophète ﷺ établit une communauté unie par une constitution garantissant les droits de tous, Muslims, juifs, et autres. C'était le premier État islamique.",hadith:"«Tous les croyants sont comme un seul corps.» — Bukhâri"},
];

const PRODUITS=[
  {id:1,nom:"Eau de Zamzam 5L",prix:"25 000",cat:"zamzam",emoji:"💧",desc:"Eau bénite directement de Makkah"},
  {id:2,nom:"Eau de Zamzam 1L",prix:"8 000",cat:"zamzam",emoji:"💧",desc:"Eau bénite de la source Zamzam"},
  {id:3,nom:"Dattes Ajwa Premium",prix:"35 000",cat:"dattes",emoji:"🌴",desc:"Dattes Ajwa de Médine — «Remède contre tout poison»"},
  {id:4,nom:"Dattes Medjool",prix:"20 000",cat:"dattes",emoji:"🌴",desc:"Dattes Medjool de qualité supérieure"},
  {id:5,nom:"Ihram Homme 2 pièces",prix:"15 000",cat:"vetements",emoji:"👘",desc:"Ihram blanc de qualité — Izar + Rida"},
  {id:6,nom:"Voile Médine Femme",prix:"12 000",cat:"vetements",emoji:"🧕",desc:"Voile élégant style Médine"},
  {id:7,nom:"Oud Al-Haramain",prix:"45 000",cat:"parfums",emoji:"🌹",desc:"Parfum Oud authentique des Haramayn"},
  {id:8,nom:"Rose de Taif",prix:"30 000",cat:"parfums",emoji:"🌸",desc:"Essence de rose authentique de Taif"},
  {id:9,nom:"Chapelet Zamzam",prix:"8 000",cat:"accessoires",emoji:"📿",desc:"Tasbih de 99 grains en cristal"},
  {id:10,nom:"Coran de Poche",prix:"10 000",cat:"accessoires",emoji:"📖",desc:"Coran de poche avec traduction française"},
];

const SURAHS=[
  {n:1,name:"Al-Fatiha",ar:"الفاتحة",ayahs:7},
  {n:2,name:"Al-Baqara",ar:"البقرة",ayahs:286},
  {n:3,name:"Ali Imran",ar:"آل عمران",ayahs:200},
  {n:4,name:"An-Nisa",ar:"النساء",ayahs:176},
  {n:5,name:"Al-Maida",ar:"المائدة",ayahs:120},
  {n:6,name:"Al-An'am",ar:"الأنعام",ayahs:165},
  {n:7,name:"Al-A'raf",ar:"الأعراف",ayahs:206},
  {n:36,name:"Ya-Sin",ar:"يس",ayahs:83},
  {n:55,name:"Ar-Rahman",ar:"الرحمن",ayahs:78},
  {n:56,name:"Al-Waqi'a",ar:"الواقعة",ayahs:96},
  {n:67,name:"Al-Mulk",ar:"الملك",ayahs:30},
  {n:78,name:"An-Naba",ar:"النبأ",ayahs:40},
  {n:109,name:"Al-Kafirun",ar:"الكافرون",ayahs:6},
  {n:110,name:"An-Nasr",ar:"النصر",ayahs:3},
  {n:112,name:"Al-Ikhlas",ar:"الإخلاص",ayahs:4},
  {n:113,name:"Al-Falaq",ar:"الفلق",ayahs:5},
  {n:114,name:"An-Nas",ar:"الناس",ayahs:6},
];

const CLIMAT_DATA=[
  {mois:"Janvier",makkah:"24°/32°",medine:"14°/26°",pluie:"Non",conseil:"Idéal — Frais la nuit, chaud le jour."},
  {mois:"Février",makkah:"24°/33°",medine:"16°/28°",pluie:"Non",conseil:"Très agréable."},
  {mois:"Mars",makkah:"26°/36°",medine:"18°/32°",pluie:"Non",conseil:"Encore confortable."},
  {mois:"Avril",makkah:"29°/39°",medine:"22°/36°",pluie:"Non",conseil:"Chaud."},
  {mois:"Mai",makkah:"32°/42°",medine:"26°/40°",pluie:"Non",conseil:"Très chaud."},
  {mois:"Juin",makkah:"34°/44°",medine:"29°/43°",pluie:"Non",conseil:"Caniculaire."},
  {mois:"Juillet",makkah:"35°/45°",medine:"30°/44°",pluie:"Non",conseil:"⚠️ Très dangereux."},
  {mois:"Août",makkah:"35°/44°",medine:"29°/43°",pluie:"Possible",conseil:"Chaleur + humidité."},
  {mois:"Septembre",makkah:"32°/42°",medine:"27°/40°",pluie:"Possible",conseil:"Encore chaud."},
  {mois:"Octobre",makkah:"30°/38°",medine:"24°/36°",pluie:"Non",conseil:"Agréable."},
  {mois:"Novembre",makkah:"26°/34°",medine:"18°/30°",pluie:"Possible",conseil:"Très bien."},
  {mois:"Décembre",makkah:"22°/30°",medine:"14°/26°",pluie:"Possible",conseil:"Excellent."}
];

const INTERDITS_DATA={
  hommes:[
    {interdit:"🧵 Vêtements cousus",explication:"Pas de chemises, pantalons, sous-vêtements."},
    {interdit:"🧢 Couvrir la tête",explication:"La tête doit rester découverte."},
    {interdit:"✂️ Se couper les cheveux ou les ongles",explication:"Interdit jusqu'à la fin de l'Oumra."},
    {interdit:"🌹 Parfum",explication:"Aucun parfum."}
  ],
  femmes:[
    {interdit:"✂️ Se couper les cheveux ou les ongles",explication:"Interdit."},
    {interdit:"🌹 Parfum",explication:"Interdit."}
  ],
  permis:[
    "✅ Porter des lunettes de soleil",
    "✅ Utiliser une ceinture",
    "✅ Se laver (sans parfum)",
    "✅ Porter une montre"
  ]
};

const BAGAGES_DATA=[
  {cat:"👘 Ihram & Vêtements",items:["2 pièces Ihram","Ceinture","Vêtements légers","Sandales"]},
  {cat:"💊 Santé & Hygiène",items:["Médicaments personnels","Paracétamol","Crème solaire"]},
  {cat:"📿 Spirituel",items:["Coran de poche","Carnet de du'a"]},
  {cat:"🎒 Pratique",items:["Sac à dos léger","Ventilateur","Bouteille d'eau"]},
  {cat:"📋 Documents",items:["Passeport","Visa Oumra","Billets avion"]}
];

const SANTE_DATA=[
  {icon:"☀️",titre:"Coup de chaleur",desc:"Boire minimum 3L d'eau par jour."},
  {icon:"👟",titre:"Ampoules aux pieds",desc:"Porter vos sandales AVANT."},
  {icon:"🦠",titre:"Infections",desc:"Porter un masque dans les foules."},
  {icon:"🏥",titre:"Urgences",desc:"Hôpitaux autour du Haram gratuits."}
];

const QUIZ_QUESTIONS=[
  {q:"Combien de tours compte le Tawaf ?",r:["5","7","9","12"],b:1},
  {q:"Où prononce-t-on l'intention d'Ihram ?",r:["À La Mecque","Au Miqat","À Médine","Dans l'avion"],b:1},
  {q:"Combien d'allers-retours compte le Sa'i ?",r:["5","3","7","9"],b:2}
];

const AUDIO_MAP={
  talbiya:"https://cdn.islamic.network/mp3/prayer-times/azan/Madinah.mp3",
};
