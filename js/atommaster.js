/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 2.5                            */
/* 31.06.2022                             */
/*                                        */
/* Frank Wolter                           */
/*                                        */
/******************************************/

/**************************************/
/* Globale Variablen und Konstanten   */
/**************************************/

/** Variablen und Konstanten die abhängig von der Größe des Experimentierfeldes sind **/
// Array für die zu suchenden Atome für 8 x 8 Felder
let atomArray = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Array für die gesetzten Atome
let atomSetArray = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// X-Breite des Experimentierfeldes - 1 weil wir bei 0 anfangen
const lengthX = 7;

// Y-Breite des Experimentierfeldes - 1 weil wir bei 0 anfangen
const lengthY = 7;

// Anzahl der Abfragefelder (Rim-IDs)
const numberOfRimIDs = 32;

// Anzahl der Orbs zur Anzeige von Strahleintritt und Strahlaustritt
const numberOfOrbs = 16;

// Array mit der Zuordnung der Position des Abfrage-Cursors (Rim-ID) zu den Feldkoordinaten und der Strahlrichtung
// beam2Coordinates[0] ist null, damit die Rim-ID direkt als Index für das Array verwendet werden kann
const beam2Coordinates = [
  null,
  "0.0.incX",
  "0.1.incX",
  "0.2.incX",
  "0.3.incX",
  "0.4.incX",
  "0.5.incX",
  "0.6.incX",
  "0.7.incX",
  "0.7.decY",
  "1.7.decY",
  "2.7.decY",
  "3.7.decY",
  "4.7.decY",
  "5.7.decY",
  "6.7.decY",
  "7.7.decY",
  "7.7.decX",
  "7.6.decX",
  "7.5.decX",
  "7.4.decX",
  "7.3.decX",
  "7.2.decX",
  "7.1.decX",
  "7.0.decX",
  "7.0.incY",
  "6.0.incY",
  "5.0.incY",
  "4.0.incY",
  "3.0.incY",
  "2.0.incY",
  "1.0.incY",
  "0.0.incY",
];

// Map mit den Feldkoordinaten und der Richtung des Strahls als Schlüssel und der zugehörigen Rim-ID als Ausgabe
const coordinates2Beam = new Map([
  ["0.0.X", 1],
  ["0.1.X", 2],
  ["0.2.X", 3],
  ["0.3.X", 4],
  ["0.4.X", 5],
  ["0.5.X", 6],
  ["0.6.X", 7],
  ["0.7.X", 8],
  ["0.7.Y", 9],
  ["1.7.Y", 10],
  ["2.7.Y", 11],
  ["3.7.Y", 12],
  ["4.7.Y", 13],
  ["5.7.Y", 14],
  ["6.7.Y", 15],
  ["7.7.Y", 16],
  ["7.7.X", 17],
  ["7.6.X", 18],
  ["7.5.X", 19],
  ["7.4.X", 20],
  ["7.3.X", 21],
  ["7.2.X", 22],
  ["7.1.X", 23],
  ["7.0.X", 24],
  ["7.0.Y", 25],
  ["6.0.Y", 26],
  ["5.0.Y", 27],
  ["4.0.Y", 28],
  ["3.0.Y", 29],
  ["2.0.Y", 30],
  ["1.0.Y", 31],
  ["0.0.Y", 32],
]);

/** Ende Variablen und Konstanten die abhängig von der Größe des Experimentierfeldes sind **/

// Array mit den Modi
const mode = {
  Beam: Symbol("beam"), // Abfrage-Cursor bewegen, Untersuchungsstrahl abfeuern
  Set: Symbol("set"), // Atome auf dem Experementierfeld setzen oder löschen
};

// aktueller Modus
let currentMode;

// Flag ob die Orbs in zufälliger Reihenfolge ausgegeben werden sollen
// dies ist im Billardkugel Anzeigemodus nicht der Fall
let randomOrbs = true;

/** Blockade-Flags verhindern **/
/** das mehrfache Ausführen   **/
/** eines Tastatur-Befehls    **/
/** bevor die jeweilige Taste **/
/** wieder losgelassen wurde  **/
// ist der Cursor blockiert
let beamCursorBlocked = false;
let setCursorBlocked = false;
let setAtomCursorBlocked = false;
// ist der Wechsel zwischen Standard- und Billardkugel Anzeige blockiert
let toggleOrbsBlocked = false;
// ist der Wechsel zum Lern-Modus und zurück blockiert
let toogleLearnModeBlocked = false;
// ist der Wechsel Lautsprecher an und aus blockiert
let toogleSoundModeBlocked = false;

// Flag Sound on oder off
let soundActive = false;

// Flag Sound initialisiert
let soundInitialized = false;

// Speicher der genutzten Orbs
let orbsUsed = [];
for (let i = 0; i < numberOfOrbs; i++) {
  orbsUsed[i] = false;
}

// Zeiger auf aktuellen Orb falls keine Zufallsreihenfolge
let currOrb = 0;

// Position (Rim-ID) des Abfrage-Cursors
let beamCursor = 1;
let lastBeamCursor = beamCursor;

// Position des Set-Cursors
let setCursorX = 0;
let setCursorY = 0;
let setCursorLastX = 0;
let setCursorLastY = 0;

// Anzahl der zu ermittelnden Atome
let atomsCnt = 4; // Default

// Mindestanzahl zu ermittelnder Atome
let atomsMinCnt = 3;

// Maximal zu ermittelnde Atome
let atomsMaxCnt = 6;

// Flag ob das Spiel begonnen hat,
// wird auf false gesetzt sobald ein Strahl abgeschossen wurde
let gameNotStarted = true;

// Anzahl der gesetzten Atome
let setAtomsCnt = 0;

// Speicher für die belegten Abfragefelder (Rim-IDs)
let erg = [numberOfRimIDs + 1]; // wir fangen nicht bei 0 an
for (let i = 0; i < numberOfRimIDs + 1; i++) {
  erg[i] = false;
}

// Zähler der genutzten Randflächen
let rimUsed = 0;

// Flag ob es noch freie Randfläche (Rim-ID) gibt
let rimFree = true;

// Flag ob Abfrage-Cursor geparkt ist weil es keine freie Randfläche mehr gibt
let hold = false;

// Anzahl der Versuche
let trials = 0;

// Anzahl der Punkte
let score = 0;
let hits = 0;
let missed = 0;
let wrong = 0;

// Flag ob Lern-Modus aktiv ist d.h. ob Atome angezeigt werden sollen
let learnModeActive = false;

