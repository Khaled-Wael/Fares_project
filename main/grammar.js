// ===================================================================
// قواعد مستوى A1 — كل الجرامر اللي محتاجه لمنهجك (Lektion 1-18)
// ===================================================================

const GRAMMAR = {

  pronouns: [
    ["ich","أنا"], ["du","أنت (غير رسمي)"], ["er / sie / es","هو / هي / هو-هي (لغير العاقل)"],
    ["wir","نحن"], ["ihr","أنتم (غير رسمي، جمع)"], ["sie","هم"], ["Sie","حضرتك / حضراتكم (رسمي)"],
  ],

  // نهايات تصريف الفعل المنتظم في المضارع + مثال كامل
  regularEndings: [
    ["ich","-e","spiele"], ["du","-st","spielst"], ["er/sie/es","-t","spielt"],
    ["wir","-en","spielen"], ["ihr","-t","spielt"], ["sie/Sie","-en","spielen"],
  ],
  regularExamples: [
    {inf:"machen", ar:"يعمل / يفعل", forms:["mache","machst","macht","machen","macht","machen"]},
    {inf:"wohnen", ar:"يسكن", forms:["wohne","wohnst","wohnt","wohnen","wohnt","wohnen"]},
    {inf:"kaufen", ar:"يشتري", forms:["kaufe","kaufst","kauft","kaufen","kauft","kaufen"]},
  ],

  // الأفعال الشاذة (تغيير حرف العلة) — زي ما وردت بالظبط في المنهج
  strongVerbs: [
    {inf:"lesen", change:"e → ie", ar:"يقرأ", du:"liest", er:"liest"},
    {inf:"sehen", change:"e → ie", ar:"يرى", du:"siehst", er:"sieht"},
    {inf:"fern|sehen", change:"e → ie", ar:"يشاهد التلفاز", du:"siehst fern", er:"sieht fern", sep:true},
    {inf:"aus|sehen", change:"e → ie", ar:"يبدو شكله", du:"siehst aus", er:"sieht aus", sep:true},
    {inf:"sprechen", change:"e → i", ar:"يتحدث", du:"sprichst", er:"spricht"},
    {inf:"essen", change:"e → i", ar:"يأكل", du:"isst", er:"isst"},
    {inf:"geben", change:"e → i", ar:"يعطي", du:"gibst", er:"gibt"},
    {inf:"nehmen", change:"e → i", ar:"يأخذ", du:"nimmst", er:"nimmt", note:"لاحظ: nehmen تاخد حرف m إضافي — nimmst / nimmt"},
    {inf:"mit|nehmen", change:"e → i", ar:"يأخذ معه", du:"nimmst mit", er:"nimmt mit", sep:true},
    {inf:"vergessen", change:"e → i", ar:"ينسى", du:"vergisst", er:"vergisst"},
    {inf:"treffen", change:"e → i", ar:"يقابل", du:"triffst", er:"trifft"},
    {inf:"helfen", change:"e → i", ar:"يساعد", du:"hilfst", er:"hilft"},
    {inf:"gefallen", change:"a → ä", ar:"يعجب", du:"gefällst", er:"gefällt"},
    {inf:"schlafen", change:"a → ä", ar:"ينام", du:"schläfst", er:"schläft"},
    {inf:"fahren", change:"a → ä", ar:"يقود / يسافر", du:"fährst", er:"fährt"},
    {inf:"ab|fahren", change:"a → ä", ar:"يغادر", du:"fährst ab", er:"fährt ab", sep:true},
    {inf:"tragen", change:"a → ä", ar:"يحمل / يرتدي", du:"trägst", er:"trägt"},
    {inf:"waschen", change:"a → ä", ar:"يغسل", du:"wäschst", er:"wäscht"},
    {inf:"an|fangen", change:"a → ä", ar:"يبدأ", du:"fängst an", er:"fängt an", sep:true},
    {inf:"halten", change:"a → ä", ar:"يتوقف / يمسك", du:"hältst", er:"hält"},
    {inf:"lassen", change:"a → ä", ar:"يترك", du:"lässt", er:"lässt"},
    {inf:"laufen", change:"au → äu", ar:"يجري / يمشي", du:"läufst", er:"läuft"},
  ],

  // الأفعال الشكلية Modalverben
  modalVerbs: [
    {inf:"können", ar:"يستطيع", forms:["kann","kannst","kann","können","könnt","können"]},
    {inf:"müssen", ar:"يجب أن", forms:["muss","musst","muss","müssen","müsst","müssen"]},
    {inf:"dürfen", ar:"يُسمح له أن", forms:["darf","darfst","darf","dürfen","dürft","dürfen"]},
    {inf:"wollen", ar:"يريد (بإصرار)", forms:["will","willst","will","wollen","wollt","wollen"]},
    {inf:"mögen", ar:"يحب", forms:["mag","magst","mag","mögen","mögt","mögen"]},
    {inf:"möchten", ar:"يريد (بأدب)", forms:["möchte","möchtest","möchte","möchten","möchtet","möchten"]},
  ],

  // الأفعال المساعدة الشهيرة الثلاثة
  irregular: [
    {inf:"sein", ar:"يكون", forms:["bin","bist","ist","sind","seid","sind"]},
    {inf:"haben", ar:"يملك", forms:["habe","hast","hat","haben","habt","haben"]},
    {inf:"werden", ar:"يصبح", forms:["werde","wirst","wird","werden","werdet","werden"]},
    {inf:"wissen", ar:"يعرف", forms:["weiß","weißt","weiß","wissen","wisst","wissen"], note:"شكل خاص — زي الأفعال الشكلية في المفرد"},
  ],

  // الأفعال المنفصلة (من كل الدروس)
  separableVerbs: [
    ["ab|spülen","يغسل الأطباق","Ich spüle die Teller ab."],
    ["auf|räumen","يرتّب","Ich räume mein Zimmer auf."],
    ["auf|stehen","يستيقظ","Ich stehe um sieben Uhr auf."],
    ["aus|leeren","يفرّغ","Er leert den Mülleimer aus."],
    ["ein|kaufen","يتسوّق","Wir kaufen im Supermarkt ein."],
    ["mit|bringen","يُحضر معه","Kannst du Kuchen mitbringen?"],
    ["an|probieren","يجرّب لبس","Sie probiert das Kleid an."],
    ["ein|laden","يدعو","Ich lade dich zur Party ein."],
    ["an|haben","يرتدي","Er hat eine Jacke an."],
    ["an|ziehen","يرتدي","Ich ziehe die Jacke an."],
    ["auf|machen","يفتح","Mach das Fenster auf!"],
    ["aus|gehen","يخرج","Wir gehen heute Abend aus."],
    ["aus|machen","يطفئ","Mach das Licht aus!"],
    ["fern|sehen","يشاهد التلفاز","Ich sehe abends fern."],
    ["zu|machen","يغلق","Mach die Tür zu!"],
    ["an|rufen","يتصل بالتليفون","Ruf mich bitte an!"],
    ["ab|holen","يستقبل","Mein Vater holt mich ab."],
    ["aus|steigen","ينزل من المركبة","Wir steigen am Bahnhof aus."],
    ["ein|steigen","يركب المركبة","Steig bitte schnell ein!"],
    ["an|kommen","يصل","Der Zug kommt um 8 Uhr an."],
    ["auf|passen","ينتبه","Pass bitte auf!"],
    ["mit|machen","يشارك","Machst du bei dem Spiel mit?"],
    ["kennen|lernen","يتعرّف على","Ich möchte dich kennenlernen."],
    ["weh|tun","يؤلم","Mein Kopf tut weh."],
  ],

  // النفي
  negation: [
    ["nicht", "لنفي الفعل أو الصفة أو كل الجملة", "Ich spiele nicht Fußball. / Das ist nicht schön."],
    ["kein / keine", "لنفي اسم مسبوق بـ ein/eine أو بدون أداة", "Ich habe kein Geld. / Das ist keine gute Idee."],
  ],

  // أدوات الاستفهام
  questionWords: [
    ["wer","من"], ["was","ماذا"], ["wie","كيف"], ["wo","أين"], ["wohin","إلى أين"],
    ["woher","من أين"], ["wann","متى"], ["warum","لماذا"], ["wie viel","كم (لغير المعدود)"],
    ["wie viele","كم (للمعدود)"], ["welche(r/s)","أيّ"],
  ],

  // حروف الجر
  prepAkk: ["durch","für","gegen","ohne","um"],
  prepDat: ["aus","bei","mit","nach","seit","von","zu"],
  prepWechsel: ["an","auf","hinter","in","neben","über","unter","vor","zwischen"],
  contractions: [
    ["in + dem","im","im Winter"], ["in + das","ins","ins Kino"],
    ["an + dem","am","am Montag"], ["an + das","ans","ans Fenster"],
    ["zu + dem","zum","zum Supermarkt"], ["zu + der","zur","zur Schule"],
    ["bei + dem","beim","beim Arzt"], ["von + dem","vom","vom Bahnhof"],
  ],

  // حالات الإعراب — أداة التعريف
  articleCases: {
    headers:["","مذكر (der)","مؤنث (die)","محايد (das)","جمع"],
    rows:[
      ["Nominativ (الفاعل)","der","die","das","die"],
      ["Akkusativ (المفعول به)","den","die","das","die"],
      ["Dativ (بعد حروف الجر)","dem","der","dem","den (+n)"],
    ]
  },
  articleIndefCases: {
    headers:["","مذكر (ein)","مؤنث (eine)","محايد (ein)"],
    rows:[
      ["Nominativ","ein","eine","ein"],
      ["Akkusativ","einen","eine","ein"],
      ["Dativ","einem","einer","einem"],
    ]
  },
  possessivRow: ["mein/dein/sein/ihr","+ نفس نهايات ein في كل الحالات (meinen Bruder، meiner Schwester...)"],

  pronounCases: {
    headers:["Nominativ","Akkusativ","Dativ","بالعربي"],
    rows:[
      ["ich","mich","mir","أنا"], ["du","dich","dir","أنت"],
      ["er","ihn","ihm","هو"], ["sie","sie","ihr","هي"], ["es","es","ihm","هو/هي (غير عاقل)"],
      ["wir","uns","uns","نحن"], ["ihr","euch","euch","أنتم"], ["sie/Sie","sie/Sie","ihnen/Ihnen","هم / حضرتك"],
    ]
  },

  pluralCodes: [
    ["-e","der Tisch → die Tische"], ["=e","der Saft → die Säfte (مع همزة)"],
    ["-er","das Kind → die Kinder"], ["=er","das Buch → die Bücher (مع همزة)"],
    ["-n / -en","die Tasche → die Taschen"], ["-s","das Auto → die Autos"],
    ["=","der Vater → die Väter (همزة بدون إضافة)"], ["( - ) بدون تغيير","der Lehrer → die Lehrer"],
  ],

  // ------------------------- الأمر (Imperativ) -------------------------
  imperativRules: [
    ["du (غير رسمي)", "جذر الفعل بس (من غير -st) — الأفعال اللي بتتغير e→i/ie بتاخد الشكل المتغير، أما a→ä فبترجع لأصلها من غير همزة", "mach! / sprich! / fahr!"],
    ["ihr (جمع غير رسمي)", "زي تصريف ihr في المضارع بالظبط", "macht! / sprecht! / fahrt!"],
    ["Sie (رسمي)", "المصدر + Sie", "Machen Sie! / Sprechen Sie! / Fahren Sie!"],
  ],
  imperativExamples: [
    ["machen","Mach deine Hausaufgabe!","Macht eure Hausaufgabe!","Machen Sie Ihre Hausaufgabe!","اعمل / اعملوا / اعملوا (رسمي) واجبك"],
    ["sprechen (e→i)","Sprich langsam!","Sprecht langsam!","Sprechen Sie langsam!","اتكلم / اتكلموا ببطء"],
    ["lesen (e→ie)","Lies das Buch!","Lest das Buch!","Lesen Sie das Buch!","اقرأ / اقروا الكتاب"],
    ["fahren (a→ä، بترجع للأصل)","Fahr nicht so schnell!","Fahrt nicht so schnell!","Fahren Sie nicht so schnell!","متسوقش بسرعة كده"],
    ["auf|stehen (منفصل)","Steh auf!","Steht auf!","Stehen Sie auf!","قوم / قوموا"],
    ["sein (شاذ)","Sei ruhig!","Seid ruhig!","Seien Sie ruhig!","اهدأ / اهدأوا"],
  ],

  // ------------------------- الماضي: بيرفكت -------------------------
  perfektRule: [
    "الماضي في الكلام اليومي بيتكوّن من: haben أو sein (مصرّف حسب الفاعل) + Partizip II في آخر الجملة.",
    "الأفعال العادية: ge + جذر الفعل + t → machen ← gemacht",
    "الأفعال الشاذة: ge + جذر (وممكن يتغيّر) + en → lesen ← gelesen، nehmen ← genommen",
    "الأفعال المنفصلة: ge بتدخل بين البادئة والفعل → aufstehen ← aufgestanden",
    "أفعال الحركة/تغيير الحالة (fahren, gehen, kommen...) بتاخد sein مش haben.",
  ],
  perfektExamples: [
    ["Ich habe Fußball gespielt.","أنا لعبت كورة."],
    ["Wir haben Pizza gegessen.","إحنا أكلنا بيتزا."],
    ["Er ist nach Berlin gefahren.","هو سافر لبرلين. (فعل حركة → sein)"],
    ["Ich bin um 7 Uhr aufgestanden.","أنا صحيت الساعة 7. (فعل منفصل + sein)"],
    ["Sie hat das Buch gelesen.","هي قرأت الكتاب."],
  ],
  partizipList: [
    ["machen","gemacht","haben"], ["spielen","gespielt","haben"], ["wohnen","gewohnt","haben"],
    ["kaufen","gekauft","haben"], ["hören","gehört","haben"], ["lernen","gelernt","haben"],
    ["arbeiten","gearbeitet","haben"], ["kochen","gekocht","haben"], ["suchen","gesucht","haben"],
    ["fragen","gefragt","haben"], ["kennen","gekannt","haben"], ["brauchen","gebraucht","haben"],
    ["haben","gehabt","haben"], ["sein","gewesen","sein"], ["werden","geworden","sein"],
    ["lesen","gelesen","haben"], ["sehen","gesehen","haben"], ["sprechen","gesprochen","haben"],
    ["essen","gegessen","haben"], ["geben","gegeben","haben"], ["nehmen","genommen","haben"],
    ["vergessen","vergessen","haben"], ["treffen","getroffen","haben"], ["helfen","geholfen","haben"],
    ["schlafen","geschlafen","haben"], ["tragen","getragen","haben"], ["waschen","gewaschen","haben"],
    ["halten","gehalten","haben"], ["lassen","gelassen","haben"], ["trinken","getrunken","haben"],
    ["singen","gesungen","haben"], ["schwimmen","geschwommen","sein"], ["finden","gefunden","haben"],
    ["schreiben","geschrieben","haben"], ["bleiben","geblieben","sein"], ["gehen","gegangen","sein"],
    ["kommen","gekommen","sein"], ["fahren","gefahren","sein"], ["fliegen","geflogen","sein"],
    ["laufen","gelaufen","sein"], ["aufstehen","aufgestanden","sein"], ["einkaufen","eingekauft","haben"],
    ["anrufen","angerufen","haben"], ["fernsehen","ferngesehen","haben"], ["aufräumen","aufgeräumt","haben"],
    ["ankommen","angekommen","sein"], ["einsteigen","eingestiegen","sein"], ["aussteigen","ausgestiegen","sein"],
  ],

  // ------------------------- الماضي: بريتريتوم -------------------------
  praeteritumNote:"في الكلام الحقيقي بنستخدم Perfekt غالباً، إلا مع sein وhaben والأفعال الشكلية بنستخدم Präteritum حتى في الكلام العادي — ده الشكل اللي لازم تحفظه غيباً.",
  praeteritum: [
    {inf:"sein", ar:"كان", forms:["war","warst","war","waren","wart","waren"]},
    {inf:"haben", ar:"كان يملك", forms:["hatte","hattest","hatte","hatten","hattet","hatten"]},
    {inf:"können", ar:"كان يستطيع", forms:["konnte","konntest","konnte","konnten","konntet","konnten"]},
    {inf:"müssen", ar:"كان لازم", forms:["musste","musstest","musste","mussten","musstet","mussten"]},
    {inf:"dürfen", ar:"كان مسموح له", forms:["durfte","durftest","durfte","durften","durftet","durften"]},
    {inf:"wollen", ar:"كان يريد", forms:["wollte","wolltest","wollte","wollten","wolltet","wollten"]},
    {inf:"mögen", ar:"كان يحب", forms:["mochte","mochtest","mochte","mochten","mochtet","mochten"]},
  ],
  praeteritumExamples: [
    ["Ich war müde.","كنت تعبان."],
    ["Wir hatten keine Zeit.","ما كانش عندنا وقت."],
    ["Er konnte nicht kommen.","هو ما قدرش يجي."],
    ["Ich musste früh aufstehen.","كان لازم أصحى بدري."],
  ],

  strongVerbsExamples: [
    ["Er liest ein Buch.","هو بيقرأ كتاب."],
    ["Sie spricht Deutsch.","هي بتتكلم ألماني."],
    ["Du isst zu schnell.","انت بتاكل بسرعة قوي."],
    ["Er fährt nach Berlin.","هو بيسافر لبرلين."],
    ["Sie schläft schon.","هي نايمة بالفعل."],
  ],
  modalExamples: [
    ["Ich kann gut schwimmen.","أنا أقدر أعوم كويس."],
    ["Du musst jetzt lernen.","لازم تذاكر دلوقتي."],
    ["Wir möchten eine Pizza.","إحنا عايزين بيتزا."],
    ["Er darf nicht rauchen.","مش مسموح له يدخّن."],
  ],
};
