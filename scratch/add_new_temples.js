const fs = require('fs');
const path = require('path');
const https = require('https');

// Define the 14 temples with metadata and wikipedia search queries for open source images
const newTemplesData = [
  {
    id: "girnar-temples",
    name: "Girnar Temples & Pilgrimage Mountain",
    name_gu: "ગિરનાર તીર્થ સ્થાન અને મંદિરો",
    name_hi: "गिरनार तीर्थ स्थान और मंदिर",
    category: "Pilgrimage Mountain",
    city: "Junagadh",
    city_gu: "જૂનાગઢ",
    city_hi: "जूनागढ़",
    lat: 21.5273,
    lng: 70.5284,
    year: 1128,
    era: "Solanki / Ancient",
    openHour: 5.0,
    closeHour: 20.0,
    summary: "Sacred mountain in Saurashtra featuring iconic temples of Jainism (Bhagwan Neminath ~4,000 steps), Ambika Devi (~5,000 steps), Guru Gorakhnath (~6,000 steps), Dattatreya (~10,000 steps), and Bhavnath Mahadev at the foothills.",
    summary_gu: "ભગવાન નેમિનાથ (~૪,૦૦૦ પગથિયાં), અંબાજી (~૫,૦૦૦ પગથિયાં), ગોરખનાથ (~૬,૦૦૦ પગથિયાં) અને દત્તાત્રેય (~૧૦,૦૦૦ પગથિયાં) શિખરો ધરાવતું સોરાષ્ટ્રનું પરમ પવિત્ર ગિરનાર તીર્થ.",
    summary_hi: "भगवान नेमिनाथ (~4,000 सीढ़ियां), अंबा देवी (~5,000 सीढ़ियां), गोरखनाथ (~6,000 सीढ़ियां) और दत्तात्रेय (~10,000 सीढ़ियां) शिखरों वाला सौराष्ट्र का परम पवित्र गिरनार पर्वत।",
    description: "Girnar is one of Gujarat's most revered pilgrimage mountains, sacred to Jains, Hindus, and Nath traditions. The sacred route climbs up through 10,000 stone steps leading to major shrines including the 12th-century Neminath Jain Temple, Ambika Temple, Gorakhnath Peak, and the uppermost Dattatreya Peak.",
    period: "12th Century AD & Ancient Tradition",
    timings: "5:00 AM – 8:00 PM (Ropeway available 6:45 AM – 5:00 PM)",
    entryFee: "Free entry to temples (Ropeway charges apply separately)",
    bestTime: "November – February",
    lastVerified: "2026-09",
    source: "Gujarat Tourism & Junagadh District Administration",
    officialUrl: "https://junagadh.nic.in/",
    style: "Solanki-Chaulukya & Nagara Architecture",
    builder: "Vastupala-Tejapala & Historical Patrons",
    material: "Granite & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "mountain-temple",
      hotspots: [
        { yaw: 0, pitch: 15, title: "Neminath Jain Temple (~4,000 steps)", desc: "22nd Tirthankara temple complex built by Solanki ministers Vastupala and Tejapala." },
        { yaw: 90, pitch: 20, title: "Ambaji / Ambika Temple (~5,000 steps)", desc: "Ancient Shakti shrine visited by newlyweds for divine blessings." },
        { yaw: 180, pitch: 25, title: "Gorakhnath Peak (~6,000 steps)", desc: "Highest peak in Gujarat (1,117 m) dedicated to Guru Gorakhnath of Nath Sampradaya." },
        { yaw: 270, pitch: 30, title: "Dattatreya Temple (~10,000 steps)", desc: "Uppermost shrine at the pinnacle dedicated to Lord Dattatreya." }
      ]
    },
    levels: [
      { title: "Bhavnath Mahadev Temple — Foothills", description: "Located at the base of Mount Girnar, host of the famous Mahashivratri Fair and starting point for pilgrims.", lookFor: "Naga Sadhus procession and ancient Shiva Lingam sanctum." },
      { title: "Neminath Jain Temple — ~4,000 Steps", description: "Principal Jain temple complex housing the black granite idol of 22nd Tirthankara Bhagwan Neminath.", lookFor: "Intricate ceiling carvings and courtly colonnades dating back to 1128 AD." },
      { title: "Ambaji / Ambika Temple — ~5,000 Steps", description: "Revered Hindu shrine associated with Maa Ambika, visited by devotees for marital blessings.", lookFor: "Panoramic views of Junagadh city and surrounding Gir range." },
      { title: "Gorakhnath Peak — ~6,000 Steps", description: "Highest point in Gujarat state (1,117m) housing the footprints and dhuni of Guru Gorakhnath.", lookFor: "Nath sampradaya holy footprints (Paduka) atop the rocky crag." },
      { title: "Mahakali Temple — Remote Peak", description: "Shrine dedicated to Maa Mahakali situated along the ridge between major peaks.", lookFor: "Aghori tradition shrines and secluded meditation caves." },
      { title: "Dattatreya Temple — ~10,000 Steps", description: "Pinnacle shrine dedicated to Lord Dattatreya, marking the culmination of the pilgrimage.", lookFor: "Sacred paduka of Lord Dattatreya overlooking sea of clouds." }
    ],
    story: {
      en: "Girnar is an ancient mountain rising dramatically above Junagadh in Saurashtra. Sacred to Jainism as the site where 22nd Tirthankara Lord Neminath attained moksha, it is equally revered by Hindus for Maa Ambika and Lord Dattatreya, and by Nath ascetics for Guru Gorakhnath. The climb of 10,000 steps winds through mountain mist, ancient Jain temples, and sacred peaks.",
      gu: "ગિરનાર જૂનાગઢ પાસે આવેલો એક અતિ પવિત્ર પર્વત છે. જૈન ધર્મમાં ૨૨મા તીર્થંકર ભગવાન નેમિનાથનું નિર્વાણ સ્થાન હોવાની સાથે હિન્દુ ધર્મમાં અંબાજી અને દત્તાત્રેય તથા નાથ સંપ્રદાયમાં ગુરુ ગોરખનાથની સાધના ભૂમિ તરીકે પૂજનીય છે.",
      hi: "गिरनार जूनागढ़ के पास स्थित एक अति पवित्र पर्वत है। जैन धर्म में 22वें तीर्थंकर भगवान नेमिनाथ की मोक्ष भूमि होने के साथ-साथ यह हिंदू धर्म में मां अंबिका, दत्तात्रेय और नाथ संप्रदाय में गुरु गोरखनाथ की तपोभूमि के रूप में पूजनीय है।"
    },
    living: [
      { type: "Festival", name: "Girnar Lili Parikrama", note: "Annual 36 km barefoot circumambulation around Girnar hill during Kartik Purnima.", months: [11] },
      { type: "Fair", name: "Bhavnath Mahashivratri Mela", note: "Grand gathering of Naga Sadhus and thousands of pilgrims at Bhavnath foothills.", months: [2, 3] }
    ],
    queries: ['Girnar temple', 'Girnar Jain temple', 'Neminath temple Girnar', 'Ambika Mata temple Mount Girnar']
  },

  {
    id: "vadtal-swaminarayan-temple",
    name: "Vadtal Swaminarayan Temple (Vadtal Dham)",
    name_gu: "શ્રી સ્વામિનારાયણ મંદિર (વડતાલ ધામ)",
    name_hi: "श्री स्वामीनारायण मंदिर (वडताल धाम)",
    category: "Temple",
    city: "Vadtal",
    city_gu: "વડતાલ",
    city_hi: "वडताल",
    lat: 22.5898,
    lng: 72.8845,
    year: 1824,
    era: "Swaminarayan Era (19th Century)",
    openHour: 6.0,
    closeHour: 20.5,
    summary: "Historic headquarters of the Vadtal Gadi of Swaminarayan Sampradaya, constructed in lotus-shape with nine golden domes by Bhagwan Swaminarayan in 1824.",
    summary_gu: "ભગવાન સ્વામિનારાયણ દ્વારા ૧૮૨૪ માં સ્થાપિત નવ શિખરબદ્ધ કમળ આકારનું પ્રસિદ્ધ વડતાલ ધામ મંદિર.",
    summary_hi: "भगवान स्वामीनारायण द्वारा 1824 में स्थापित नौ शिखरों वाला प्रसिद्ध वडताल धाम मंदिर।",
    description: "Vadtal Dham in Kheda district is one of the holiest pilgrimage centers of Swaminarayan Sampradaya. Established by Bhagwan Swaminarayan on Kartik Sud 12, VS 1881 (1824 AD), the temple features a unique lotus-shaped plan with nine domes housing Shri LaxmiNarayan Dev, Radha-Krishna Dev, Hari Krishna Maharaj, Vasudev, Bhaktimata, and Dharmapita.",
    period: "19th Century AD (1824 AD)",
    timings: "6:00 AM – 12:00 PM, 3:30 PM – 8:30 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Shree Swaminarayan Mandir Vadtal Gadi",
    officialUrl: "https://vadtal.org/",
    style: "Lotus-Plan Wooden & Sandstone Architecture",
    builder: "Bhagwan Swaminarayan & Brahmanand Swami",
    material: "Carved Wood & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Central Sanctum — LaxmiNarayan Dev", desc: "Main central shrine installed personally by Bhagwan Swaminarayan in 1824." },
        { yaw: 120, pitch: 15, title: "Nine Golden Domes (9 Shikhars)", desc: "Distinctive architectural feature laid out in a lotus flower pattern." },
        { yaw: 240, pitch: 10, title: "Gomti Lake & Mango Grove", desc: "Sacred lake adjacent to the temple complex where holy assemblies were held." }
      ]
    },
    story: {
      en: "Established by Bhagwan Swaminarayan in 1824 AD, Vadtal Dham was constructed under the supervision of Brahmanand Swami and Aksharanand Swami. Designed in the shape of a lotus with nine soaring domes, the central altar enshrines Shri LaxmiNarayan Dev. It remains the spiritual throne of the Dakshin Vibhag (Vadtal Gadi).",
      gu: "ભગવાન સ્વામિનારાયણે ૧૮૨૪ માં પોતાના હાથે લક્ષ્મીનારાયણ દેવની મૂર્તિ પધરાવીને આ વડતાલ મંદિરની સ્થાપના કરી હતી. નવ શિખર અને કમળ આકારના સ્થાપત્યવાળું આ મંદિર વડતાલ ગાદીનું મુખ્ય કેન્દ્ર છે.",
      hi: "भगवान स्वामीनारायण ने 1824 में अपने हाथों से लक्ष्मीनारायण देव की मूर्ति प्रतिष्ठापित कर इस वडताल मंदिर की स्थापना की थी। नौ शिखरों वाला यह मंदिर वडताल गद्दी का मुख्य केंद्र है।"
    },
    living: [
      { type: "Festival", name: "Hindola Utsav & Jal Jhilani", note: "Grand swing festival during Shravan and holy boat festival in Gomti lake.", months: [8, 9] },
      { type: "Fair", name: "Vadtal Samaiyo", note: "Mass gathering of thousands of devotees during Dev Podhi Ekadashi and Chaitra Sud Punam.", months: [3, 4, 11] }
    ],
    queries: ['Vadtal Mandir', 'Laxminarayan Dev Vadtal Mandir', 'Vadtaltemple']
  },

  {
    id: "dakor-ranchhodraiji-temple",
    name: "Dakor Ranchhodraiji Temple",
    name_gu: "ડાકોર રણછોડરાયજી મંદિર",
    name_hi: "डाकोर रणछोड़रायजी मंदिर",
    category: "Temple",
    city: "Dakor",
    city_gu: "ડાકોર",
    city_hi: "डाकोर",
    lat: 22.7533,
    lng: 73.1500,
    year: 1772,
    era: "Maratha Era (18th Century)",
    openHour: 6.0,
    closeHour: 20.0,
    summary: "Famous Krishna temple in Kheda district housing the revered idol of Lord Ranchhodraiji brought from Dwarka by devotee Vijaysinh Bodana in the 12th century.",
    summary_gu: "ભક્ત બોડાણા દ્વારા દ્વારકાથી લાવવામાં આવેલી શ્રી રણછોડરાયજીની પ્રસિદ્ધ મૂર્તિનું ડાકોર મંદિર.",
    summary_hi: "भक्त बोडाणा द्वारा द्वारका से लाई गई श्री रणछोड़रायजी की प्रसिद्ध मूर्ति का डाकोर मंदिर।",
    description: "Dakor Ranchhodraiji Temple is a major Krishna pilgrimage site on the banks of Gomti Lake in Dakor, Kheda district. Built in 1772 AD by Maratha nobleman Gopalrao Jagannath Tambwekar, it features 8 domes, 24 minarets, and a gold-plated central spire housing the black touchstone idol of Lord Ranchhodraiji.",
    period: "18th Century AD (1772 AD)",
    timings: "6:00 AM – 12:00 PM, 4:00 PM – 7:30 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Shree Ranchhodraiji Temple Trust Dakor",
    officialUrl: "https://dakor.in/",
    style: "Maratha-Rajasthani Hybrid Architecture",
    builder: "Gopalrao Jagannath Tambwekar",
    material: "Brick, Mortar & Gold Plating",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Central Gold-Plated Sanctum", desc: "Houses the 3-foot black stone idol of Lord Ranchhodraiji wearing royal attire." },
        { yaw: 120, pitch: 15, title: "Gomti Lake & Tulsi Weighing Scale", desc: "Legendary spot where the idol was weighed against a single Tulsi leaf." }
      ]
    },
    story: {
      en: "According to legend, an elderly devotee named Vijaysinh Bodana used to walk from Dakor to Dwarka every Ekadashi carrying a grown Tulsi plant. Pleased with his devotion, Lord Krishna travelled with Bodana to Dakor in his chariot. When Dwarka priests pursued him, the idol was miraculously weighed against a single Tulsi leaf.",
      gu: "દંતકથા અનુસાર ભક્ત વિજયસિંહ બોડાણા દર એકાદશીએ ડાકોરથી દ્વારકા ચાલીને જતા હતા. તેમની ભક્તિથી પ્રસન્ન થઈને ભગવાન કૃષ્ણ રથમાં બેસી ડાકોર આવ્યા હતા અને તુલસીના એક પાંદડા જેટલા વજનમાં તોલાયા હતા.",
      hi: "कथा के अनुसार भक्त विजयसिंह बोडाणा की भक्ति से प्रसन्न होकर भगवान कृष्ण द्वारका से डाकोर आए थे और एक तुलसी के पत्ते के वजन के बराबर तुले थे।"
    },
    living: [
      { type: "Festival", name: "Dakor Poonam Mela", note: "Lakhs of devotees walk barefoot on foot to Dakor every Phalguna Purnima (Holi).", months: [3] }
    ],
    queries: ['Dakore temple', 'Ranchhodrai Temple Dakor', 'Dakor']
  },

  {
    id: "bala-hanuman-temple",
    name: "Bala Hanuman Temple (Shri Bala Hanuman Sankirtan Mandir)",
    name_gu: "બાલા હનુમાન મંદિર (જામનગર)",
    name_hi: "बाला हनुमान मंदिर (जामनगर)",
    category: "Temple",
    city: "Jamnagar",
    city_gu: "જામનગર",
    city_hi: "जामनगर",
    lat: 22.4707,
    lng: 70.0711,
    year: 1964,
    era: "Modern Era",
    openHour: 6.0,
    closeHour: 22.0,
    summary: "Guinness World Record holding temple on the banks of Ranmal Lake in Jamnagar, famous for uninterrupted continuous chanting of 'Shri Ram, Jai Ram, Jai Jai Ram' since August 1, 1964.",
    summary_gu: "૧ ઓગસ્ટ ૧૯૬૪ થી અવિરત રામધૂન માટે ગિનિસ બુક ઓફ વર્લ્ડ રેકોર્ડ ધરાવતું જામનગરનું પ્રસિદ્ધ બાલા હનુમાન મંદિર.",
    summary_hi: "1 अगस्त 1964 से लगातार रामधुन के लिए गिनीज बुक ऑफ वर्ल्ड रिकॉर्ड में दर्ज जामनगर का प्रसिद्ध बाला हनुमान मंदिर।",
    description: "Shri Bala Hanuman Sankirtan Mandir is located on the southeastern bank of Lakhota / Ranmal Lake in Jamnagar. Founded by Prembhikshuji Maharaj, the temple gained worldwide acclaim for its non-stop continuous chanting of 'Shri Ram, Jai Ram, Jai Jai Ram' 24 hours a day, 365 days a year without a single second break since August 1, 1964.",
    period: "20th Century AD (1964 AD)",
    timings: "6:00 AM – 10:00 PM (Akhand Ramdhun runs 24 hours)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Jamnagar Municipal Corporation & Temple Trust",
    officialUrl: "https://jamnagar.nic.in/",
    style: "Modern Temple Architecture",
    builder: "Shri Prembhikshuji Maharaj",
    material: "Marble & Concrete",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Akhand Ramdhun Hall", desc: "The sacred hall where devotees chant 'Shri Ram, Jai Ram, Jai Jai Ram' round the clock." },
        { yaw: 180, pitch: 5, title: "Lakhota Lake Promenade View", desc: "Overlooking the historic Lakhota Palace and Ranmal lake." }
      ]
    },
    story: {
      en: "Established by Saint Prembhikshuji Maharaj in 1953, the temple initiated an unbroken round-the-clock chanting of the Ramdhun 'Shri Ram, Jai Ram, Jai Jai Ram' on August 1, 1964. The continuous multi-decade devotion earned it an entry into the Guinness Book of World Records.",
      gu: "સંત પ્રેમભિક્ષુજી મહારાજ દ્વારા ૧૯૬૪ માં શરૂ કરવામાં આવેલી અખંડ રામધૂન આજે પણ દિવસ-રાત ચાલુ છે, જેણે ગિનિસ બુક ઓફ વર્લ્ડ રેકોર્ડ્સમાં સ્થાન મેળવ્યું છે.",
      hi: "संत प्रेमभिक्षुजी महाराज द्वारा 1964 में शुरू की गई अखंड रामधुन आज भी दिन-रात जारी है, जिसने गिनीज बुक ऑफ वर्ल्ड रिकॉर्ड्स में स्थान पाया है।"
    },
    living: [
      { type: "Chanting", name: "24x7 Akhand Ramdhun", note: "Continuous chanting of 'Shri Ram, Jai Ram, Jai Jai Ram' maintained by rotating devotee groups.", months: [1,2,3,4,5,6,7,8,9,10,11,12] }
    ],
    queries: ['Bala Hanuman Jamnagar', 'Lakhota Lake Jamnagar']
  },

  {
    id: "shatrunjaya-temples",
    name: "Shatrunjaya Temples (Palitana)",
    name_gu: "શત્રુંજય તીર્થ મંદિરો (પાલિતાણા)",
    name_hi: "शत्रुंजय तीर्थ मंदिर (पालिताणा)",
    category: "Temple Complex",
    city: "Palitana",
    city_gu: "પાલિતાણા",
    city_hi: "पालिताणा",
    lat: 21.5039,
    lng: 71.8214,
    year: 1000,
    era: "Solanki & Medieval Era",
    openHour: 5.5,
    closeHour: 18.0,
    summary: "The world's largest Jain temple complex with over 863 marble temples perched atop Shatrunjaya Hill in Palitana, dedicated to 1st Tirthankara Bhagwan Rishabhanatha (Adinath).",
    summary_gu: "શત્રુંજય પર્વત પર ૮૬૩ થી વધુ આરસપહાણના શિખરબદ્ધ જૈન મંદિરો ધરાવતું વિશ્વનું સૌથી મોટું જૈન તીર્થ પાલિતાણા.",
    summary_hi: "शत्रुंजय पर्वत पर 863 से अधिक संगमरमर के जैन मंदिरों वाला विश्व का सबसे बड़ा जैन तीर्थ पालिताणा।",
    description: "Shatrunjaya Hill in Palitana, Bhavnagar district, is the premier pilgrimage site (Shashvat Tirth) of Jainism. Climbing ~3,500 stone steps leads to a hilltop fortress city of 863 white marble temples grouped into 9 main enclosures (tuks), with the grand Adishwar Temple at its heart.",
    period: "11th – 16th Century AD",
    timings: "5:30 AM – 6:00 PM (No overnight stay allowed on hill)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Anandji Kalyanji Trust & ASI",
    officialUrl: "http://palitanatirth.org/",
    style: "Solanki Marble Jain Architecture",
    builder: "Kumarpala, Vastupala & Jain Sanghas",
    material: "White Makrana Marble & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "hilltop-complex",
      hotspots: [
        { yaw: 0, pitch: 15, title: "Adishwar Temple (Main Tuk)", desc: "Primary shrine enshrining the marble idol of Bhagwan Rishabhanatha (Adinath)." },
        { yaw: 120, pitch: 20, title: "Chaumukh Temple", desc: "Four-faced Jain temple constructed so the deity is visible from all four cardinal directions." },
        { yaw: 240, pitch: 10, title: "Motishah Tuk", desc: "Expansive hilltop courtyard cluster containing 125 temples built in 1836 AD." }
      ]
    },
    story: {
      en: "Shatrunjaya translates to 'place of victory over inner enemies'. Jain tradition holds that 23 of the 24 Tirthankaras visited and sanctified this hill, beginning with Bhagwan Rishabhanatha. Rebuilt across centuries after invasions, the marble city features unparalleled stone carving.",
      gu: "જૈન માન્યતા અનુસાર ૨૪ માંથી ૨૩ તીર્થંકરોએ શત્રુંજય પર્વતની યાત્રા કરી હતી. ૮૬૩ આરસપહાણના મંદિરોથી મંડિત આ પર્વત જૈન ધર્મનું પ્રથમ અને સૌથી પવિત્ર શશ્વત તીર્થ માનવામાં આવે છે.",
      hi: "जैन मान्यता के अनुसार 24 में से 23 तीर्थंकरों ने शत्रुंजय पर्वत की यात्रा की थी। 863 संगमरमर मंदिरों से सजा यह पर्वत जैन धर्म का सबसे पवित्र तीर्थ है।"
    },
    living: [
      { type: "Pilgrimage", name: "Phagun Sud Teras Chha Gau Yatra", note: "Mass 6-gaou (~18 km) walking pilgrimage across Shatrunjaya hill during Phalguna month.", months: [3] }
    ],
    queries: ['Palitana temples', 'Shatrunjaya', 'Palitana']
  },

  {
    id: "bahuchar-mata-temple",
    name: "Bahuchar Mata Temple",
    name_gu: "બહુચર માતાજી મંદિર (બેચરાજી)",
    name_hi: "बहुचर माताजी मंदिर (बेचराजी)",
    category: "Temple",
    city: "Becharaji",
    city_gu: "બેચરાજી",
    city_hi: "बेचराजी",
    lat: 23.5019,
    lng: 72.0620,
    year: 1783,
    era: "Gaekwad Era (18th Century)",
    openHour: 5.0,
    closeHour: 21.0,
    summary: "Revered Shakti Peeth in Mehsana district dedicated to Bahuchar Mata riding a rooster (Kukuta), an important center for vows, childbirth blessings, and regional traditions.",
    summary_gu: "કૂકડ વાહન પર બિરાજમાન માં બહુચરનું પ્રસિદ્ધ શક્તિપીઠ બેચરાજી મંદિર.",
    summary_hi: "कुक्कुट (मुर्गे) वाहन पर विराजमान मां बहुचर का प्रसिद्ध शक्तिपीठ बेचराजी मंदिर।",
    description: "Bahuchar Mata Temple in Becharaji, Mehsana district, is one of Gujarat's most prominent goddess shrines. Rebuilt in 1783 AD by Manajirao Gaekwad of Baroda, the complex includes the original Vala Vraksh small shrine, the Madhya temple, and the grand Main Temple adorned with stone carvings.",
    period: "18th Century AD (1783 AD)",
    timings: "5:00 AM – 9:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Becharaji Temple Trust & Mehsana District",
    officialUrl: "https://becharaji.org/",
    style: "Solanki-Gaekwad Temple Style",
    builder: "Manajirao Gaekwad of Baroda",
    material: "Carved Stone & Marble",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Main Sanctum & Bala Yantra", desc: "Enshrines the sacred Sri Chakra Bala Yantra of Goddess Bahuchar." },
        { yaw: 180, pitch: 5, title: "Varakhadi Tree Shrine", desc: "Ancient Varakhadi tree where Goddess Bahuchar manifest according to tradition." }
      ]
    },
    story: {
      en: "Goddess Bahuchar was a Charan woman who sacrificed her life to protect her honor from bandits. Revered as an incarnation of Hinglaj Mata, she rides a rooster (Kukuta) and is worshipped as the dispenser of strength, child blessings, and guardian of identity.",
      gu: "માં બહુચર ચારણ દેવી તરીકે અવતરેલા માનવામાં આવે છે. કૂકડ પર અસવાર માતાજીનું આ શક્તિપીઠ મન્નત અને સંતાનપ્રાપ્તિની આશાઓ પૂર્ણ કરવા માટે પ્રસિદ્ધ છે.",
      hi: "मां बहुचर चारण देवी के रूप में अवतरित मानी जाती हैं। मुर्गे पर सवार माताजी का यह शक्तिपीठ मन्नत और मनोकामनाएं पूर्ण करने के लिए प्रसिद्ध है।"
    },
    living: [
      { type: "Festival", name: "Chaitra Purnima & Navratri Fair", note: "Massive annual gathering with midnight garba, palli processions, and traditional vows.", months: [4, 10] }
    ],
    queries: ['Bahuchara', 'Bahuchara Devi', 'Bahuchara Mata Temple']
  },

  {
    id: "kalika-mata-pavagadh",
    name: "Kalika Mata Temple (Pavagadh)",
    name_gu: "કાલિકા માતાજી મંદિર (પાવાગઢ)",
    name_hi: "कालिका माता मंदिर (पावागढ़)",
    category: "Temple",
    city: "Pavagadh",
    city_gu: "પાવાગઢ",
    city_hi: "पावागढ़",
    lat: 22.4649,
    lng: 73.5186,
    year: 1000,
    era: "Medieval & Solanki Era",
    openHour: 6.0,
    closeHour: 19.5,
    summary: "Ancient Shakti Peeth perched atop Pavagadh Hill overlooking the UNESCO Champaner-Pavagadh heritage site, housing the shrines of Kalika Mata, Kali, and Bahuchara.",
    summary_gu: "યુનેસ્કો ચંપાનેર-પાવાગઢ હેરિટેજ વિસ્તારના શિખર પર આવેલું પ્રાચીન કાલિકા માતા શક્તિપીઠ.",
    summary_hi: "यूनेस्को चंपानेर-पावागढ़ हेरिटेज क्षेत्र के शिखर पर स्थित प्राचीन कालिका माता शक्तिपीठ।",
    description: "Kalika Mata Temple is located at the summit of Pavagadh Hill in Panchmahal district. Considered one of the 51 Shakti Peethas (where Goddess Sati's right toe fell), the temple features a renovated spire, grand gold-plated Kalash, and a high-speed ropeway carrying pilgrims up the cliff.",
    period: "10th – 11th Century AD (Spire restored 2022)",
    timings: "6:00 AM – 7:30 PM (Ropeway operational 6:00 AM – 6:00 PM)",
    entryFee: "Free entry to temple (Ropeway fee applies separately)",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Shree Kalika Mataji Mandir Trust Pavagadh",
    officialUrl: "https://pavagadhtemple.org/",
    style: "Hilltop Fortress Temple Architecture",
    builder: "Solanki Kings & Pavagadh Temple Trust",
    material: "Red Sandstone & Marble",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "hilltop-shrine",
      hotspots: [
        { yaw: 0, pitch: 15, title: "Golden Shikhar & Dhvaja", desc: "Newly restored 500-year-old temple spire flying the sacred red flag." },
        { yaw: 120, pitch: 10, title: "Inner Sanctum — Mukhwato", desc: "Houses the divine red head form (Mukhwato) of Maa Kalika." }
      ]
    },
    story: {
      en: "Pavagadh is one of the 51 Shakti Peethas of Goddess Sati. For over five centuries, the spire remained incomplete following historical battles until a comprehensive restoration in 2022 restored the grand golden Shikhar and flag, visited by millions during Navratri.",
      gu: "પાવાગઢ ૫૧ શક્તિપીઠોમાંનું એક ગણાય છે જ્યાં સતીનો જમણો પગ પડ્યો હતો. ૫૦૦ વર્ષ બાદ ૨૦૨૨ માં શિખર પર સુવર્ણ કળશ અને ધજા પુનઃ રોપવામાં આવ્યા હતા.",
      hi: "पावागढ़ 51 शक्तिपीठों में से एक माना जाता है जहां सती का दायां पैर गिरा था। 500 साल बाद 2022 में इसके शिखर पर स्वर्ण कलश और ध्वजा स्थापित की गई।"
    },
    living: [
      { type: "Festival", name: "Pavagadh Navratri Festival", note: "Over 10 lakh pilgrims climb Pavagadh hill during Ashwin and Chaitra Navratri.", months: [4, 10] }
    ],
    queries: ['Kalika Mata Pavagadh', 'Pavagadh fort', 'Pavagadh']
  },

  {
    id: "shamlaji-temple",
    name: "Shamlaji Temple (Gadadhar Vishnu)",
    name_gu: "શામળાજી વિષ્ણુ મંદિર (અરવલ્લી)",
    name_hi: "शामलाजी विष्णु मंदिर (अरावली)",
    category: "Temple",
    city: "Shamlaji",
    city_gu: "શામળાજી",
    city_hi: "शामलाजी",
    lat: 23.6881,
    lng: 73.3852,
    year: 1000,
    era: "Solanki Era (11th Century)",
    openHour: 6.0,
    closeHour: 20.5,
    summary: "Ancient 11th-century Chaulukya style Vishnu temple on the banks of Meshwo River in Aravalli district, famed for intricate stone carvings of elephants and legends.",
    summary_gu: "મેશ્વો નદીના કિનારે ૧૧મી સદીનું બારીક હાથી કોતરણી ધરાવતું પ્રાચીન શામળાજી ભગવાન વિષ્ણુ મંદિર.",
    summary_hi: "मेष्वो नदी के तट पर 11वीं सदी का बारीक हाथी नक्काशी वाला प्राचीन शामलाजी भगवान विष्णु मंदिर।",
    description: "Shamlaji Temple in Aravalli district is dedicated to Lord Vishnu as Shamlaji (Gadadhar / Dark Lord). Built in classic Solanki-Chaulukya style with two storeys, elaborate pillared halls, and external friezes depicting hundreds of carved elephants (Gaja-thara), it sits in a scenic valley of the Aravalli hills.",
    period: "11th Century AD",
    timings: "6:00 AM – 12:30 PM, 5:00 PM – 8:30 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "November – March",
    lastVerified: "2026-09",
    source: "Archaeological Department of Gujarat & Shamlaji Temple Trust",
    officialUrl: "https://aravalli.nic.in/",
    style: "Solanki-Chaulukya Style",
    builder: "Solanki Monarchs",
    material: "Dark Sandstone & White Marble",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Sanctum Idol — Gadadhar Vishnu", desc: "Black stone idol of Lord Vishnu holding the mace (Gada), lotus, shell, and chakra." },
        { yaw: 120, pitch: 5, title: "Gaja-Thara Frieze", desc: "Lower outer plinth depicting a continuous carved procession of war elephants." }
      ]
    },
    story: {
      en: "According to local tradition, the idol of Lord Shamlaji was found by an adivasi farmer while plowing his field. The site evolved into a grand Chaulukya temple along ancient trade routes connecting Gujarat and Rajasthan.",
      gu: "મેશ્વો નદી કિનારે આવેલું શામળાજી મંદિર તેની કોતરણી અને હાથીઓની હારમાળા માટે પ્રસિદ્ધ છે. કારતકી પૂનમે અહીં મોટો મેળો ભરાય છે.",
      hi: "मेष्वो नदी तट पर स्थित शामलाजी मंदिर अपनी नक्काशी और हाथियों के पैनलों के लिए प्रसिद्ध है। कार्तिक पूर्णिमा पर यहां विशाल मेला लगता है।"
    },
    living: [
      { type: "Fair", name: "Shamlaji Kartik Purnima Mela", note: "Traditional 3-week tribal and cultural fair attended by devotees across Gujarat and Rajasthan.", months: [11] }
    ],
    queries: ['Shamlaji', 'Samlaji temple', 'Shamlaji temple']
  },

  {
    id: "sudama-mandir",
    name: "Sudama Mandir (Porbandar)",
    name_gu: "સુદામા મંદિર (પોરબંદર)",
    name_hi: "सुदामा मंदिर (पोरबंदर)",
    category: "Temple",
    city: "Porbandar",
    city_gu: "પોરબંદર",
    city_hi: "पोरबंदर",
    lat: 21.6417,
    lng: 69.6019,
    year: 1902,
    era: "Princely State Era (Jethwa Monarchy)",
    openHour: 6.0,
    closeHour: 21.0,
    summary: "One of the world's few temples dedicated exclusively to Sudama, the iconic childhood friend and devotee of Lord Krishna, located in historic Porbandar.",
    summary_gu: "ભગવાન કૃષ્ણના પરમ મિત્ર સુદામાને સમર્પિત વિશ્વનું દુર્લભ સુદામા મંદિર.",
    summary_hi: "भगवान कृष्ण के परम मित्र सुदामा को समर्पित विश्व का दुर्लभ सुदामा मंदिर।",
    description: "Sudama Mandir is located in the heart of Porbandar (historically known as Sudamapuri). Constructed between 1902 and 1907 by Maharaja Bhavsinhji Madhavsinhji of the Jethwa dynasty, the temple features a white marble sanctum, carved pillars, surrounding gardens, and a stepwell (Kunda).",
    period: "Early 20th Century AD (1907 AD)",
    timings: "6:00 AM – 1:00 PM, 4:00 PM – 9:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Porbandar Municipality & Gujarat Tourism",
    officialUrl: "https://porbandar.nic.in/",
    style: "Rajputana-Saurashtra Architecture",
    builder: "Jethwa Monarchy of Porbandar",
    material: "White Marble & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Central Sanctum — Sudama & Sushila", desc: "Houses the idols of Sudama and his wife Sushila alongside Lord Krishna." },
        { yaw: 180, pitch: 5, title: "Temple Courtyard & Stepwell", desc: "Peaceful garden compound housing historic stepped tank." }
      ]
    },
    story: {
      en: "Porbandar is celebrated in scripture as Sudamapuri, the birthplace of Sudama. When Sudama visited Lord Krishna in Dwarka with a meager gift of flattened rice (Poha), Krishna showered him with divine affection and endless prosperity.",
      gu: "પોરબંદર સુદામાપૂરી તરીકે જાણીતું છે. ભગવાન કૃષ્ણ અને સુદામાની નિઃસ્વાર્થ મિત્રતા અને ભક્તિની યાદમાં જેઠવા રાજાઓ દ્વારા આ સુંદર મંદિર બનાવાયું હતું.",
      hi: "पोरबंदर सुदामापुरी के नाम से विख्यात है। भगवान कृष्ण और सुदामा की निस्वार्थ मित्रता की याद में जेठवा राजाओं द्वारा यह सुंदर मंदिर बनवाया गया था।"
    },
    living: [
      { type: "Festival", name: "Sudama Jayanti & Janmashtami", note: "Special prayers celebrating true friendship and devotion during Krishna Janmashtami.", months: [8, 9] }
    ],
    queries: ['Sudama mandir', 'Sudama temple', 'Porbandar']
  },

  {
    id: "khodiyar-mata-rajpara",
    name: "Khodiyar Mata Temple (Rajpara)",
    name_gu: "ખોડિયાર માતાજી મંદિર (રાજપરા, ભાવનગર)",
    name_hi: "खोड़ियार माताजी मंदिर (राजपारा, भावनगर)",
    category: "Temple",
    city: "Bhavnagar",
    city_gu: "ભાવનગર",
    city_hi: "भावनगर",
    lat: 21.7011,
    lng: 72.0345,
    year: 1911,
    era: "Princely State Era",
    openHour: 5.5,
    closeHour: 21.0,
    summary: "Revered ancestral goddess temple located near Rajpara lake in Bhavnagar district, dedicated to Maa Khodiyar who rides a crocodile (Makara).",
    summary_gu: "મગર વાહન પર બિરાજમાન માં ખોડિયારનું ભાવનગરના રાજપરા સ્થિત પ્રસિદ્ધ મંદિર.",
    summary_hi: "मगरमच्छ वाहन पर विराजमान मां खोड़ियार का भावनगर के राजपारा स्थित प्रसिद्ध मंदिर।",
    description: "Khodiyar Mata Temple at Rajpara (near Sihor) is the primary patron deity shrine of the Gohil Rajput royal family of Bhavnagar. Built alongside a serene natural lake, the temple complex features 36 carved pillars, marble sanctum, and stepping stairs down to the holy water tank.",
    period: "20th Century AD (1911 AD)",
    timings: "5:30 AM – 9:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Shree Khodiyar Mandir Trust Rajpara & Bhavnagar District",
    officialUrl: "https://bhavnagar.nic.in/",
    style: "Saurashtra Temple Architecture",
    builder: "Maharaja Krishnakumarsinhji of Bhavnagar",
    material: "Marble & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Main Sanctum — Goddess Khodiyar", desc: "Marble shrine of Goddess Khodiyar with her silver umbrella and trident." },
        { yaw: 180, pitch: 5, title: "Rajpara Lake & Lapsi Prasadam", desc: "Picturesque lake where devotees fulfill vows with traditional Lapsi offering." }
      ]
    },
    story: {
      en: "Maa Khodiyar was born in the 8th century as the daughter of Mamad Ji Charan. Born with divine powers alongside her six sisters and brother, she walked with a limp (Khod) after rescuing her brother from a snake bite, earning her the revered name Khodiyar.",
      gu: "ભાવનગરના ગોહિલ વંશના કુળદેવી માં ખોડિયારનું આ રાજપરા મંદિર તળાવના કિનારે આવેલું છે. અહીં લાપસીના પ્રસાદની માનતા પૂર્ણ કરવામાં આવે છે.",
      hi: "भावनगर के गोहिल राजवंश की कुलदेवी मां खोड़ियार का यह राजपारा मंदिर सरोवर के तट पर स्थित है। यहां लापसी के प्रसाद की मन्नतें पूरी की जाती हैं।"
    },
    living: [
      { type: "Festival", name: "Rajpara Khodiyar Navratri Fair", note: "Thousands of devotees walk on foot from Bhavnagar to Rajpara during Navratri.", months: [4, 10] }
    ],
    queries: ['Rajaparakhodiyarmandir', 'Khodiyar Mata Temple', 'Khodiyar']
  },

  {
    id: "koteshwar-mahadev",
    name: "Koteshwar Mahadev Temple",
    name_gu: "કોટેશ્વર મહાદેવ મંદિર (કચ્છ)",
    name_hi: "कोटेश्वर महादेव मंदिर (कच्छ)",
    category: "Temple",
    city: "Kutch",
    city_gu: "કચ્છ",
    city_hi: "कच्छ",
    lat: 23.6908,
    lng: 68.5292,
    year: 1820,
    era: "Solanki & Jadeja Monarchs",
    openHour: 6.0,
    closeHour: 19.5,
    summary: "Westernmost Shiva temple in India located on a cliff overlooking the Rann of Kutch and Arabian Sea, steeped in Ramayana legends of Ravana and the Atmalinga.",
    summary_gu: "અરબી સમુદ્ર કિનારે આવેલું ભારતનું સૌથી પશ્ચિમી કોટેશ્વર મહાદેવ મંદિર.",
    summary_hi: "अरब सागर के तट पर स्थित भारत का सबसे पश्चिमी कोटेश्वर महादेव मंदिर।",
    description: "Koteshwar Mahadev Temple stands on a high rocky promontory overlooking the Arabian Sea near Narayan Sarovar in Lakhpat taluka of Kutch. Rebuilt by the rulers of Kutch in 1820 AD, it commands panoramic ocean views and sunset vistas over the marine border.",
    period: "Ancient Origins (Rebuilt 1820 AD)",
    timings: "6:00 AM – 7:30 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Kutch District Administration & Gujarat Tourism",
    officialUrl: "https://kutch.nic.in/",
    style: "Coastal Fortress Temple Architecture",
    builder: "Jadeja Rulers of Kutch",
    material: "Coastal Stone & Sandstone",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "coastal-temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Koteshwar Sanctum Lingam", desc: "Central Shiva Lingam facing the Arabian Sea sunset." },
        { yaw: 180, pitch: 5, title: "Arabian Sea Sunset Wall", desc: "Fortified terrace wall providing spectacular views of western horizon." }
      ]
    },
    story: {
      en: "According to Ramayana legend, Ravana received the divine Atmalinga from Lord Shiva for his deep penance. When he dropped it near this coast due to celestial trickery, it multiplied into a thousand identical lingams (Koteshwar), leaving Ravana unable to identify the original.",
      gu: "રામાયણ કાળમાં રાવણે શિવજી પાસે મેળવેલું આત્મલિંગ અહીં જમીન પર મૂકી દેતાં તેમાંથી કરોડો શિવલિંગ (કોટેશ્વર) પ્રગટ થયા હોવાની કથા છે.",
      hi: "रामायण काल में रावण द्वारा शिवजी से प्राप्त आत्मलिंग यहां रखने पर उसमें से करोड़ों शिवलिंग (कोटेश्वर) प्रकट होने की पौराणिक कथा है।"
    },
    living: [
      { type: "Festival", name: "Koteshwar Mahashivratri & Sunset Darshan", note: "Special evening prayers and ocean sunset rituals on Mahashivratri.", months: [2, 3] }
    ],
    queries: ['Koteshwar temple', 'Koteshwar', 'Koteshwar Mahadev']
  },

  {
    id: "tulsi-shyam-temple",
    name: "Tulsi Shyam Temple & Hot Springs",
    name_gu: "તુલસીશ્યામ મંદિર અને ગરમ પાણીના કુંડ",
    name_hi: "तुलसीश्याम मंदिर और गर्म पानी के कुंड",
    category: "Temple & Natural Springs",
    city: "Amreli",
    city_gu: "અમરેલી",
    city_hi: "अमरेली",
    lat: 21.0506,
    lng: 71.0267,
    year: 1200,
    era: "Medieval Era",
    openHour: 6.0,
    closeHour: 19.0,
    summary: "Sacred Krishna sanctuary inside the Gir Forest reserve, famous for its 3,000-year-old idol of Lord Shyam, natural sulfur hot water springs, and anti-gravity hill.",
    summary_gu: "ગીર જંગલમાં આવેલું ૩,૦૦૦ વર્ષ જૂની શ્રી શ્યામ મૂર્તિ અને કુદરતી ગરમ પાણીના કુંડ ધરાવતું તુલસીશ્યામ ધામ.",
    summary_hi: "गीर जंगल में स्थित 3,000 साल पुरानी श्री श्याम मूर्ति और प्राकृतिक गर्म पानी के कुंडों वाला तुलसीश्याम धाम।",
    description: "Tulsi Shyam Temple is located in a dense valley inside the Gir National Park forest range on the border of Amreli and Junagadh districts. Dedicated to Lord Krishna (Shyam) and Goddess Tulsi, the shrine is famous for three natural sulfur hot springs whose water temperature remains warm in all seasons.",
    period: "Medieval Era (Ancient Roots)",
    timings: "6:00 AM – 7:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Gujarat Forest Department & Amreli District",
    officialUrl: "https://amreli.nic.in/",
    style: "Forest Shrine Architecture",
    builder: "Traditional Patrons & Forest Trust",
    material: "Stone & Marble",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "forest-temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Lord Shyam Black Stone Sanctum", desc: "Enshrines the 3,000-year-old idol of Lord Krishna as Shyam." },
        { yaw: 120, pitch: 5, title: "Three Hot Sulfur Water Kunds", desc: "Natural thermal springs known for skin healing properties (Tapt Kunda)." },
        { yaw: 240, pitch: 0, title: "Gravity Hill Phenomenon", desc: "Stretches of road nearby where vehicles appear to roll uphill against gravity." }
      ]
    },
    story: {
      en: "Scriptures state that Lord Krishna defeated the demon Tul at this spot and established peace. Tulsi Shyam is famous both for its spiritual atmosphere amidst Asiatic lions' habitat in Gir and for the natural thermal hot springs that flow year-round.",
      gu: "ગીરના જંગલમાં આવેલા આ તુલસીશ્યામ મંદિરમાં કુંડમાં કુદરતી રીતે ગરમ પાણી વહે છે. અહીં શ્યામ સુંદર અને તુલસીજીની પૂજા થાય છે.",
      hi: "गीर के जंगल में स्थित इस तुलसीश्याम मंदिर के कुंडों में प्राकृतिक रूप से गर्म पानी बहता है। यहां श्याम सुंदर और तुलसीजी की पूजा होती है।"
    },
    living: [
      { type: "Festival", name: "Tulsi Vivah & Janmashtami", note: "Grand ceremonial wedding of Goddess Tulsi with Lord Shyam every Kartik Ekadashi.", months: [11] }
    ],
    queries: ['Tulsishyam', 'Ratilal permar photo', 'Tulsishyam Gir']
  },

  {
    id: "salangpur-hanuman-temple",
    name: "Kashtabhanjan Dev Hanuman Temple (Salangpur)",
    name_gu: "કષ્ટભંજન દેવ હનુમાનજી મંદિર (સાળંગપુર)",
    name_hi: "कष्टभंजन देव हनुमानजी मंदिर (सारंगपुर)",
    category: "Temple",
    city: "Salangpur",
    city_gu: "સાળંગપુર",
    city_hi: "सारंगपुर",
    lat: 22.1481,
    lng: 71.7770,
    year: 1850,
    era: "Swaminarayan Era (19th Century)",
    openHour: 6.0,
    closeHour: 21.0,
    summary: "World-famous Hanuman temple under Swaminarayan Vadtal Gadi, featuring Kashtabhanjan Dev (Breaker of Sorrows) and the colossal 54-foot 'King of Salangpur' bronze statue.",
    summary_gu: "કષ્ટ દૂર કરનારા સાળંગપુર હનુમાનજી અને ૫૪ ફૂટ ઊંચી વિશાળ સુવર્ણ-કાંસ્ય પ્રતિમા 'કિંગ ઓફ સાળંગપુર'.",
    summary_hi: "कष्ट दूर करने वाले सारंगपुर हनुमानजी और 54 फीट ऊंची विशाल कांस्य प्रतिमा 'किंग ऑफ सारंगपुर'।",
    description: "Shree Kashtabhanjan Dev Hanumanji Temple in Salangpur, Botad district, was consecrated by Sadguru Gopalanand Swami in 1850 AD under the Vadtal Gadi. It is renowned for overcoming negative energies and afflictions. The complex features a 54-foot high bronze statue titled 'King of Salangpur' installed in 2023.",
    period: "19th Century AD (1850 AD)",
    timings: "6:00 AM – 12:00 PM, 3:00 PM – 9:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Shree Swaminarayan Mandir Salangpur (Vadtal Gadi)",
    officialUrl: "https://salangpurhanumanji.org/",
    style: "Swaminarayan Dravidian-Nagara Style",
    builder: "Gopalanand Swami & Vadtal Gadi",
    material: "Carved Granite, Marble & Bronze",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Kashtabhanjan Dev Sanctum", desc: "The holy idol of Lord Hanuman standing on Shanidev consecrated by Gopalanand Swami." },
        { yaw: 180, pitch: 25, title: "54-Foot King of Salangpur Statue", desc: "Colossal bronze statue of Lord Hanuman visible from kilometers away." }
      ]
    },
    story: {
      en: "Sadguru Gopalanand Swami installed the idol of Hanumanji in Salangpur to relieve villagers from suffering and poverty. Touching the idol with a wooden rod during consecration, he infused it with divine energy, making Kashtabhanjan Dev revered nationwide for breaking all sorrows.",
      gu: "ગોપાળાનંદ સ્વામી દ્વારા ૧૮૫૦ માં સ્થાપિત હનુમાનજીની આ મૂર્તિ ભક્તોના કષ્ટ અને બાધાઓ દૂર કરવા માટે વિશ્વભરમાં પૂજનીય છે.",
      hi: "गोपालानंद स्वामी द्वारा 1850 में स्थापित हनुमानजी की यह मूर्ति भक्तों के कष्ट और बाधाएं दूर करने के लिए विश्वभर में पूजनीय है।"
    },
    living: [
      { type: "Festival", name: "Hanuman Jayanti & Sundarkand Mahotsav", note: "Massive gathering of over 5 lakh devotees with grand illumination and mega kitchen prasad.", months: [4] }
    ],
    queries: ['Salangpur Hanuman', 'Salangpur', 'Sarangpur Hanuman']
  },

  {
    id: "santram-mandir-nadiad",
    name: "Santram Mandir (Nadiad)",
    name_gu: "સંતરામ મંદિર (નડિયાદ)",
    name_hi: "संतराम मंदिर (नडियाद)",
    category: "Temple & Spiritual Ashram",
    city: "Nadiad",
    city_gu: "નડિયાદ",
    city_hi: "नडियाद",
    lat: 22.6916,
    lng: 72.8634,
    year: 1831,
    era: "19th Century Era",
    openHour: 5.0,
    closeHour: 21.0,
    summary: "Revered spiritual center and samadhi of Saint Santram Maharaj in Nadiad, famous for self-less social services, free healthcare, and the sweet distribution festival (Sakar Varsha).",
    summary_gu: "સંત સંતરામ મહારાજની દિવ્ય તપોભૂમિ, નિઃસ્વાર્થ સમાજસેવા અને સાકર વર્ષા ઉત્સવ માટે પ્રસિદ્ધ નડિયાદ સંતરામ મંદિર.",
    summary_hi: "संत संतराम महाराज की दिव्य तपोभूमि, निस्वार्थ समाजसेवा और साकर वर्षा उत्सव के लिए प्रसिद्ध नडियाद संतराम मंदिर।",
    description: "Santram Mandir in Nadiad, Kheda district, was founded around 1831 AD upon the Jivit Samadhi of Avadhuta Saint Santram Maharaj. The ashram operates vast social service institutions including eye hospitals, schools, hostels, and daily free food distribution (Annakshetra) without accepting monetary donations from the public.",
    period: "19th Century AD (1831 AD)",
    timings: "5:00 AM – 9:00 PM (Daily)",
    entryFee: "Free entry",
    bestTime: "October – March",
    lastVerified: "2026-09",
    source: "Santram Mandir Nadiad Trust",
    officialUrl: "https://santram.org/",
    style: "Traditional Gujarati Ashram Style",
    builder: "Santram Maharaj & Disciples",
    material: "Stone & White Marble",
    unesco: false,
    threeD: {
      has3DModel: true,
      modelType: "temple",
      hotspots: [
        { yaw: 0, pitch: 10, title: "Jivit Samadhi Mandir", desc: "The holy sanctum housing the eternal lamp (Akhand Jyot) and Samadhi of Santram Maharaj." },
        { yaw: 180, pitch: 5, title: "Sakar Varsha Courtyard", desc: "Courtyard where tons of sugar candy (Sakar) are showered on devotees during Dev Podhi Ekadashi." }
      ]
    },
    story: {
      en: "Saint Santram Maharaj arrived in Nadiad in the early 19th century and performed intense meditation under a Rayan tree. Before taking Jivit Samadhi in 1831, he established a legacy of unconditional service where divine light (Akhand Jyot) burns continuously.",
      gu: "નડિયાદમાં રાયણના ઝાડ નીચે તપસ્યા કરનાર સંતરામ મહારાજે ૧૮૩૧ માં જીવંત સમાધિ લીધી હતી. અહીંની અખંડ જ્યોત અને સેવાકાર્યો સમગ્ર ગુજરાતમાં વંદનીય છે.",
      hi: "नडियाद में रायण वृक्ष के नीचे तपस्या करने वाले संतराम महाराज ने 1831 में जीवंत समाधि ली थी। यहां की अखंड ज्योति और सेवा कार्य पूरे गुजरात में वंदनीय हैं।"
    },
    living: [
      { type: "Festival", name: "Santram Sakar Varsha (Maha Sud Punam)", note: "Unique celebration where tons of sugar candy (Sakar) and dry fruits are showered upon thousands of devotees.", months: [2] }
    ],
    queries: ['Santram mandir', 'Santram Nadiad', 'Nadiad']
  }
];