// Flags ob Spiel zu Ende ist.
let gameEndShow = false; // Spielergebnis anzeigen und dann Spiel (gameLoop()) beeenden
let gameEnd = false; // Spiel beenden - wird gesetzt nachdem Spielergebnis angezeigt wurde

// Statuszeile
let gamestatus;

// Ausgabetexte
let textAlert1;
let textAlert2;
let textAlert3;
let textAlert4;
let textAlert5;
let textAlert6;
let textAlert7;
let textAlert8;
let textAlert9;
let textAtoms;
let textTrials;
let textPoints;
let textHits;
let textMissed;
let textScore;

// wenn die eingestellte Browser-Sprache nicht Deutsch ist, wird alles auf Englisch angezeigt
if (navigator.language.indexOf("de") > -1) {
  // deutscher Text
  textAlert1 = deAlert1;
  textAlert2 = deAlert2;
  textAlert3 = deAlert3;
  textAlert4 = deAlert4;
  textAlert5 = deAlert5;
  textAlert6 = deAlert6;
  textAlert7 = deAlert7;
  textAlert8 = deAlert8;
  textAlert9 = deAlert9;
  textAtoms = deAtoms;
  textTrials = deTrials;
  textPoints = dePoints;
  textHits = deHits;
  textMissed = deMissed;
  textScore = deScore;
} else {
  // englischer Text
  textAlert1 = engAlert1;
  textAlert2 = engAlert2;
  textAlert3 = engAlert3;
  textAlert4 = engAlert4;
  textAlert5 = engAlert5;
  textAlert6 = engAlert6;
  textAlert7 = engAlert7;
  textAlert8 = engAlert8;
  textAlert9 = engAlert9;
  textAtoms = engAtoms;
  textTrials = engTrials;
  textPoints = engPoints;
  textHits = engHits;
  textMissed = engMissed;
  textScore = engScore;
}

// Parameter für im Intervall aufgerufene Funktionen - in diesem Fall nur gameLoop()
let gameLoopHandle;
let gameLoopIntervall = 100;

/*** Grafiken ***/
// Sound on
let soundOn = '<img src="img/speakerOn.png">';

// Sound off
let soundOff = '<img src="img/speakerOff.png">';

// Array für Abfrage-Cursor
let questionMarks = [
  '<img src="img/questionMarkBlue.png">', // normale Farbe blau
  '<img src="img/questionMarkOrange.png">', // orange Farbe wenn Abfrage-Cursor blockiert ist
];
let questionMark = questionMarks[0];
let questionMarkCurrent = 0;

// Grafiken für das Experimentierfeld im Set-Modus
let setAtomMark = '<img src="img/atom.png">'; // gesetztes Atom
let atomQuestionMark = '<img src="img/atomQuestionMark.png">'; // Cursor im Set-Modus
let atomRight = '<img src="img/atomRight.png">'; // richtig ermitteltes Atom
let atomWrong = '<img src="img/atomWrong.png">'; // falsch ermitteltes Atom
let atomMissed = '<img src="img/atom.png">'; // nicht ermittelte Atom

// Array mit Grafiken zur Anzeige wie viele Atome vom Spieler gesetzt wurden
let placedAtoms = [
  "",
  '<img src="img/atomSetCount1.png">',
  '<img src="img/atomSetCount2.png">',
  '<img src="img/atomSetCount3.png">',
  '<img src="img/atomSetCount4.png">',
  '<img src="img/atomSetCount5.png">',
  '<img src="img/atomSetCount6.png">',
];

let atomImage = '<img src="img/atom.png">'; // Grafik zur Anzeige von Atomen auf dem Experimentierfeld
let orbA = '<img src="img/orbA.png">'; // Anzeige Absorbiert
let orbR = '<img src="img/orbR.png">'; // Anzeige Reflektiert

// *** Array mit den Orbs zur Anzeige von Strahleintritt und Strahlaustritt ***
// Standard-Modus
let orbs1 = [
  '<img src="img/orb1.png">',
  '<img src="img/orb2.png">',
  '<img src="img/orb3.png">',
  '<img src="img/orb4.png">',
  '<img src="img/orb5.png">',
  '<img src="img/orb6.png">',
  '<img src="img/orb7.png">',
  '<img src="img/orb8.png">',
  '<img src="img/orb9.png">',
  '<img src="img/orb10.png">',
  '<img src="img/orb11.png">',
  '<img src="img/orb12.png">',
  '<img src="img/orb13.png">',
  '<img src="img/orb14.png">',
  '<img src="img/orb15.png">',
  '<img src="img/orb16.png">',
];
// Billardkugel-Modus - für Menschen die Probleme haben Farben zu unterscheiden
let orbs2 = [
  '<img src="img/orbA1.png">',
  '<img src="img/orbA2.png">',
  '<img src="img/orbA3.png">',
  '<img src="img/orbA4.png">',
  '<img src="img/orbA5.png">',
  '<img src="img/orbA6.png">',
  '<img src="img/orbA7.png">',
  '<img src="img/orbA8.png">',
  '<img src="img/orbA9.png">',
  '<img src="img/orbA10.png">',
  '<img src="img/orbA11.png">',
  '<img src="img/orbA12.png">',
  '<img src="img/orbA13.png">',
  '<img src="img/orbA14.png">',
  '<img src="img/orbA15.png">',
  '<img src="img/orbA16.png">',
];

let orbs = orbs1; // Default ist Standard-Modus
let orbsB = false; // Flag ob Billard-Modus aktiv

// drei Leerzeichen zur Trennung der Ausgabeinformationen in der Statuszeile
const space = "\xa0\xa0\xa0";

// Variablen für Soundeffekte - es wird die Howler-Library verwendet
// damit Soundeffekte parallel abgespielt werden können
// siehe https://howlerjs.com/
let absorbtionSnd;
let reflectionSnd;
let beamEndSnd;
let switch2BeamSnd;
let switch2SetSnd;
let goodGameEndSnd;
let gameEndSnd;
let moveBeamCursorSnd;
let moveSetCursorSnd;
let setAtomSnd;
let deleteAtomSnd;
let alertSnd;

// Variablen für die Tastatureingaben
let KEY_RIGHT = false; // die 'Pfeil nach rechts' Cursor-Taste
let KEY_LEFT = false; // die 'Pfeil nach links' Cursor-Taste
let KEY_UP = false; // die 'Pfeil nach oben' Cursor-Taste
let KEY_DOWN = false; // die 'Pfeil nach unten' Cursor-Taste
let KEY_ENTER = false; // die Eingabe-Taste
let KEY_CONTROL = false; // die STRG-Taste
let KEY_B = false; // die B-Taste
let KEY_E = false; // die E-Taste
let KEY_L = false; // die L-Taste
let KEY_S = false; // die S-Taste
let KEY_SHIFT = false; // die Shift-Taste

