const fs = require('fs');
const path = 'c:/Users/ASUS/Documents/GitHub/Digital-Heritage-Explorer/data/sites.json';

const stories = {
  "rani-ki-vav": {
    en: "Welcome to Rani ki Vav, the Queen's Stepwell in Patan. Built in 1063 AD by Queen Udayamati in memory of King Bhimdev I of the Solanki dynasty, this subterranean masterpiece is designed as an inverted temple. Descending seven storeys into the earth, it holds over 500 major sculptures of Lord Vishnu, celestial apsaras, and guardian deities. Submerged under Saraswati river silt for centuries, its sandstones were preserved in pristine detail until archaeological excavation restored it to the world.",
    gu: "પાટણમાં આવેલી રાણી કી વાવમાં આપનું સ્વાગત છે. સોલંકી વંશના રાજા ભીમદેવ પહેલાની યાદમાં રાણી ઉદયમતી દ્વારા ૧૦૬૩ માં બંધાવવામાં આવેલી આ વાવ જમીનની અંદર ઊંધા મંદિર આકારે કંડારેલી સ્થાપત્યની ઉત્કૃષ્ટ રચના છે. સાત માળ ઊંડે ઊતરતી આ વાવમાં ભગવાન વિષ્ણુ, અપ્સરાઓ અને દેવતાઓની ૫૦૦ થી વધુ અદ્ભુત મુર્તિઓ કોતરેલી છે. સદીઓ સુધી સરસ્વતી નદીના પૂરમાં દટાયેલી રહેવાને કારણે તેના પથ્થરો આજે પણ સુરક્ષિત રહેલા છે.",
    hi: "पाटन की रानी की वाव में आपका स्वागत है। 1063 ईस्वी में सोलंकी राजवंश के राजा भीमदेव प्रथम की याद में रानी उदयामती द्वारा निर्मित यह बावड़ी एक उल्टे मंदिर के रूप में बनाई गई है। सात मंजिलों में गहराई तक जाती इस वाव में भगवान विष्णु, अप्सराओं और देवताओं की 500 से अधिक मूर्तियां उकेरी गई हैं। सदियों तक सरस्वती नदी की गाद में दबे रहने के कारण इसके बलुआ पत्थर आज भी सुरक्षित हैं।"
  },
  "modhera-sun-temple": {
    en: "Welcome to the Sun Temple at Modhera, built in 1026 AD by King Bhima I of the Solanki dynasty. Set along the Pushpavati River, this temple is designed so that during the Vernal and Autumnal Equinoxes, the first golden rays of the rising sun pass through the Torana arches, across the 52-pillared Sabha Mandapa, and directly illuminate the golden sanctum. Step along the Surya Kunda, a magnificent stepped water tank lined with 108 miniature shrines.",
    gu: "મોઢેરા સૂર્ય મંદિરમાં આપનું સ્વાગત છે. સોલંકી વંશના રાજા ભીમદેવ પહેલા દ્વારા ૧૦૨૬ માં પુષ્પાવતી નદી કિનારે આ મંદિરનું નિર્માણ કરાયું હતું. આ મંદિર એ રીતે રચાયેલું છે કે વિષુવવૃત્તીય દિન (ઇક્વિનોક્સ) પર ઊગતા સૂર્યનું પહેલું કિરણ ૫૨ સ્તંભોવાળા સભા મંડપમાંથી પસાર થઈને સીધું ગર્ભગૃહમાં પ્રવેશે છે. મંદિર સામે આવેલો સૂર્યકુંડ ૧૦૮ નાના મંદિરોથી સુશોભિત છે.",
    hi: "मोढेरा सूर्य मंदिर में आपका स्वागत है। 1026 ईस्वी में सोलंकी वंश के राजा भीम प्रथम द्वारा पुष्पावती नदी के तट पर निर्मित यह मंदिर स्थापत्य का अद्भुत नमूना है। यह मंदिर इस तरह संरेखित है कि विषुव (इक्विनोक्स) के दिन सूर्य की पहली किरणें सभा मंडप से होती हुई सीधे गर्भगृह को आलोकित करती हैं। सूर्य कुंड के चारों ओर 108 लघु मंदिर बने हुए हैं।"
  },
  "adalaj-stepwell": {
    en: "Welcome to Adalaj Stepwell, constructed in 1498 AD by Queen Rudabai in memory of Rana Veer Singh. Descending five storeys underground, this sandstone structure harmonizes Hindu Solanki floral motifs with Islamic geometric jali carvings. Designed as a cool retreat for weary travelers and caravans, the underground galleries maintain a temperature five degrees cooler than the scorching summer air above.",
    gu: "અડાલજની વાવમાં આપનું સ્વાગત છે. ૧૪૯૯ માં રાણી રુદાબાઈ દ્વારા પોતાના પતિ રાણા વીરસિંહની સ્મૃતિમાં આ વાવ બંધાવવામાં આવી હતી. પાંચ માળ ઊંડી આ સુંદર વાવ હિન્દુ અને ઇસ્લામિક સ્થાપત્ય શૈલીનો અદ્ભુત સંગમ છે. મુસાફરો અને વેપારીઓ માટે વિશ્રામસ્થળ તરીકે બનેલી આ વાવમાં બહારના તાપમાન કરતાં ૫ ડિગ્રી સેલ્સિયસ જેટલી વધુ ઠંડક રહે છે.",
    hi: "अडालज की बावड़ी में आपका स्वागत है। 1498 ईस्वी में रानी रूदाबाई द्वारा अपने पति राणा वीर सिंह की स्मृति में निर्मित यह 5 मंजिल गहरी बावड़ी हिंदू और इस्लामिक स्थापत्य शैली का अनूठा संगम है। यात्रियों के विश्राम के लिए बनाई गई यह बावड़ी ऊपर के गर्म तापमान की तुलना में 5 डिग्री अधिक ठंडी रहती है।"
  },
  "sarkhej-roza": {
    en: "Welcome to Sarkhej Roza, known as the Acropolis of Ahmedabad. Constructed in the 15th century, this royal complex surrounds a vast 17-acre artificial lake. Dedicated to Sufi saint Shaikh Ahmed Ganj Baksh, it includes grand mausoleums, central mosques, and royal summer palaces built by Sultan Ahmed Shah and Sultan Mahmud Begada, showcasing delicate stone lattice jali work.",
    gu: "સરખેજ રોઝામાં આપનું સ્વાગત છે. અમદાવાદના એક્રોપોલિસ તરીકે જાણીતું આ સૂફી સંત શેખ અહમદ ગંજ બક્ષનું મકબરો અને મહેલ સંકુલ ૧૫મી સદીમાં સલ્તનત યુગ દરમિયાન બંધાયું હતું. ૧૭ એકરમાં ફેલાયેલા વિશાળ તળાવ કિનારે આવેલા આ રોઝામાં બારીક પથ્થરની જાળીઓ, રોયલ મહેલો અને મસ્જિદો આવેલી છે.",
    hi: "सरखेज रोजा में आपका स्वागत है। अहमदाबाद का एक्रोपोलिस कहा जाने वाला यह 15वीं सदी का सूफी संत शेख अहमद गंज बख्श का मकबरा परिसर है। 17 एकड़ में फैली कृत्रिम झील के किनारे निर्मित इस परिसर में राजसी मकबरे, मस्जिदें और ग्रीष्मकालीन महल बने हैं जो पत्थर की नक्काशीदार जाली के काम के लिए प्रसिद्ध हैं।"
  },
  "champaner-pavagadh": {
    en: "Welcome to Champaner-Pavagadh Archaeological Park, a UNESCO World Heritage landscape spanning prehistoric sites, Hindu hill fort ruins on Pavagadh, and a pristine 16th-century Islamic capital. Explore the Jami Masjid with its grand central dome and soaring minarets, surrounded by ancient stepwells, fortifications, and Kalika Mata temple atop Pavagadh hill.",
    gu: "ચાંપાનેર-પાવાગઢ પુરાતત્વીય પાર્કમાં આપનું સ્વાગત છે. યુનેસ્કો હેરિટેજ સ્થળ તરીકે અંકિત આ વિસ્તારમાં પાવાગઢ ડુંગર પરના પ્રાચીન કિલ્લા અને ૧૬મી સદીની સુલતાન મહમૂદ બેગડા દ્વારા વસાવેલી રાજધાનીના અવશેષો છે. વિશાળ ઘુમ્મટ અને મિનારા ધરાવતી જામા મસ્જિદ તથા પહાડ પરનું કાલિકા માતાજીનું મંદિર અહીંના મુખ્ય આકર્ષણો છે.",
    hi: "चांपानेर-पावागढ़ पुरातत्व पार्क में आपका स्वागत है। यह यूनेस्को विश्व धरोहर स्थल प्रागैतिहासिक अवशेषों, पावागढ़ की पहाड़ी के किले और 16वीं सदी की सुल्तान महमूद बेगड़ा की राजधानी का अद्भुत संगम है। विशाल गुंबद और मीनारों वाली जामा मस्जिद तथा पहाड़ी पर स्थित कालिका माता मंदिर यहां के मुख्य आकर्षण हैं।"
  },
  "dholavira": {
    en: "Welcome to Dholavira, a 5,000-year-old Harappan metropolis located on Khadir Bet in the Great Rann of Kutch. Flourishing between 2600 and 1900 BCE, Dholavira features sophisticated urban planning, massive stone-cut water reservoirs, underground storm drains, a ceremonial stadium, and the famous 10-sign Indus script signboard.",
    gu: "ધોળાવીરા હડપ્પન શહેરમાં આપનું સ્વાગત છે. કચ્છના રણમાં ખદીરબેટ પર આવેલું આ ૫,૦૦૦ વર્ષ જૂનું સિંધુ ખીણની સભ્યતાનું મહાનગર ઈ.સ. પૂર્વે ૨૬૦૦ થી ૧૯૦૦ દરમિયાન ધમધમતું હતું. અહીં પથ્થરથી કાપેલા વિશાળ જળાશયો, નગર આયોજન, ભૂગર્ભ ગટર વ્યવસ્થા અને ૧૦ સાઇનવાળું સાઇનબોર્ડ મળી આવ્યું છે.",
    hi: "धौलावीरा में आपका स्वागत है। कच्छ के महान रण में खदीर बेट पर स्थित यह 5,000 साल पुराना हड़प्पा महानगर ईसा पूर्व 2600 से 1900 के बीच समृद्ध था। धोलावीरा अपनी उन्नत नगर योजना, विशाल पत्थरों से तराशे गए जलाशयों, भूमिगत जल निकासी प्रणाली और 10-चिह्नों वाले सिंधु लिपि साइनबोर्ड के लिए प्रसिद्ध है।"
  },
  "somnath-temple": {
    en: "Welcome to the sacred Somnath Temple, the first among the twelve holy Jyotirlinga shrines of Lord Shiva, situated right on the shore of the Arabian Sea. Rebuilt in 1951 in traditional Maru-Gurjara architectural style under Sardar Vallabhbhai Patel, the temple features a 155-foot high spire and the historic Baan Stambha arrow pillar pointing straight to Antarctica.",
    gu: "પવિત્ર સોમનાથ મંદિરમાં આપનું સ્વાગત છે. અરબી સમુદ્રના કિનારે આવેલું આ મંદિર ભગવાન શિવના ૧૨ જ્યોતિર્લિંગોમાં સર્વપ્રથમ માનવામાં આવે છે. સરદાર વલ્લભભાઈ પટેલના નેતૃત્વમાં ૧૯૫૧ માં મારુ-ગુર્જર શૈલીમાં નિર્માણ પામેલું આ ભવ્ય મંદિર ૧૫૫ ફૂટ ઊંચું શિખર અને દક્ષિણ ધ્રુવ તરફ નિર્દેશ કરતો બાણસ્તંભ ધરાવે છે.",
    hi: "पवित्र सोमनाथ मंदिर में आपका स्वागत है। अरब सागर के तट पर स्थित यह मंदिर भगवान शिव के 12 ज्योतिर्लिंगों में प्रथम माना जाता है। 1951 में सरदार वल्लभभाई पटेल के प्रयासों से मारू-गुर्जर शैली में पुनर्निर्मित यह भव्य मंदिर 155 फीट ऊंचा शिखर और अंटार्कटिका की ओर इशारा करने वाला बाण स्तंभ रखता है।"
  },
  "lothal": {
    en: "Welcome to Lothal, the ancient Harappan port city dating back to 2400 BCE. Lothal contained the world's earliest known tidal dockyard, expertly engineered to connect the Sabarmati river basin with the Gulf of Khambhat for maritime trade with Mesopotamia and Egypt. Explore its bead-making workshops, seal pressings, and brick drainage systems.",
    gu: "લોથલ હડપ્પન બંદરમાં આપનું સ્વાગત છે. ઈ.સ. પૂર્વે ૨૪૦૦ ના સમયનું આ શહેર વિશ્વની સૌથી જૂની ભરતી-ઓટ આધારિત ગોદી (ડોકયાર્ડ) ધરાવે છે. સાબરમતી નદી મારફતે ખંભાતના અખાત સાથે જોડાઈને મોસોપોટેમિયા અને ઇજિપ્ત સાથે દરિયાઈ વેપાર થતો હતો. અહીં મોતી બનાવવાની વર્કશોપ અને પ્રાચીન સીલ મળેલા છે.",
    hi: "लोथल हड़प्पा बंदरगाह शहर में आपका स्वागत है। ईसा पूर्व 2400 का यह शहर दुनिया के सबसे पुराने ज्वारीय गोदी (डॉक्यार्ड) के लिए प्रसिद्ध है। साबरमती नदी के माध्यम से खंभात की खाड़ी से जुड़कर मेसोपोटामिया और मिस्र के साथ समुद्री व्यापार होता था। यहां मनके बनाने की कार्यशालाएं और प्राचीन मुहरें मिली हैं।"
  },
  "uparkot-fort": {
    en: "Welcome to Uparkot Fort in Junagadh, an ancient Mauryan citadel founded in 319 BCE by Chandragupta Maurya. Standing on a high plateau, its 20-meter high walls survived sixteen historical sieges. Explore the 2nd-century rock-cut Buddhist caves, the deep Adi Kadi Vav stepwell, and the massive brass cannons Neelam and Manek cast in Diu.",
    gu: "જૂનાગઢના ઉપરકોટ કિલ્લામાં આપનું સ્વાગત છે. ઈ.સ. પૂર્વે ૩૧૯ માં ચંદ્રગુપ્ત મૌર્ય દ્વારા સ્થાપિત આ પ્રાચીન કિલ્લો ૨૦ મીટર ઊંચી પથ્થરની દીવાલો ધરાવે છે. કિલ્લામાં બીજી સદીની બૌદ્ધ ગુફાઓ, અડી કડી વાવ, નવઘણ કુવો અને ૧૫૩૧ માં દીવમાં ઢાળવામાં આવેલી નીલમ અને માણેક નામની તોપો આવેલી છે.",
    hi: "जूनागढ़ के ऊपरकोट किले में आपका स्वागत है। ईसा पूर्व 319 में चंद्रगुप्त मौर्य द्वारा स्थापित यह प्राचीन किला 20 मीटर ऊंची पत्थर की दीवारों से घिरा है। किले के भीतर दूसरी सदी की बौद्ध गुफाएं, अड़ी कड़ी वाव, नवघन कुआं और दीव में ढाली गई ऐतिहासिक नीलम और माणिक तोपें स्थित हैं।"
  },
  "prag-mahal": {
    en: "Welcome to Prag Mahal and Aina Mahal in Bhuj, Kutch. Commissioned in 1865 by Maharao Pragmalji II, Prag Mahal was designed by British architect Colonel Henry Saint Clair Wilkins in Italian Gothic style. It features a 45-meter high clock tower offering panoramic views of Bhuj, alongside the 18th-century Aina Mahal Palace of Mirrors crafted by Ramsinh Malam.",
    gu: "ભુજના પ્રાગ મહેલ અને આયના મહેલમાં આપનું સ્વાગત છે. ૧૮૬૫ માં મહારાવ પ્રાગમલજી બીજા દ્વારા ઇટાલિયન ગોથિક શૈલીમાં આ મહેલ બંધાવાયો હતો. તેમાં ૪૫ મીટર ઊંચો ક્લોક ટાવર આવેલો છે જ્યાંથી સમગ્ર ભુજ શહેર જોઈ શકાય છે. બાજુમાં રામસંગ માલમ દ્વારા નિર્મિત અરીસાઓથી સજ્જ ૧૮મી સદીનો આયના મહેલ છે.",
    hi: "भुज के प्राग महल और आइना महल में आपका स्वागत है। 1865 में महाराव प्रागमलजी द्वितीय द्वारा इतालवी गोथिक शैली में निर्मित इस महल में 45 मीटर ऊंचा क्लॉक टॉवर है जिससे पूरे भुज शहर का मनोरम दृश्य दिखाई देता है। इसके पास ही रामसिंह मालम द्वारा बनाया गया 18वीं सदी का दर्पणों से सजा आइना महल स्थित है।"
  },
  "dwarkadhish-temple": {
    en: "Welcome to Dwarkadhish Temple, also known as Jagat Mandir, located in the holy city of Dwarka. Dedicated to Lord Krishna as the King of Dwarka, this sacred Char Dham site boasts a 72-meter high 5-storey spire supported by 60 carved limestone pillars. Standing at the confluence of the Gomti River and Arabian Sea, it flies a massive 52-yard flag changed five times daily.",
    gu: "દ્વારકાધીશ જગત મંદિરમાં આપનું સ્વાગત છે. પવિત્ર દ્વારકા નગરીમાં ગોમતી નદી અને અરબી સમુદ્રના સંગમ પર આવેલું ભગવાન કૃષ્ણનું આ પવિત્ર ચાર ધામ મંદિર ૭૨ મીટર ઊંચું શિખર અને ૬૦ સ્તંભો ધરાવે છે. આ મંદિર પર દરરોજ ૫ વખત ૫૨ ગજની ધજા ચડાવવામાં આવે છે.",
    hi: "द्वारकाधीश मंदिर (जगत मंदिर) में आपका स्वागत है। पवित्र द्वारका में गोमती नदी और अरब सागर के संगम पर स्थित भगवान कृष्ण का यह पवित्र चार धाम मंदिर 72 मीटर ऊंचा शिखर और 60 स्तंभ रखता है। मंदिर के शिखर पर प्रतिदिन 5 बार 52 गज की ध्वजा फहराई जाती है।"
  }
};

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.forEach(site => {
  if (stories[site.id]) {
    site.story = stories[site.id];
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added stories to sites.json');