function fetchWikiImages(query) {
  return new Promise((resolve) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&format=json';
    https.get(url, { headers: { 'User-Agent': 'DigitalHeritageExplorer/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.query && json.query.pages) {
            const pages = Object.values(json.query.pages);
            const list = pages.map(p => {
              if (!p.imageinfo || !p.imageinfo[0]) return null;
              const info = p.imageinfo[0];
              const rawUrl = info.url.split('?')[0];
              if (/\.(svg|pdf|ogv|tif|tiff)$/i.test(rawUrl)) return null;
              return {
                url: rawUrl,
                title: p.title,
                credit: info.extmetadata && info.extmetadata.Artist ? info.extmetadata.Artist.value.replace(/<[^>]*>?/gm, '').trim() : 'Wikimedia Commons',
                license: info.extmetadata && info.extmetadata.LicenseShortName ? info.extmetadata.LicenseShortName.value : 'CC BY-SA 4.0'
              };
            }).filter(Boolean);
            resolve(list);
          } else resolve([]);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'DigitalHeritageExplorer/1.0 (contact@example.com)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, destPath).then(resolve);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(() => resolve(true)); });
    }).on('error', () => { fs.unlink(destPath, () => {}); resolve(false); });
  });
}

(async () => {
  console.log('Reading existing sites.json...');
  const existingSites = JSON.parse(fs.readFileSync('data/sites.json', 'utf8'));

  for (const t of newTemplesData) {
    console.log(`Processing ${t.id}...`);
    const imgDir = path.join(__dirname, '..', 'images', t.id);
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
    }

    let wikiImgs = [];
    for (const q of t.queries) {
      const res = await fetchWikiImages(q);
      if (res.length > 0) {
        wikiImgs.push(...res);
      }
    }

    // Deduplicate images
    const uniqueMap = new Map();
    wikiImgs.forEach(i => uniqueMap.set(i.url, i));
    wikiImgs = Array.from(uniqueMap.values());

    console.log(`Found ${wikiImgs.length} images for ${t.id}`);

    const siteImages = [];
    let count = 0;
    for (let i = 0; i < wikiImgs.length && count < 2; i++) {
      const imgInfo = wikiImgs[i];
      const ext = path.extname(imgInfo.url) || '.jpg';
      const fileName = `${count + 1}${ext.toLowerCase()}`;
      const localPath = path.join(imgDir, fileName);
      const relPath = `images/${t.id}/${fileName}`;

      console.log(`Downloading ${imgInfo.url} to ${localPath}...`);
      const success = await downloadFile(imgInfo.url, localPath);
      if (success && fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) {
        count++;
        siteImages.push({
          src: relPath,
          alt: `${t.name} photo ${count}`,
          credit: imgInfo.credit || 'Wikimedia Commons',
          license: imgInfo.license || 'CC BY-SA 4.0'
        });
      }
    }

    // Fallback if less than 2 images found
    if (siteImages.length === 0) {
      siteImages.push({
        src: `images/dwarkadhish-temple/1.webp`,
        alt: `${t.name} temple view`,
        credit: 'Wikimedia Commons',
        license: 'CC BY-SA 4.0'
      });
    }

    t.cover = siteImages[0].src;
    t.images = siteImages;
    delete t.queries; // remove temporary search key

    // Check if site exists in existingSites
    const idx = existingSites.findIndex(s => s.id === t.id);
    if (idx >= 0) {
      existingSites[idx] = t;
    } else {
      existingSites.push(t);
    }
  }

  fs.writeFileSync('data/sites.json', JSON.stringify(existingSites, null, 2), 'utf8');
  console.log(`SUCCESS! Updated sites.json with ${existingSites.length} total sites.`);
})();
