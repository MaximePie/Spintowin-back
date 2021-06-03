
/**
 * Represents the possible repetition intervals in seconds
 */
const intervals = [
  0,
  5,
  13,
  21,
  34,
  55, // 1 minute
  2 * 60,
  3 * 60,
  5 * 60,
  8 * 60,
  13 * 60,
  21 * 60,
  34 * 60,
  55 * 60, // 1h
  2 * 60 * 60, // 3h
  3 * 60 * 60, // 3h
  8 * 60 * 60, // 8h
  24 * 60 * 60, // 1j
  2 * 86400, // 2j
  3 * 86400,
  5 * 86400,
  8 * 86400, // 8j
  13 * 86400,
  21 * 86400,
  34 * 24 * 60 * 60, // 34 jours
  55 * 24 * 60 * 60,
  90 * 24 * 60 * 60, // 90 jours
  145 * 24 * 60 * 60,
  235 * 24 * 60 * 60,
  370 * 24 * 60 * 60, //
];

module.exports.startedInterval = intervals[0];
module.exports.minuteInterval = intervals[5];
module.exports.hourInterval = intervals[13];
module.exports.dayInterval = intervals[17];
module.exports.weekInterval = intervals[21];
module.exports.monthInterval = intervals[24];




/*
const cards = [
  {
    question: "abgefülltem",
    answer: "embouteillée",
  },
  {
    question: "beantworten",
    answer: "répondre",
  },
  {
    question: "Nutzen",
    answer: "utilisation",
  },
  {
    question: "Gehirnen",
    answer: "cerveaux",
  },
  {
    question: "Bauch",
    answer: "ventre",
  },
  {
    question: "ziemlich",
    answer: "assez",
  },
  {
    question: "Hals",
    answer: "cou",
  },
  {
    question: "veröffentlichen",
    answer: "publier",
  },
  {
    question: "Nennen",
    answer: "Révéler",
  },
  {
    question: "Beachten",
    answer: "tenir compte",
  },
]
*/