/**********************************/
/*      Tastatur abfragen         */
/**********************************/
/*        Event-Handler           */
/* wenn Taste gedrückt wurde      */
/**********************************/
document.onkeydown = function (e) {
  // console.log(">" + e.key + "<");

  // Cursor nach rechts gedrückt
  if (e.key == "ArrowRight") {
    KEY_RIGHT = true;
  }

  // Cursor nach links gedrückt
  if (e.key == "ArrowLeft") {
    KEY_LEFT = true;
  }

  // Cursor nach oben gedrückt
  if (e.key == "ArrowUp") {
    KEY_UP = true;
  }

  // Cursor nach unten gedrückt
  if (e.key == "ArrowDown") {
    KEY_DOWN = true;
  }

  // Eingabe wurde gedrückt
  if (e.key == "Enter") {
    KEY_ENTER = true;
  }

  // STRG wurde gedrückt
  if (e.key == "Control") {
    KEY_CONTROL = true;
  }

  // SHIFT wurde gedrückt
  if (e.key == "Shift") {
    KEY_SHIFT = true;
  }

  // B wurde gedrückt
  if (e.key == "b" || e.key == "B") {
    KEY_B = true;
  }

  // E wurde gedrückt
  if (e.key == "e" || e.key == "E") {
    KEY_E = true;
  }

  // L wurde gedrückt
  if (e.key == "l" || e.key == "L") {
    KEY_L = true;
  }

  // S wurde gedrückt
  if (e.key == "s" || e.key == "S") {
    KEY_S = true;
  }
};

/**********************************/
/*        Event-Handler           */
/* wenn Taste losgelassen wurde   */
/**********************************/
document.onkeyup = function (e) {
  // console.log(">" + e.key + "<");
  // Cursor nach rechts losgelassen
  if (e.key == "ArrowRight") {
    KEY_RIGHT = false;
  }

  // Cursor nach links losgelassen
  if (e.key == "ArrowLeft") {
    KEY_LEFT = false;
  }

  // Cursor nach oben losgelassen
  if (e.key == "ArrowUp") {
    KEY_UP = false;
  }

  // Cursor nach unten losgelassen
  if (e.key == "ArrowDown") {
    KEY_DOWN = false;
  }

  // Eingabe wurde losgelassen
  if (e.key == "Enter") {
    KEY_ENTER = false;
  }

  // STRG wurde losgelassen
  if (e.key == "Control") {
    KEY_CONTROL = false;
  }

  // Shift wurde losgelassen
  if (e.key == "Shift") {
    KEY_SHIFT = false;
  }

  // B wurde losgelassen
  if (e.key == "b" || e.key == "B") {
    KEY_B = false;
  }

  // E wurde losgelassen
  if (e.key == "e" || e.key == "E") {
    KEY_E = false;
  }

  // L wurde losgelassen
  if (e.key == "l" || e.key == "L") {
    KEY_L = false;
  }

  // S wurde losgelassen
  if (e.key == "s" || e.key == "S") {
    KEY_S = false;
  }
};

/**************************************/
/*       Spiel starten                */
/*                                    */
/*    Diese Funktion wird über den    */
/*    body der Seite index.html       */
/*    aufgerufen                      */
/**************************************/
function startGame() {
  // Abfrage-Modus aktivieren
  currentMode = mode.Beam;

  // Abfrage-Cursor anzeigen
  // der Cursor wird durch die Funktionen moveBeamCursorRight() und moveBeamCursorLeft() versetzt
  document.getElementById(beamCursor).innerHTML = questionMark;

  // Atome zufällig auf dem Experimentierfeld verteilen
  setAtoms();

  // Aufruf von Funktionen, die im zeitlichen Intervall immer wieder aufgerufen werden - in diesem Fall nur gameLoop()
  gameLoopHandle = setInterval(gameLoop, gameLoopIntervall);
}

/*******************************/
/* Die Spiel-Schleife          */
/* von der aus alles gesteuert */
/* wird                        */
/*******************************/
function gameLoop() {
  if (gameEnd) {
    // gameLoop beenden
    clearInterval(gameLoopHandle);
    return;
  }

  // Sound ein und ausschalten
  // document.getElementById("speaker").innerHTML = ""
  if (KEY_S && !toogleSoundModeBlocked) {
    toogleSoundModeBlocked = true; // bis zum loslassen der S-Taste weiteren Aufruf blockieren
    if (soundActive) {
      soundActive = false;
      document.getElementById("speaker").innerHTML = soundOff;
      setTimeout(clearSoundField, 4000);
    } else {
      soundActive = true;
      if (!soundInitialized) {
        initializeSound();
      }
      document.getElementById("speaker").innerHTML = soundOn;
      setTimeout(clearSoundField, 4000);
    }
  }

  if (!KEY_S) {
    toogleSoundModeBlocked = false; // Blockade aufheben
  }

  // Lern-Modus ein und ausschalten
  if (KEY_L && !toogleLearnModeBlocked) {
    toogleLearnModeBlocked = true; // bis zum loslassen der L-Taste weiteren Aufruf blockieren
    if (gameNotStarted) {
      if (learnModeActive) {
        learnModeActive = false;
        setAtoms();
      } else {
        learnModeActive = true;
        setAtoms();
      }
    } else {
      userMessage(textAlert7);
    }
  }

  if (!KEY_L) {
    toogleLearnModeBlocked = false; // Blockade aufheben
  }

  /** Anzahl Atome verändern **/
  // Anzahl Atome erhöhen
  if (KEY_SHIFT && KEY_UP) {
    if (gameNotStarted) {
      if (atomsCnt < atomsMaxCnt) {
        ++atomsCnt;
        setAtoms();
      }
    } else {
      userMessage(textAlert5);
    }
  }

  // Anzahl Atome verringern
  if (KEY_SHIFT && KEY_DOWN) {
    if (gameNotStarted) {
      if (atomsCnt > atomsMinCnt) {
        --atomsCnt;
        setAtoms();
      }
    } else {
      userMessage(textAlert5);
    }
  }

  // Anzeige der Orbs zwischen Standard- und Billardkugel-Modus hin und her schalten
  if (KEY_B && !toggleOrbsBlocked) {
    toggleOrbsBlocked = true; // bis zum loslassen der B-Taste weiteren Aufruf blockieren
    toggleOrbs();
  }

  if (!KEY_B) {
    toggleOrbsBlocked = false; // Blockade aufheben
  }

  // Cursor nach rechts bewegen
  if (KEY_RIGHT) {
    switch (currentMode) {
      case mode.Beam:
        moveBeamCursorRight();
        break;
      case mode.Set:
        moveSetCursorRight();
        break;
      default:
        console.log("KEY_RIGHT down: Modus currentMode nicht definiert.");
    }
  }

  // Cursor nach links bewegen
  if (KEY_LEFT) {
    switch (currentMode) {
      case mode.Beam:
        moveBeamCursorLeft();
        break;
      case mode.Set:
        moveSetCursorLeft();
        break;
      default:
        console.log("KEY_LEFT down: Modus nicht definiert.");
    }
  }

  // Cursor nach oben bewegen
  if (KEY_UP) {
    switch (currentMode) {
      case mode.Beam:
        // moveBeamCursorLeft();
        break;
      case mode.Set:
        moveSetCursorUp();
        break;
      default:
        console.log("KEY_UP down: Modus nicht definiert.");
    }
  }

  // Cursor nach unten bewegen
  if (KEY_DOWN) {
    switch (currentMode) {
      case mode.Beam:
        // moveBeamCursorLeft();
        break;
      case mode.Set:
        moveSetCursorDown();
        break;
      default:
        console.log("KEY_DOWN down: Modus nicht definiert.");
    }
  }

  // Eingabe auswerten
  if (KEY_ENTER) {
    switch (currentMode) {
      case mode.Beam:
        // Strahlengang berechnen
        gameNotStarted = false;
        document.getElementById("orbs").innerHTML = "";
        calculateBeam();
        break;
      case mode.Set:
        // Atom auf dem Experimentierfeld setzen oder löschen
        if (!setAtomCursorBlocked) {
          setAtomCursorBlocked = true; // bis zum loslassen der Enter-Taste weiteren Aufruf blockieren
          toggleSetAtom();
        }
        break;
      default:
        console.log("KEY_ENTER down: Modus nicht definiert.");
    }
  }

  // Eingabe losgelassen auswerten
  if (!KEY_ENTER) {
    switch (currentMode) {
      case mode.Beam:
        // Abfrage-Cursor wieder blau anzeigen
        if (rimFree == true) {
          questionMark = questionMarks[0];
          document.getElementById(beamCursor).innerHTML = questionMark;
        }
        beamCursorBlocked = false; // Blockade des Abrage-Cursor aufheben
        break;
      case mode.Set:
        setAtomCursorBlocked = false; // Blockade des Setz-Cursor aufheben
        break;
      default:
        console.log("KEY_ENTER up: Modus nicht definiert.");
    }
  }

  if (KEY_CONTROL && !setCursorBlocked) {
    // zwischen Abfrage- und Setz-Modus hin und her wechseln
    setCursorBlocked = true; // bis zum loslassen der STRG-Taste weiteren Aufruf blockieren
    switchMode();
  }

  if (!KEY_CONTROL) {
    // Blockade der STRG/CTRL-Taste aufheben
    setCursorBlocked = false;
  }

  if (KEY_E) {
    // Resultat anzeigen
    calculateResult();
  }

  // Statuszeile anzeigen
  if (gameEndShow == false) {
    gamestatus =
      textAtoms +
      atomsCnt +
      space +
      textTrials +
      trials +
      space +
      textHits +
      hits +
      space +
      textMissed +
      wrong +
      space +
      textPoints +
      score;
  } else {
    gamestatus =
      textAtoms +
      atomsCnt +
      space +
      textTrials +
      trials +
      space +
      textHits +
      hits +
      space +
      textMissed +
      wrong +
      space +
      textScore +
      score;
    gameEnd = true;
  }
  document.getElementById("status").innerHTML = gamestatus;
}

/*************************************
 * Löscht die Anzeige des Sound-Modus
 *************************************/
function clearSoundField() {
  document.getElementById("speaker").innerHTML = "";
  KEY_S = false;
}

/**********************************
 * Initialisiert die Sound-Effekte
 **********************************/