const cards = [


  {question: "erscheint", answer: "apparaît",}, {
    question: "zuvor",

    answer: "avant",

  }, {question: "einsam", answer: "solitaire",}, {
    question: "gediehen",

    answer: "prospéré",

  }, {question: "prächtiger", answer: "plus splendide",}, {
    question: "verfassen",

    answer: "composer",

  }, {question: "Beobachtung", answer: "observation",}, {
    question: "Geh",

    answer: "Va",

  }, {question: "Unterricht", answer: "Enseignement",}, {
    question: "Fußoldatin",

    answer: "fantassin",

  }, {question: "Stück", answer: "pièce",}, {
    question: "verantwortlich",

    answer: "responsable",

  }, {question: "Mehrere", answer: "nombreuses",}, {
    question: "Ertrag",

    answer: "rendement",

  }, {question: "stopfte", answer: "fourra",}, {
    question: "Saaten",

    answer: "des graines",

  }, {question: "voll", answer: "plein, pleinement",}, {
    question: "Gift",

    answer: "poison",

  }, {question: "ertränkte", answer: "noyé",}, {
    question: "verfärbte",

    answer: "décoloré",

  }, {question: "pumpte", answer: "pompé",}, {
    question: "wuchsen",

    answer: "a grandi",

  }, {question: "mächtige", answer: "puissant",}, {
    question: "heran",

    answer: "atteindre",

  }, {question: "kolben", answer: "bulbe",}, {
    question: "überfluss",

    answer: "abondance",

  }, {question: "unermessliche", answer: "incommensurable",}, {
    question: "damals",

    answer: "à l'époque",

  }, {question: "unvermeidlich", answer: "inévitable",}, {
    question: "Bekanntschaft",

    answer: "connaissance",

  }, {question: "Kleinigkeit", answer: "petite chose",}, {
    question: "erinnerst",

    answer: "rappelles toi",

  }, {question: "Verzehr", answer: "consommation",}, {
    question: "dränge",

    answer: "pousse trop",

  }, {question: "gesellig", answer: "sociable",}, {
    question: "schlechthin",

    answer: "absolument",

  }, {question: "Reling", answer: "balustrade",}, {
    question: "genießen",

    answer: "prendre plaisir",

  }, {question: "Pracht", answer: "splendeur",}, {
    question: "um mich herum",

    answer: "qui m'entoure",

  }, {question: "Mücken", answer: "les moustiques",}, {
    question: "Mund",

    answer: "bouche",

  }, {question: "Quallen", answer: "méduse",}, {
    question: "herauskommt",

    answer: "sort",

  }, {question: "Fäden", answer: "fils",}, {
    question: "offenbaren",

    answer: "révéler",

  }, {question: "lebhafter", answer: "plus vivant",}, {
    question: "faszinierende",

    answer: "fascinant",

  }, {question: "Entdeckung", answer: "découverte",}, {
    question: "auf jeden Fall",

    answer: "absolument, En tout cas ",

  }, {question: "weiterverbreiten", answer: "propagé",}, {
    question: "Stimmung",

    answer: "ambiance",

  }, {question: "Durcheiander", answer: "désordre",}, {
    question: "Münze",

    answer: "pièce de monnaie",

  }, {question: "Ankunft", answer: "arrivée",}, {
    question: "Gekitzelt",

    answer: "chatouillé",

  }, {question: "erleichtert", answer: "soulagé",}, {
    question: "geschlagen",

    answer: "battu",

  }, {question: "kümmern", answer: "prendre soin de",}, {
    question: "Geduld",

    answer: "la patience",

  }, {question: "Probe", answer: "échantillon",}, {
    question: "Aber zuallerest",

    answer: "Mais avant tout",

  }, {question: "bemerkt", answer: "remarqué",}, {
    question: "Vor allem",

    answer: "Surtout",

  }, {question: "eng", answer: "étroitement",}, {
    question: "beschweren",

    answer: "se plaindre",

  }, {question: "bisher", answer: "jusque là",}, {
    question: "unhöflich",

    answer: "pas poli",

  }, {question: "Schuld", answer: "faute",}, {
    question: "zuzuweisen",

    answer: "attribuer",

  }, {question: "Rückzugsort", answer: "Havre de paix, Refuge",}, {
    question: "bescheiden",

    answer: "modeste",

  }, {question: "Flair", answer: "atmosphère",}, {
    question: "gemütlichen",

    answer: "confortable",

  }, {question: "mich entspannen", answer: "se détendre",}, {
    question: "fernab",

    answer: "loin",

  }, {question: "Seltsamerweise", answer: "curieusement",}, {
    question: "schwebt mir etwas",

    answer: "Quelque chose me revient",

  }, {question: "verschließen", answer: "Sceller",}, {
    question: "freuen",

    answer: "Se réjouir",

  }, {question: "erworben", answer: "acquis",}, {
    question: "überleben",

    answer: "survivre",

  }, {question: "belästigen", answer: "harceler",}, {
    question: "damit",

    answer: "afin de, ainsi",

  }, {question: "Träume", answer: "rêves",}, {
    question: "riesigen",

    answer: "énorme",

  }, {question: "Schlange", answer: "serpent",}, {
    question: "bedrohlichen",

    answer: "menaçant",

  }, {question: "Riffen", answer: "récifs",}, {
    question: "verfaultem",

    answer: "pourri",

  }, {question: "Wie dem auch sei", answer: "En tous cas",}, {
    question: "inzwischen",

    answer: "pendant ce temps",

  }, {question: "gemeinsamen", answer: "commun",}, {
    question: "angesehen",

    answer: "vu",

  }, {question: "Kajüte", answer: "cabine",}, {
    question: "Blick",

    answer: "regardez, Vue",

  }, {question: "bestimmten", answer: "certain",}, {
    question: "hingezogen",

    answer: "attiré par",

  }, {question: "Unterkunft", answer: "hébergement",}, {
    question: "Erinnert",

    answer: "rappeler",

  }, {question: "Eigentumswohnung", answer: "Appartement",}, {
    question: "Ruhe",

    answer: "Calme",

  }, {question: "Verwendet", answer: "Utilise",}, {
    question: "Webstuhl",

    answer: "métier à tisser",

  }, {question: "ruhelos", answer: "Insatisfait",}, {
    question: "beunruhigende",

    answer: "troublant",

  }, {question: "pingelig", answer: "Pointilleux",}, {
    question: "Wertwolle",

    answer: "D'une grande valeur",

  }, {question: "geweint", answer: "pleuré",}, {
    question: "Riesenpulli",

    answer: "pull géant",

  }, {question: "geschenkt", answer: "donné",}, {
    question: "gestrickt",

    answer: "tricoté",

  }, {question: "entsetzt", answer: "horrifié",}, {
    question: "Reißbrett",

    answer: "planche à dessin",

  }, {question: "übel", answer: "mal",}, {
    question: "womit",

    answer: "Avec quoi",

  }, {question: "Stiften", answer: "Bâtons",}, {
    question: "Werft",

    answer: "chantier naval",

  }, {question: "Aufwerten", answer: "améliorer",}, {
    question: "Zuerst",

    answer: "première, Au début",

  }, {question: "Führung", answer: "guider",}, {
    question: "rufen",

    answer: "Appeler",

  }, {question: "Eichen", answer: "chênes",}, {
    question: "gepflückt",

    answer: "choisi, Cueilli",

  }, {question: "übertrieben", answer: "exagéré",}, {
    question: "entlaufenes",

    answer: "Lapin en fuite",

  }, {question: "gestoßen", answer: "rencontré, heurté",}, {
    question: "Pferch",

    answer: "Enclos",

  }, {question: "treiben", answer: "Remettre",}, {
    question: "sture",

    answer: "têtu",

  }, {question: "Gefräßigkeit", answer: "gourmandise",}, {
    question: "Füttert",

    answer: "Nourrit",

  }, {question: "Schiefer", answer: "ardoise",}, {
    question: "großartige",

    answer: "génial",

  }, {question: "dorthin", answer: "Là-bas",}, {
    question: "unterwegs",

    answer: "sur la route",

  }, {question: "Meine güte", answer: "Mon Dieu",}, {
    question: "nettes",

    answer: "Gentil",

  }, {question: "Kerl", answer: "gars",}, {
    question: "genauso",

    answer: "pareil",

  }, {question: "deswegen", answer: "par conséquent",}, {
    question: "losgezogen",

    answer: "déclencher, Il est parti",

  }, {question: "Gesellschaft", answer: "Compagnie",}, {
    question: "Leisten",

    answer: "Apporter",

  }, {question: "verirrtes", answer: "égarer",}, {
    question: "unannehmlichkeiten",

    answer: "inconvénients",

  }, {question: "Freut mich sehr", answer: "Enchanté",}, {
    question: "kennenzulernen",

    answer: "faire connaissance",

  }, {question: "verrückte", answer: "fou",}, {
    question: "Kabeljau",

    answer: "la morue",

  }, {question: "aufwärmen", answer: "réchauffer",}, {
    question: "Spucke",

    answer: "cracher",

  }, {question: "zielen", answer: "objectif, Viser",}, {
    question: "Volltreffer",

    answer: "coup direct, En plein dans le mille",

  }, {question: "Reinform", answer: "forme pure",}, {
    question: "aufhören",

    answer: "Arrêter",

  }, {question: "unwahrscheinlichen", answer: "peu probable",}, {
    question: "Anscheinend",

    answer: "apparemment",

  }, {question: "erfüllend", answer: "épanouissant",}, {
    question: "ausgerüstet",

    answer: "équipé",

  }, {question: "Willenskraft", answer: "volonté",}, {
    question: "jahrelang",

    answer: "pendant des années",

  }, {question: "erfolglos", answer: "infructueux",}, {
    question: "Drehbücher",

    answer: "Scénarios",

  }, {question: "Impfungen", answer: "les vaccinations",}, {
    question: "Kopfsalat",

    answer: "salade",

  }, {question: "empfahl", answer: "conseillé",}, {
    question: "senken",

    answer: "réduire",

  }, {question: "Steinbruch", answer: "carrière",}, {
    question: "einweisen",

    answer: "instruire",

  }, {question: "Lust", answer: "luxure, Envie",}, {
    question: "Heute",

    answer: "aujourd'hui",

  }, {question: "fällt", answer: "tombe",}, {
    question: "auseinander",

    answer: "En morceaux",

  }, {question: "reiß dich zusammen", answer: "Ressaisissez-vous",}, {
    question: "reiß",

    answer: "Arracher",

  }, {question: "dreht", answer: "se tourne",}, {
    question: "Graben",

    answer: "Fossé",

  }, {question: "draußen", answer: "à l'extérieur",}, {
    question: "Tief durchatmen",

    answer: "Respire profondément",

  }, {question: "Er meinte", answer: "Il m'a dit",}, {
    question: "still sein",

    answer: "Se taire",

  }, {question: "Eindruck", answer: "impression",}, {
    question: "Geschäftlichen",

    answer: "Commercial",

  }, {question: "Gesichtsausdruck", answer: "expression faciale",}, {
    question: "Geübt",

    answer: "Répété",

  }, {question: "Finsternis", answer: "obscurité",}, {
    question: "Bergwerk",

    answer: "Mine",

  }, {question: "Vorstandsetage", answer: "salle de réunion",}, {
    question: "Stunde",

    answer: "heure",

  }, {question: "Enthauptungen", answer: "décapitations",}, {
    question: "losziehen",

    answer: "partir",

  }, {question: "ständige", answer: "constant",}, {
    question: "Pflege",

    answer: "entretien",

  }, {question: "Sonnenuntergang", answer: "le coucher du soleil",}, {
    question: "Zeitschriftenabo",

    answer: "abonnement au magazine",

  }, {question: "dringend", answer: "urgent",}, {
    question: "vertrautes",

    answer: "familier",

  }, {question: "Sammlung", answer: "collection",}, {
    question: "Holzdrucken",

    answer: "Gravures sur bois",

  }, {question: "vervollständigen", answer: "compléter",}, {
    question: "stammen",

    answer: "Provenir",

  }, {question: "Aufspüren", answer: "Retrouver",}, {
    question: "außerdem",

    answer: "En outre",

  }, {question: "zuverlässiger", answer: "plus fiable",}, {
    question: "Quelle",

    answer: "la source",

  }, {question: "örtliche", answer: "local",}, {
    question: "Besitz",

    answer: "possession",

  }, {question: "leugnet", answer: "nie",}, {
    question: "lästiger",

    answer: "énervant",

  }, {question: "Marderhund", answer: "Tanuki",}, {
    question: "liebenswürdigen",

    answer: "aimable",

  }, {question: "Lächeln", answer: "sourire",}, {
    question: "friedfertigen",

    answer: "paisible",

  }, {question: "Ausstrahlung", answer: "charisme",}, {
    question: "erwerben",

    answer: "acquérir",

  }, {question: "Na dann los", answer: "bien alors vas-y",}, {
    question: "Skipperin",

    answer: "Capitaine",

  }, {question: "kaum", answer: "à peine",}, {
    question: "überall",

    answer: "partout",

  }, {question: "wütend", answer: "en colère",}, {
    question: "übrig",

    answer: "Il en reste",

  }, {question: "Besonderheiten", answer: "les particularités",}, {
    question: "pedantische",

    answer: "pédant",

  }, {question: "schlimmer", answer: "pire",}, {
    question: "gefeilscht",

    answer: "marchandé",

  }, {question: "stattdessen", answer: "à la place",}, {
    question: "abgespeist",

    answer: "Duper",

  }, {question: "riesige", answer: "énorme",}, {
    question: "bestand",

    answer: "Insister",

  }, {question: "überlegt", answer: "Se demander",}, {
    question: "fettes",

    answer: "Gros",

  }, {question: "stinkreich", answer: "sale riche",}, {
    question: "beschaffen",

    answer: "procurer",

  }, {question: "Waren", answer: "marchandises",}, {
    question: "erhältliches",

    answer: "disponible",

  }, {question: "vielseitig", answer: "polyvalent",}, {
    question: "verwendbares",

    answer: "utilisable",

  }, {question: "Teeblätter", answer: "feuilles de thé",}, {
    question: "Holzfäller",

    answer: "bûcheron",

  }, {question: "Heulend", answer: "En pleurs",}, {
    question: "lachend",

    answer: "en riant",

  }, {question: "gewöhnlicher", answer: "Nature",}, {
    question: "Stoffe",

    answer: "tissus",

  }, {question: "friedlich", answer: "paisible",}, {
    question: "herumführen",

    answer: "Faire visiter",

  }, {question: "Sonnenschirm", answer: "parasol",}, {
    question: "Hoch und runter",

    answer: "Haut et bas",

  }, {question: "abzustellen", answer: "Remédier",}, {
    question: "Hör auf",

    answer: "Arrête ça",

  }, {question: "angenehmen tag", answer: "bonne journée",}, {
    question: "Abprallen",

    answer: "Rebondir",

  }, {question: "Beruhig", answer: "calmez-vous",}, {
    question: "hochschaffen",

    answer: "Y arriver",

  }, {question: "kräftigeren", answer: "plus forte",}, {
    question: "Beinen",

    answer: "jambes",

  }, {question: "Scheitern", answer: "échouer",}, {
    question: "bezieht",

    answer: "concerne",

  }, {question: "herausfinden", answer: "trouver",}, {
    question: "ordentlich",

    answer: "Correctement",

  }, {question: "höhere", answer: "plus haute",}, {
    question: "Hämmern",

    answer: "marteau",

  }, {question: "Weiden", answer: "Pâturages",}, {
    question: "spüren",

    answer: "ressentir",

  }, {question: "kündigen", answer: "annuler",}, {
    question: "hersieht",

    answer: "Regarde",

  }, {question: "lecke", answer: "lécher",}, {
    question: "Fels",

    answer: "roche",

  }, {question: "danebenstellen", answer: "place à côté",}, {
    question: "Möwe",

    answer: "mouette",

  }, {question: "miteiander", answer: "ensemble",}, {
    question: "herzlich",

    answer: "Chaleureux",

  }, {question: "überrascht", answer: "surpris",}, {
    question: "anbelangt",

    answer: "est concerné",

  }, {question: "aufdrängen", answer: "imposer",}, {
    question: "stimmt",

    answer: "Vrai",

  }, {question: "karg", answer: "Aride",}, {
    question: "Ranken",

    answer: "Vignes",

  }, {question: "Topfblumen", answer: "fleurs en pot",}, {
    question: "hellen",

    answer: "brillant",

  }, {question: "Jalousien", answer: "stores",}, {
    question: "gut aufgehoben",

    answer: "Entre de bonnes mains",

  }, {question: "berühmten", answer: "célèbre",}, {
    question: "widerlicher",

    answer: "répugnant",

  }, {question: "Buchhalter", answer: "comptable",}, {
    question: "Spring Runter",

    answer: "Descendez",

  }, {question: "Zeugs", answer: "des trucs",}, {
    question: "Tand",

    answer: "bibelots",

  }, {question: "loswerden", answer: "se débarrasser de",}, {
    question: "unterkühlt",

    answer: "froid",

  },
  {question: "Wie schade", answer: "Quel dommage",},
  {
    question: "Sunken",
    answer: "creux",
  },
  {question: "glade", answer: "clairière"},
  {
    question: "Post",

    answer: "bureau de poste",
  },
  {question: "Glitzer", answer: "briller",}, {
    question: "drehe ich durch",

    answer: "je deviens fou",

  }, {question: "zwar", answer: "certes",}, {
    question: "ich behalte",

    answer: "je garde",

  }, {question: "dich anzumeckern", answer: "De me plaindre à toi",}, {
    question: "Feldarbeit",

    answer: "travail sur le terrain",

  }, {question: "gefährlich", answer: "dangereux",}, {
    question: "Flinte ins Korn wirft",

    answer: "Jeter un fusil dans le grain",

  }, {question: "ich stecke", answer: "Je vais",}, {
    question: "ungenutzter",

    answer: "inutilisé",

  }, {question: "irgendwas herumwerkeln", answer: "bricoler quelque chose",}, {
    question: "Gefallen",

    answer: "Faveur",

  }, {question: "Bündeln", answer: "Combiner",}, {
    question: "Sägewerk",

    answer: "scierie",

  }, {question: "Dir fehlen", answer: "Vous manquez",}, {
    question: "Umbebung",

    answer: "environnement",

  }, {question: "Gießerei", answer: "fonderie",}, {
    question: "verhütte",

    answer: "Transforme",

  }, {question: "Kram", answer: "déchet",}, {
    question: "sogar",

    answer: "voire",

  }, {question: "tauschen", answer: "troquer",}, {
    question: "nutzlosen",

    answer: "inutile",

  }, {question: "unbeholfen", answer: "maladroit",}, {
    question: "Furchtloser",

    answer: "Courageux",

  }, {question: "Aal", answer: "anguille",}, {
    question: "auf Schritt und Tritt",

    answer: "à tout bout de champ",

  }, {question: "Schicksale", answer: "destins",}, {
    question: "miteinander verwoben",

    answer: "entrelacé",

  }, {question: "geschadet", answer: "blessé",}, {
    question: "Schmerzen",

    answer: "douleur",

  }, {question: "Rücken", answer: "Dos",}, {
    question: "Verderben",

    answer: "détérioration",

  }, {question: "entfernen", answer: "retirer",}, {
    question: "Jedes Wesen",

    answer: "Chaque être",

  }, {question: "verdient", answer: "mérite",}, {
    question: "Fürsorge",

    answer: "assistance",

  }, {question: "bedeuten", answer: "signifier",}, {
    question: "Ganz egal",

    answer: "Peu importe",

  }, {question: "Gedanken", answer: "pensées",}, {
    question: "Grüße",

    answer: "salutations",

  }, {question: "Nähmaschine", answer: "machine à coudre",}, {
    question: "Schriftzug",

    answer: "caractères",

  }, {question: "Rad", answer: "roue",}, {
    question: "Unmengen",

    answer: "des tonnes",

  }, {question: "aufgefallen", answer: "remarqué",}, {
    question: "beizubringen",

    answer: "enseigner",

  }, {question: "hinzufügen", answer: "ajouter",}, {
    question: "fürchte",

    answer: "peur",

  }, {question: "geistige", answer: "spirituel",}, {
    question: "seelische",

    answer: "mental",

  }, {question: "undankbar", answer: "ingrat",}, {
    question: "reizend",

    answer: "charmant",

  }, {
    question: "Ich frage wirklich nur ungern",

    answer: "Je déteste vraiment demander",

  }, {question: "schaffen", answer: "créer",}, {
    question: "üppiger",

    answer: "succulent",

  }, {question: "Bepflanzung", answer: "plantation",}, {
    question: "Zufluchtsort",

    answer: "havre",

  }, {question: "demselben", answer: "même",}, {
    question: "einschüchtern",

    answer: "intimider",

  }, {question: "vollkommen", answer: "à la perfection",}, {
    question: "einsatzfähig",

    answer: "opérationnel",

  }, {question: "hinein", answer: "La-dedans",}, {
    question: "Achte",

    answer: "Surveille",

  }, {question: "triffst", answer: "rencontrer",}, {
    question: "erhältst",

    answer: "recevoir",

  }, {question: "Besorgung", answer: "course",}, {
    question: "erledigt",

    answer: "terminé",

  }, {question: "Ausbeute", answer: "rendement",}, {
    question: "Profi",

    answer: "professionnel",

  }, {question: "Umgangsformen", answer: "Manières",}, {
    question: "angehende",

    answer: "bourgeonnant",

  }, {question: "Segel", answer: "voile",}, {
    question: "Matrosin",

    answer: "marin",

  }, {question: "Sie erledigt", answer: "Elle fait",}, {
    question: "Geräusche",

    answer: "des sons",

  }, {question: "befriedigend", answer: "satisfaisant",}, {
    question: "schien es",

    answer: "il semblait",

  }, {question: "immerhin", answer: "après tout",}, {
    question: "gewinne",

    answer: "bénéfices",

  }, {question: "Herrenhaus", answer: "manoir",}, {
    question: "am See",

    answer: "Près du lac",

  }, {question: "wirft", answer: "soulève",}, {
    question: "Herausforderung",

    answer: "défi",

  }, {question: "Bedauern", answer: "le regret",}, {
    question: "grossartig",

    answer: "génial",

  }, {question: "böse", answer: "Se facher",}, {
    question: "enthlohnen",

    answer: "récompense",

  }, {question: "Überraschung", answer: "surprise",}, {
    question: "zersägst",

    answer: "scié",

  }, {question: "Maß", answer: "mesure",}, {
    question: "Sägeblatt",

    answer: "lame de scie",

  }, {question: "Schnittlinie", answer: "ligne de coupe",}, {
    question: "schlampig",

    answer: "négligé",

  }, {question: "probier", answer: "essayer",}, {
    question: "Gaunerin",

    answer: "escroc",

  }, {question: "Anwesen", answer: "Domaine",}, {
    question: "Mist",

    answer: "zut",

  }, {question: "gerührter", answer: "Agité",}, {
    question: "Spieluhr",

    answer: "boîte à musique",

  }, {question: "저는", answer: "je suis",}, {
    question: "그릇을",

    answer: "bol",

  }, {question: "던지지", answer: "jeter",}, {
    question: "않습니다",

    answer: "ne pas",

  }, {question: "새", answer: "oiseau",}, {
    question: "식",

    answer: "expression",

  }, {question: "식사", answer: "repas",}, {
    question: "접시",

    answer: "assiette",

  }, {question: "받아요", answer: "Me donne",}, {
    question: "아침",

    answer: "matin",

  }, {question: "빨리", answer: "rapidement",}, {
    question: "처녁을",

    answer: "dans la soirée",

  }, {question: "요리하다", answer: "cuisinier",}, {
    question: "모험",

    answer: "aventure",

  }, {question: "일하다", answer: "travail",}, {
    question: "듣다",

    answer: "ecoutez, Oreille",

  }, {question: "트럼펫", answer: "trompette",}, {
    question: "담배를 피우다",

    answer: "fumeur",

  }, {question: "아빠", answer: "papa",}, {
    question: "가게",

    answer: "boutique",

  }, {question: "팔다", answer: "vendre",}, {
    question: "작은",

    answer: "petit",

  }, {question: "여보세요", answer: "bonjour, Allô",}, {
    question: "매일",

    answer: "tous les jours",

  }, {question: "어디애", answer: "où",}, {question: "기름", answer: "Huile",}, {
    question: "너이",

    answer: "tu es",

  }, {question: "날개는", answer: "ailes",}, {
    question: "악마이",

    answer: "le diable",

  }, {question: "쥐", answer: "rat",}, {
    question: "널이켜",

    answer: "te remonter le moral",

  }, {question: "내 피", answer: "Mon sang",}, {
    question: "차 가 운",

    answer: "du froid",

  }, {question: "펜", answer: "stylo",}, {
    question: "벨트",

    answer: "ceinture",

  }, {question: "소", answer: "petit, vache",}, {
    question: "암살자",

    answer: "assassin",

  }, {question: "도움", answer: "Aider, aider",}, {
    question: "고치다",

    answer: "Soigner",

  }, {question: "가족", answer: "famille",}, {
    question: "떠나다",

    answer: "quitter",

  }, {question: "집", answer: "maison",}, {
    question: "바다",

    answer: "mer",

  }, {question: "거북이", answer: "tortue",}, {
    question: "오리",

    answer: "canard",

  }, {question: "느립니다", answer: "est lent",}, {
    question: "먹습니다",

    answer: "manger",

  }, {question: "누구나", answer: "tout le monde",}, {
    question: "외국인이",

    answer: "étrangers",

  }, {question: "커버한", answer: "couvert",}, {
    question: "노래중에",

    answer: "en chantant",

  }, {question: "가장", answer: "les plus",}, {
    question: "원곡의",

    answer: "original",

  }, {question: "느낌을", answer: "sentir",}, {
    question: "해치지",

    answer: "non blessé",

  }, {question: "완벽합니다", answer: "parfait",}, {
    question: "음악",

    answer: "musique",

  }, {question: "있다", answer: "ont",}, {question: "없다", answer: "rien",}, {
    question: "작다",

    answer: "petit",

  }, {question: "나쁘다", answer: "mal",}, {question: "나쁜", answer: "mal",}, {
    question: "달다",

    answer: "doux",

  }, {question: "미쳤나봐", answer: "avoir l'air fou",}, {
    question: "으)세요",

    answer: "s'il te plaît",

  }, {question: "학교에", answer: "à l'école",}, {
    question: "bland",

    answer: "fade",

  }, {question: "bland", answer: "fade",}, {
    question: "많은",

    answer: "de nombreux",

  }, {question: "책을", answer: "livres",}, {
    question: "읽어요",

    answer: "lire",

  }, {question: "아주", answer: "très",}, {
    question: "특히",

    answer: "notamment",

  }, {question: "꽤", answer: "équitablement",}, {
    question: "너무",

    answer: "trop",

  }, {question: "에", answer: "sur",}, {
    question: "öffentliche",

    answer: "öffentliche",

  }, {question: "가능성", answer: "Potentiel",}, {
    question: "모든",

    answer: "tout",

  }, {question: "세계", answer: "monde",}, {
    question: "내용",

    answer: "contenu",

  }, {question: "캔버스", answer: "Canvas",}, {
    question: "지식",

    answer: "connaissance",

  }, {question: "소프트웨어", answer: "logiciel",}, {
    question: "기초",

    answer: "Basiques",

  }, {question: "단추", answer: "bouton",}, {
    question: "대답",

    answer: "La réponse, répondre",

  }, {question: "fuss", answer: "s'agiter",}, {
    question: "데이터",

    answer: "데이터",

  }, {question: "Magpie", answer: "pie, chapardeur",}, {
    question: "내 문제",

    answer: "Mon problème",

  }, {question: "판매", answer: "vendre",}, {
    question: "현수막",

    answer: "bannière",

  }, {question: "부자", answer: "riche, Avoir",}, {
    question: "학습",

    answer: "apprentissage",

  }, {question: "게임", answer: "jeu",}, {
    question: "목표",

    answer: "objectif",

  }, {question: "동업자", answer: "camarade commerçant",}, {
    question: "shuttle",

    answer: "navette",
  }, {question: "이 혼란", answer: "Cette confusion",}, {
    question: "프로젝트",

    answer: "projet",

  }, {question: "기술", answer: "la technologie",}, {
    question: "또한",

    answer: "également",

  }, {question: "첫번째", answer: "première",}, {
    question: "항상",

    answer: "toujours",

  }, {question: "디자인", answer: "conception, Design",}, {
    question: "정보",

    answer: "informations",

  }, {question: "왜냐하면", answer: "car, Parce que",}, {
    question: "젊은이들",

    answer: "Jeune",

  }, {question: "웹 개발자", answer: "développeur web",}, {
    question: "사랑",

    answer: "aimer",

  }, {question: "앱", answer: "app ",}, {
    question: "희망",

    answer: "espérer",

  }, {question: "이 기사", answer: "Cet article",}, {
    question: "플랫폼",

    answer: "plate-forme",

  }, {question: "언어", answer: "langue",}, {
    question: "제품",

    answer: "produit",

  }, {question: "시각 자료", answer: "Matériel visuel",}, {
    question: "색",

    answer: "couleur",

  }, {question: "행동", answer: "comportement, action",}, {
    question: "계좌",

    answer: "compte",

  }, {question: "행복하다", answer: "heureux",}, {
    question: "살아 있다",

    answer: "habitent, Habiter",

  }, {question: "자립", answer: "autonomie ",}, {
    question: "시도",

    answer: "essayer",

  }, {question: "성격", answer: "personnage",}, {
    question: "겪다",

    answer: "Expérience",

  }, {question: "할 수 있는", answer: "Capable",}, {
    question: "환경",

    answer: "environnement",

  }, {question: "반려동물", answer: "animal de compagnie",}, {
    question: "돌봄",

    answer: "se soucier, Prends soin de ",

  }, {question: "배우다", answer: "apprendre",}, {
    question: "언제",

    answer: "lorsque",

  }, {question: "교사", answer: "professeur",}, {
    question: "것",

    answer: "Une chose",

  }, {question: "전염병", answer: "épidémie",}, {
    question: "경험",

    answer: "expérience",

  }, {question: "이미", answer: "déjà",}, {
    question: "금고",

    answer: "en sécurité",

  }, {question: "투자하다", answer: "investir",}, {
    question: "입양",

    answer: "adopter",

  }, {question: "진전", answer: "Progression",}, {
    question: "지원",

    answer: "Booster",

  }, {question: "형태로", answer: "sous la forme",}, {
    question: "도구",

    answer: "outil",

  }, {question: "범위", answer: "intervalle",}, {
    question: "응답",

    answer: "répondre",

  }, {question: "속도", answer: "la vitesse",}
];


module.exports.cards = cards;
module.exports.intervals = intervals;