function initializeSound() {
  soundInitialized = true;

  // Soundeffekte initialisieren
  switch2SetSnd = new Howl({
    src: ["snd/setMode.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  switch2BeamSnd = new Howl({
    src: ["snd/beamMode.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  absorbtionSnd = new Howl({
    src: ["snd/absorbtion.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  reflectionSnd = new Howl({
    src: ["snd/reflection.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  beamEndSnd = new Howl({
    src: ["snd/beamEnd.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  setAtomSnd = new Howl({
    src: ["snd/setAtom.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  deleteAtomSnd = new Howl({
    src: ["snd/deleteAtom.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  goodGameEndSnd = new Howl({
    src: ["snd/goodGameEnd.mp3"],
    volume: 0.5,
    autoplay: false,
    html5: true,
  });

  gameEndSnd = new Howl({
    src: ["snd/gameEnd.mp3"],
    volume: 0.5,
    autoplay: false,
    html5: true,
  });

  moveBeamCursorSnd = new Howl({
    src: ["snd/moveBeamCursor.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  moveSetCursorSnd = new Howl({
    src: ["snd/moveSetCursor.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });

  alertSnd = new Howl({
    src: ["snd/alert.mp3"],
    volume: 0.2,
    autoplay: false,
    html5: true,
  });
}

/*************************************
 * Wechselt zwischen der Standard und
 * Billardkugel-Anzeige hin und her
 *************************************/
function toggleOrbs() {
  if (gameNotStarted) {
    if (orbsB) {
      // Standard-Anzeige wieder aktivieren
      orbs = orbs1;
      randomOrbs = true;
      orbsB = false;
      document.getElementById("orbs").innerHTML = orbs1[0];
    } else {
      // Billard-Anzeige aktivieren
      orbs = orbs2;
      randomOrbs = false;
      orbsB = true;
      document.getElementById("orbs").innerHTML = orbs2[0];
    }
  } else {
    // wenn Wechsel nicht mehr möglich Benutzer informieren
    userMessage(textAlert6);
  }
}

/************************************
 * Setzt alle Tasten auf losgelassen
 ************************************/
function clearKeyboardBuffer() {
  KEY_SHIFT = false;
  KEY_CONTROL = false;
  KEY_UP = false;
  KEY_DOWN = false;
  KEY_RIGHT = false;
  KEY_LEFT = false;
  KEY_ENTER = false;
  KEY_B = false;
  KEY_E = false;
  KEY_L = false;
  KEY_S = false;
}

/************************************
 * Umschalten der verschiedenen Modi
 ************************************/
function switchMode() {
  switch (currentMode) {
    case mode.Beam:
      if (!learnModeActive) {
        currentMode = mode.Set;
        document.getElementById(getSetID()).innerHTML = atomQuestionMark;
        questionMark = questionMarks[1];
        if (!hold) {
          if (soundActive) {
            switch2SetSnd.play();
          }
          document.getElementById(beamCursor).innerHTML = questionMark;
        } else {
          document.getElementById("hold").innerHTML = questionMark;
        }
      } else {
        userMessage(textAlert9);
      }
      break;
    case mode.Set:
      currentMode = mode.Beam;
      if (atomSetArray[setCursorX][setCursorY] == 0) {
        document.getElementById(getSetID()).innerHTML = "";
      } else {
        document.getElementById(getSetID()).innerHTML = atomImage;
      }
      questionMark = questionMarks[0];
      if (!hold) {
        if (soundActive) {
          switch2BeamSnd.play();
        }
        document.getElementById(beamCursor).innerHTML = questionMark;
      } else {
        document.getElementById("hold").innerHTML = questionMark;
      }
      break;
    default:
      console.log("switchMode(): currentMode nicht definiert.");
  }
}

/*************************************************
 * Gibt eine Nachricht an den Benutzer
 * über ein Fenster aus was mit einem
 * Ok-Button geschlossen wird.
 *
 * Stellt alle Tastatur-Eingaben
 * auf false
 *
 * @param {*} message  die auszugebende Nachricht
 *************************************************/
function userMessage(message) {
  if (soundActive) {
    alertSnd.play();
  }
  window.alert(message);
  clearKeyboardBuffer();
}

/***************************************
 * Gibt einen eindeutigen Orb (Grafik)
 * aus dem Orb-Array zurück
 *
 * @returns Orb
 ***************************************/
function getOrb() {
  let x = 0;
  let sucess = false;
  let orb;

  // entweder
  if (randomOrbs) {
    // zufälligen noch nicht genutzen Orb auswählen
    do {
      x = rand(0, numberOfOrbs - 1); // wir fangen bei 0 und nicht bei 1 an
      if (orbsUsed[x] == false) {
        orbsUsed[x] = true;
        sucess = true;
      }
    } while (sucess == false);
    orb = orbs[x];
  } else {
    // oder den nächsten nicht genutzten Orb in aufsteigender Reihenfolge auswählen
    orb = orbs[currOrb];
    currOrb++;
  }
  return orb;
}

/**********************************************************
 * Gibt eine Zufallszahl aus der
 * Zahlenmenge min bis max zurück
 *
 * @param {*} min kleinste Zahl
 * @param {*} max größte Zahl
 * @returns Zufallszahl aus der Zahlenmenge min bis max
 **********************************************************/
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**************************************
 * Setzt den Abfrage-Cursor auf das
 * nächste freie Feld
 * gegen den Uhrzeigersinn
 *
 * @returns nothing
 **************************************/
function moveBeamCursorRight() {
  // Funktion verlassen wenn es kein freies Abragefeld mehr gibt
  if (rimFree == false) return;

  lastBeamCursor = beamCursor;
  let free = false;
  do {
    ++beamCursor;
    if (beamCursor == numberOfRimIDs + 1) {
      beamCursor = 1;
    }
    if (erg[beamCursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastBeamCursor).innerHTML = "";
  document.getElementById(beamCursor).innerHTML = questionMark;

  if (soundActive) {
    moveBeamCursorSnd.play();
  }
}

/**************************************
 * Setzt den Abfrage-Cursor auf das
 * nächste freie Feld
 * im Uhrzeigersinn
 *
 * @returns nothing
 **************************************/
function moveBeamCursorLeft() {
  // Funktion verlassen wenn es kein freies Abragefeld mehr gibt
  if (rimFree == false) return;

  lastBeamCursor = beamCursor;
  let free = false;
  do {
    --beamCursor;
    if (beamCursor == 0) {
      beamCursor = numberOfRimIDs;
    }
    if (erg[beamCursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastBeamCursor).innerHTML = "";
  document.getElementById(beamCursor).innerHTML = questionMark;

  if (soundActive) {
    moveBeamCursorSnd.play();
  }
}

/******************************
 * Bewegt den Abfrage-Cursor
 * auf das nächste freie Feld
 * nach rechts.
 * Falls kein Feld frei ist
 * wird die Funktion sofort
 * verlassen
 *
 * @param {number} count die
 *     Anzahl der benötigten
 *     Rim-Felder.
 ******************************/
function setCursorAfterBeam(count) {
  if (count == 2 && rimUsed == numberOfRimIDs - 2) return;
  if (count == 1 && rimUsed == numberOfRimIDs - 1) return;

  moveBeamCursorRight();
}

/*******************************
 * Ermittelt aus der aktuellen
 * Set-Cursor Position die
 * zugehörige Feld-ID des
 * Experimentierfeldes und
 * gibt diese zurück
 *
 * @returns aktuelle Feld-ID
 *******************************/
function getSetID() {
  let setID = "f" + setCursorX + setCursorY;
  return setID;
}

/*******************************
 * Ermittelt aus der vorherigen
 * Set-Cursor Position die
 * zugehörige Feld-ID des
 * Experimentierfeldes und
 * gibt diese zurück
 *
 * @returns vorherige Feld-ID
 *******************************/

function getLastSetID() {
  let setLastID = "f" + setCursorLastX + setCursorLastY;
  return setLastID;
}

/****************************
 * Ermittelt die Feld-ID
 * aus den x, y Koordinaten
 *
 * @param {*} x Koordinate
 * @param {*} y Koordinate
 * @returns Feld-ID
 ****************************/
function getID(x, y) {
  let setID = "f" + x + y;
  return setID;
}

/************************************
 * Ermittelt aus den Koordinaten
 * x und y sowie der Strahlrichtung
 * die Rim-ID und gibt diese zurück
 *
 * @param {*} x Koordiante
 * @param {*} y Koordiante
 * @param {*} direction Richtung
 * @returns Rim-ID
 ************************************/
function getRimID(x, y, direction) {
  let cutDirec = direction.substring(3, 4);
  let key = x + "." + y + "." + cutDirec;
  let rimID = coordinates2Beam.get(key);
  return rimID;
}

/********************************
 * Setzt den Set-Cursor eine
 * Position nach rechts
 ********************************/
function moveSetCursorRight() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorX < lengthX) {
    setCursorX++;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;

    if (soundActive) {
      moveSetCursorSnd.play();
    }  
  }
}

/********************************
 * Setzt den Set-Cursor eine
 * Position nach links
 ********************************/
function moveSetCursorLeft() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorX > 0) {
    setCursorX--;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;

    if (soundActive) {
      moveSetCursorSnd.play();
    }  
  }
}

/********************************
 * Setzt den Set-Cursor eine
 * Position nach oben
 ********************************/
function moveSetCursorUp() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorY > 0) {
    setCursorY--;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;

    if (soundActive) {
      moveSetCursorSnd.play();
    }  
  }
}

/********************************
 * Setzt den Set-Cursor eine
 * Position nach unten
 ********************************/
function moveSetCursorDown() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorY < lengthY) {
    setCursorY++;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;

    if (soundActive) {
      moveSetCursorSnd.play();
    }  
  }
}

/********************************
 * Setzt und löscht im Wechsel
 * ein Atom an der Position des
 * Set-Cursors
 ********************************/
function toggleSetAtom() {
  let fid = getSetID();

  if (atomSetArray[setCursorX][setCursorY] == 0) {
    setAtomProbeField();
    document.getElementById(fid).innerHTML = setAtomMark;
  } else {
    deleteAtomProbeField();
    document.getElementById(fid).innerHTML = "";
  }
}

/********************************
 * Setzt ein Atom an der
 * Position des Set-Cursors
 ********************************/
function setAtomProbeField() {
  if (setAtomsCnt < atomsCnt) {
    if (soundActive) {
      setAtomSnd.play();
    }
    atomSetArray[setCursorX][setCursorY] = 1;
    ++setAtomsCnt;
    document.getElementById("setcnt").innerHTML = placedAtoms[setAtomsCnt];
  } else {
    userMessage(textAlert3 + atomsCnt + textAlert4);
  }
}

/********************************
 * Löscht ein Atom an der
 * Position des Set-Cursors
 ********************************/
function deleteAtomProbeField() {
  atomSetArray[setCursorX][setCursorY] = 0;
  --setAtomsCnt;
  document.getElementById("setcnt").innerHTML = placedAtoms[setAtomsCnt];
  if (soundActive) {
    deleteAtomSnd.play();
  }
}

/**************************************
 * Verteilt <atomsCnt> Atome auf dem
 * Experimentierfeld auf zufälligen
 * Positionen
 **************************************/
function setAtoms() {
  // bereits gesetzte Atome löschen
  for (let x = 0; x <= lengthX; x++) {
    for (let y = 0; y <= lengthY; y++) {
      atomArray[x][y] = 0;
      // auch aus Anzeige löschen, falls showAtoms() aktiv
      document.getElementById("f" + x + y).innerHTML = "";
    }
  }

  // Atome zufällig verteilen
  for (let i = 1; i <= atomsCnt; i++) {
    let sucess = false;
    do {
      let x = rand(1, lengthX + 1) - 1;
      let y = rand(1, lengthY + 1) - 1;
      if (atomArray[x][y] == 0) {
        sucess = true;
        atomArray[x][y] = 1;
      }
    } while (sucess == false);
  }
  if (learnModeActive) {
    showAtoms();
  }
}

/*******************************
 * Zeigt die Atome auf dem
 * Experimentierfeld an
 *******************************/
function showAtoms() {
  for (let x = 0; x <= lengthX; x++) {
    for (let y = 0; y <= lengthY; y++) {
      if (atomArray[x][y] == 1) {
        document.getElementById("f" + x + y).innerHTML = atomImage;
      }
    }
  }
}

/*******************************
 * Berechnet das Ergebnis
 * einer Eingabe und zeigt
 * es auf dem Spielbrett an
 *
 * @returns nothing
 *******************************/
function calculateBeam() {
  if (rimFree == false) return;
  if (beamCursorBlocked) return;

  let points;

  // beam2Coordinates
  // Array mit der Zuordnung der Position des Abfrage-Cursors (Rim-ID) zu den Feldkoordinaten und der Strahlrichtung
  // [0] = X-Koordinate, [1] = Y-Koordinate, [2] = Strahlrichtung (West-Ost: incX, Süd-Nord: decY, Ost-West: decX, Nord-Süd: incY)
  // beam2Coordinates[0] ist null, damit die Rim-ID direkt als Index für das Array verwendet werden kann
  let beam = beam2Coordinates[beamCursor].split(".");

  // Container mit allen nötigen Daten für den Verlauf des Untersuchungsstrahls
  let beamContainer = {
    mode: beam[2], // Strahlrichtung (incX, decY, decX, incY)
    ex: 0, // Anfangskoordinate X bleibt konstant während eines Strahls
    ey: 0, // Anfangskoordinate Y bleibt konstant während eines Strahls
    x: parseInt(beam[0]), // Anfangskoordinate X wird mit dem Fortschritt des Strahls abgeglichen
    y: parseInt(beam[1]), // Anfangskoordinate Y  wird mit dem Fortschritt des Strahls abgeglichen
    beamEntry: beamCursor, // Rim-ID des Abfrage-Cursor
    beamExit: null, // TODO wird nicht gebraucht
    points: 0, // Anzahl Punkte
    beamEnd: false, // Flag ob Strahlende erreicht ist
  };

  // in Abhängigkeit der Strahlrichtung wird die Anfangskoordinate angepasst, weil als erstes der Strahl in der angegebenen
  // Richtung verschoben und dann die Auswirkung betrachtet wird
  switch (beamContainer.mode) {
    case "incX":
      beamContainer.x--;
      break;
    case "decY":
      beamContainer.y++;
      break;
    case "decX":
      beamContainer.x++;
      break;
    case "incY":
      beamContainer.y--;
      break;
    default:
      console.log("Unbekannter investigationMode " + investigationMode);
  }

  beamContainer.ex = beamContainer.x;
  beamContainer.ey = beamContainer.y;

  do {
    switch (beamContainer.mode) {
      case "incX":
        console.log("calculateBeam: West-Ost");
        break;
      case "decY":
        console.log("calculateBeam: Süd-Nord");
        break;
      case "decX":
        console.log("calculateBeam: Ost-West");
        break;
      case "incY":
        console.log("calculateBeam: Nord-Süd");
        break;
      default:
        console.log("Unbekannter investigationMode " + investigationMode);
    }
    moveBeam(beamContainer);
  } while (beamContainer.beamEnd == false);

  ++trials;
  points = beamContainer.points;

  // Punktestand abgleichen
  // score = score + points;
  score = score + beamContainer.points;

  // Anzahl genutzter Randfelder erhöhen
  rimUsed = rimUsed + points; // TODO rimUsed hat immer den gleichen Wert wie score

  // Abfrage-Cursor parken wenn kein Platz mehr frei ist und Status merken
  if (rimUsed >= 32) {
    rimFree = false;
    hold = true;
    document.getElementById("hold").innerHTML = questionMark;
  }

  // Wenn noch Platz frei ist Cursor bis zum Loslassen der Return-Taste blockieren
  // um unbeabsichtigtes mehrfaches Abfeuern zu verhindern
  if (rimFree) {
    beamCursorBlocked = true;
    questionMark = questionMarks[1];
    document.getElementById(beamCursor).innerHTML = questionMark;
  }
}

/*********************************************************
 * Bewegt den Untersuchungsstrahl
 * über das Experimentierfeld
 *
 * @param {*} beamContainer enthält alle benötigten Daten
 * @returns beamContainer mit abgeglichenen Daten
 *********************************************************/
function moveBeam(beamContainer) {
  // Hauptstrahl MainBeam
  let fieldMB = {
    x: undefined, // X-Koordinate
    y: undefined, // Y-Koordinate
    valid: true, // Hauptstrahl ist immer gültig
  };

  // Nebenstrahl links LeftBeam
  let fieldLB = {
    x: undefined, // X-Koordinate
    y: undefined, // Y-Koordinate
    valid: false, // Nebenstrahl ist nur innerhalb des Experimentierfeldes gültig
  };

  // Nebenstrahl rechts RightBeam
  let fieldRB = {
    x: undefined, // X-Koordinate
    y: undefined, // Y-Koordinate
    valid: false, // Nebenstrahl ist nur innerhalb des Experimentierfeldes gültig
  };

  if (beamContainer.mode == "incX") {
    console.log("moveBeam() incX läuft.");
    if (beamContainer.x < lengthX) {
      beamContainer.x++;
      if (beamContainer.y > 0) {
        fieldLB.x = beamContainer.x;
        fieldLB.y = beamContainer.y - 1;
        fieldLB.valid = true;
      }
      if (beamContainer.y < lengthY) {
        fieldRB.x = beamContainer.x;
        fieldRB.y = beamContainer.y + 1;
        fieldRB.valid = true;
      }
    } else {
      // Strahlenende erreicht
      setBeamEnd(beamContainer);
    }
  } else if (beamContainer.mode == "decY") {
    console.log("moveBeam() decY läuft.");
    if (beamContainer.y > 0) {
      beamContainer.y--;
      if (beamContainer.x > 0) {
        fieldLB.x = beamContainer.x - 1;
        fieldLB.y = beamContainer.y;
        fieldLB.valid = true;
      }
      if (beamContainer.x < lengthX) {
        fieldRB.x = beamContainer.x + 1;
        fieldRB.y = beamContainer.y;
        fieldRB.valid = true;
      }
    } else {
      // Strahlenende erreicht
      setBeamEnd(beamContainer);
    }
  } else if (beamContainer.mode == "decX") {
    console.log("moveBeam() decX läuft.");
    if (beamContainer.x > 0) {
      beamContainer.x--;
      if (beamContainer.y > 0) {
        fieldRB.x = beamContainer.x;
        fieldRB.y = beamContainer.y - 1;
        fieldRB.valid = true;
      }
      if (beamContainer.y < lengthY) {
        fieldLB.x = beamContainer.x;
        fieldLB.y = beamContainer.y + 1;
        fieldLB.valid = true;
      }
    } else {
      // Strahlenende erreicht
      setBeamEnd(beamContainer);
    }
  } else if (beamContainer.mode == "incY") {
    console.log("moveBeam() incY läuft.");
    if (beamContainer.y < lengthY) {
      beamContainer.y++;
      if (beamContainer.x > 0) {
        fieldRB.x = beamContainer.x - 1;
        fieldRB.y = beamContainer.y;
        fieldRB.valid = true;
      }
      if (beamContainer.x < lengthX) {
        fieldLB.x = beamContainer.x + 1;
        fieldLB.y = beamContainer.y;
        fieldLB.valid = true;
      }
    } else {
      // Strahlenende erreicht
      setBeamEnd(beamContainer);
    }
  }
  fieldMB.x = beamContainer.x;
  fieldMB.y = beamContainer.y;
  beamContainer = checkFields(fieldMB, fieldLB, fieldRB, beamContainer);
  return beamContainer;
}

/************************************************************
 * Überprüft den Untersuchungsstrahl auf
 * Richtungsänderung, Absorption und Reflektion
 *
 * @param {*} fieldMB Hauptstrahl
 * @param {*} fieldLB Nebenstrahl links
 * @param {*} fieldRB Nebenstrahl rechts
 * @param {*} beamContainer enthält alle benötigten Daten
 * @returns beamContainer mit abgeglichenen Daten
 ************************************************************/
function checkFields(fieldMB, fieldLB, fieldRB, beamContainer) {
  // Überprüfen auf Richtungsänderung, dabei zunächst Reflexion durch zwei Atome checken
  if (fieldLB.valid && fieldRB.valid) {
    if (
      atomArray[fieldMB.x][fieldMB.y] == 0 && // Hauptstrahl trifft auf kein Atom
      atomArray[fieldLB.x][fieldLB.y] == 1 && // aber linker Nebenstrahl trifft auf Atom
      atomArray[fieldRB.x][fieldRB.y] == 1 // und rechter Nebenstrahl triff auf Atom
    ) {
      console.log("Reflektion LB + RB!");
      beamContainer.beamEnd = true;
      beamContainer.points = 1;
      erg[beamContainer.beamEntry] = true;
      setCursorAfterBeam(beamContainer.points);
      document.getElementById(beamContainer.beamEntry).innerHTML = orbR;
      if (soundActive) {
        reflectionSnd.play();
      }
      return beamContainer;
    }
  }
  // Überprüfen auf Richtungsänderung
  // Linker Nebenstrahl
  if (fieldLB.valid) {
    if (
      atomArray[fieldLB.x][fieldLB.y] == 1 &&
      atomArray[fieldMB.x][fieldMB.y] == 0
    ) {
      switch (beamContainer.mode) {
        case "incX":
          beamContainer.x--;
          beamContainer.mode = "incY";
          console.log("checkfields: West-Ost -> Nord-Süd");
          break;
        case "decY":
          beamContainer.y++;
          beamContainer.mode = "incX";
          console.log("checkfields: Süd-Nord -> West-Ost");
          break;
        case "decX":
          beamContainer.x++;
          beamContainer.mode = "decY";
          console.log("checkfields: Ost-West -> Süd-Nord");
          break;
        case "incY":
          beamContainer.y--;
          beamContainer.mode = "decX";
          console.log("checkfields: Nord-Süd -> Ost-West");
          break;
        default:
          console.log("Unbekannter investigationMode " + investigationMode);
      }
      // wenn nach einer Richtungsänderung das aktuelle Feld mit dem Eintrittsfeld identisch ist
      // haben wir eine Reflektion
      if (
        beamContainer.x == beamContainer.ex &&
        beamContainer.y == beamContainer.ey
      ) {
        console.log("Reflektion LB!");
        beamContainer.beamEnd = true;
        beamContainer.points = 1;
        erg[beamContainer.beamEntry] = true;
        setCursorAfterBeam(beamContainer.points);
        document.getElementById(beamContainer.beamEntry).innerHTML = orbR;
        if (soundActive) {
          reflectionSnd.play();
        }
      }
      return beamContainer;
    }
  }

  // Rechter Nebenstrahl
  if (fieldRB.valid) {
    if (
      atomArray[fieldRB.x][fieldRB.y] == 1 &&
      atomArray[fieldMB.x][fieldMB.y] == 0
    ) {
      switch (beamContainer.mode) {
        case "incX":
          beamContainer.x--;
          beamContainer.mode = "decY";
          console.log("checkfields: West-Ost -> Süd-Nord");
          break;
        case "decY":
          beamContainer.y++;
          beamContainer.mode = "decX";
          console.log("checkfields: Süd-Nord -> Ost-West");
          break;
        case "decX":
          beamContainer.x++;
          beamContainer.mode = "incY";
          console.log("checkfields: Ost-West -> Nord-Süd");
          break;
        case "incY":
          beamContainer.y--;
          beamContainer.mode = "incX";
          console.log("checkfields: Nord-Süd -> West-Ost");
          break;
        default:
          console.log("Unbekannter investigationMode " + investigationMode);
      }
      // wenn nach einer Richtungsänderung das aktuelle Feld mit dem Eintrittsfeld identisch ist
      // haben wir eine Reflektion
      if (
        beamContainer.x == beamContainer.ex &&
        beamContainer.y == beamContainer.ey
      ) {
        beamContainer.beamEnd = true;
        beamContainer.points = 1;
        erg[beamContainer.beamEntry] = true;
        setCursorAfterBeam(beamContainer.points);
        document.getElementById(beamContainer.beamEntry).innerHTML = orbR;
        if (soundActive) {
          reflectionSnd.play();
        }
        console.log("Reflektion RB!");
      }
      return beamContainer;
    }
  }

  // Überprüfen auf Treffer / Absorption
  if (atomArray[fieldMB.x][fieldMB.y] == 1) {
    console.log("Absorption!");
    beamContainer.beamEnd = true;
    beamContainer.points = 1;
    erg[beamContainer.beamEntry] = true;
    setCursorAfterBeam(beamContainer.points);
    document.getElementById(beamContainer.beamEntry).innerHTML = orbA;
    if (soundActive) {
      absorbtionSnd.play();
    }
    return beamContainer;
  }

  return beamContainer;
}

/***********************************************************
 * Diese Funktion wird aufgerufen wenn ein
 * Strahl das Experimentierfeld durchquert hat, d.h. es
 * eine unterschiedliche Ein- und Austrittsstelle gibt.
 * Die Funktion markiert den Anfang und das Ende
 * des Strahls mit zwei gleichfarbigen Kugeln
 *
 * @param {*} beamContainer enthält alle benötigten Daten
 ***********************************************************/
function setBeamEnd(beamContainer) {
  beamContainer.beamEnd = true;
  beamContainer.points = 2;
  let beamEntry = beamContainer.beamEntry;
  let beamEnd = getRimID(beamContainer.x, beamContainer.y, beamContainer.mode);
  let beam = getOrb();
  erg[beamEntry] = true;
  erg[beamEnd] = true;
  setCursorAfterBeam(beamContainer.points);
  document.getElementById(beamEntry).innerHTML = beam;
  document.getElementById(beamEnd).innerHTML = beam;
  console.log("Strahlende: Anfang: " + beamEntry + " Ende: " + beamEnd);
  if (soundActive) {
    beamEndSnd.play();
  }
}

/*************************************
 * Vergleicht die vom Spieler
 * gesetzten Atome mit dem vom
 * Computer versteckten, setzt dazu
 * die entsprechenden Grafiken auf
 * dem Eperimentierfeld und
 * ermittelt den Punktestand
 *
 * @returns nothing
 *************************************/
function calculateResult() {
  // Spieler informieren, dass die Auswertung im Lern-Modus nicht aktiv ist
  if (learnModeActive) {
    userMessage(textAlert8);
    return;
  }

  // Spieler informieren, dass vor der Auswertung erst alle Atome gesetzt sein müssen
  if (setAtomsCnt < atomsCnt) {
    userMessage(textAlert1 + atomsCnt + textAlert2);
    return;
  }

  hits = 0;
  missed = 0; // TODO wird eigentlich nicht gebraucht
  wrong = 0;

  // Auswertung der Treffer und setzen der grafischen Darstellung
  for (let x = 0; x <= lengthX; x++) {
    for (let y = 0; y <= lengthY; y++) {
      if (atomArray[x][y] == 1 && atomSetArray[x][y] == 1) {
        document.getElementById(getID(x, y)).innerHTML = atomRight;
        ++hits;
      } else if (atomArray[x][y] == 0 && atomSetArray[x][y] == 1) {
        document.getElementById(getID(x, y)).innerHTML = atomWrong;
        ++wrong;
      } else if (atomArray[x][y] == 1 && atomSetArray[x][y] == 0) {
        document.getElementById(getID(x, y)).innerHTML = atomMissed;
        ++missed;
      }
    }
  }

  // Falls der Set-Cursor auf einem nicht gesetzten Feld steht dieses Feld löschen
  if (atomSetArray[setCursorX][setCursorY] == 0) {
    document.getElementById(getSetID()).innerHTML = "";
  }

  // Fragezeichen-Cursor wieder herstellen wenn er nicht im Hold steht
  questionMark = questionMarks[0];
  if (!hold) {
    document.getElementById(beamCursor).innerHTML = questionMark;
  }

  // Punktestand festlegen
  score = score + wrong * 5;

  // Sound abspielen
  if (soundActive) {
    if (wrong == 0) {
      goodGameEndSnd.play();
    } else {
      gameEndSnd.play();
    }
  }

  // Flag setzen dass das Spielende erreicht ist, aber noch einmal angezeigt werden soll
  gameEndShow = true;
}
