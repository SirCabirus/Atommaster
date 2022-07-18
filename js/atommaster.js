/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 1.62                           */
/* 18.06.2022                             */
/*                                        */
/* Frank Wolter                           */
/*                                        */
/******************************************/

/**************************************/
/* Globale Variablen und Konstanten   */
/**************************************/

// Array für die zu suchenden Atome
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

// Array für die gesetzen Atome
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

// Array mit den Modi
const mode = {
  Beam: Symbol("beam"), // Abfrage-Cursor bewegen, Untersuchungsstrahl abfeuern
  Set: Symbol("set"), // Atome auf dem Experementierfeld setzen
};

// aktueller Modus
let currentMode;

// sollen die Orbs in zufälliger Reihenfolge ausgegeben werden
let randomOrbs = true;

// ist der Cursor blockiert
let beamCursorBlocked = false;
let setCursorBlocked = false;
let setAtomCursorBlocked = false;

// Speicher der genutzten Orbs
let orbsUsed = [];
for (let i = 0; i < 16; i++) {
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

// Flag ob Veränderung der Anzahl der zu ermittelnden Atome erlaubt ist
// wird auf false gesetzt, sobald Abfrage-Cursor bewegt oder Strahl abgeschossen wurde
let atomsCntChangeAllowed = true;

// Anzahl der gesetzten Atome
let setAtomsCnt = 0;

// Speicher für die belegten Abfragefelder (Rim-IDs)
let erg = [33];
for (let i = 0; i < 33; i++) {
  erg[i] = false;
}

// Zähler der genutzten Randflächen
let rimUsed = 0;

// Flag ob es noch freie Randfläche (Rim-ID) gibt
let rimFree = true;

// Flag ob Abrage-Cursor geparkt ist weil es keine freie Randfläche mehr gibt
let hold = false;

// Anzahl der Versuche
let trials = 0;

// Anzahl der Punkte
let score = 0;
let hits = 0;
let missed = 0;
let wrong = 0;

// Flags ob Spiel zu Ende ist.
let gameEndShow = false;
let gameEnd = false;

// Statuszeile
let gamestatus;

// Ausgabetexte
let textAlert1;
let textAlert2;
let textAlert3;
let textAlert4;
let textAlert5;
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
  textAtoms = engAtoms;
  textTrials = engTrials;
  textPoints = engPoints;
  textHits = engHits;
  textMissed = engMissed;
  textScore = engScore;
}

// Parameter für im Intervall aufgerufene Funktionen
let gameLoopHandle;
let gameLoopIntervall = 100;

/*** Grafiken ***/
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

let atomImage = '<img src="img/atom.png">'; // Grafik zur Anzeige von Atomen af dem Experimentierfeld
let orbA = '<img src="img/orbA.png">'; // Anzeige Absorbiert
let orbR = '<img src="img/orbR.png">'; // Anzeige Reflektiert

// Array mit den Orbs zur Anzeige von Strahleintritt und Strahlaustritt
let orbs = [
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

// drei Leerzeichen zur Trennung der Ausgabeinformationen in der Statuszeile
const space = "\xa0\xa0\xa0";

// Variablen für die Tastatureingaben
let KEY_RIGHT = false; // die 'Pfeil nach rechts' Cursor-Taste
let KEY_LEFT = false; // die 'Pfeil nach links' Cursor-Taste
let KEY_UP = false; // die 'Pfeil nach oben' Cursor-Taste
let KEY_DOWN = false; // die 'Pfeil nach unten' Cursor-Taste
let KEY_ENTER = false; // die Eingabe-Taste
let KEY_CONTROL = false; // die STRG-Taste
let KEY_E = false; // die E-Taste
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

  // E wurde gedrückt
  if (e.key == "e" || e.key == "E") {
    KEY_E = true;
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

  // E wurde losgelassen
  if (e.key == "e" || e.key == "E") {
    KEY_E = false;
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

  // Atome zufällig auf dem Experementierfeld verteilen
  setAtoms();

  // Aufruf von Funktionen, die im zeitlichen Intervall immer wieder aufgerufen werden
  gameLoopHandle = setInterval(gameLoop, gameLoopIntervall);
}

/*******************************/
/* Die Spiel-Schleife          */
/* von der aus alles gesteuert */
/* wird                        */
/*******************************/
function gameLoop() {
  if (gameEnd) {
    // alle im Intervall aufgerufenen Funktionen beenden
    clearInterval(gameLoopHandle);
    return;
  }

  /** Anzahl Atome verändern **/
  // Anzahl Atome erhöhen
  if (KEY_SHIFT && KEY_UP) {
    if (atomsCntChangeAllowed) {
      if (atomsCnt < atomsMaxCnt) {
        ++atomsCnt;
        setAtoms();
      }
    } else {
      window.alert(textAlert5);
      deleteKeyboardBuffer();
    }
  }

  // Anzahl Atome erhöhen
  if (KEY_SHIFT && KEY_DOWN) {
    if (atomsCntChangeAllowed) {
      if (atomsCnt > atomsMinCnt) {
        --atomsCnt;
        setAtoms();
      }
    } else {
      window.alert(textAlert5);
      deleteKeyboardBuffer();
    }
  }

  // Cursor nach rechts bewegen
  if (KEY_RIGHT) {
    switch (currentMode) {
      case mode.Beam:
        atomsCntChangeAllowed = false;
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
        atomsCntChangeAllowed = false;
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
        atomsCntChangeAllowed = false;
        calculateBeam();
        break;
      case mode.Set:
        toggleSetAtom();
        setAtomCursorBlocked = true;
        break;
      default:
        console.log("KEY_ENTER down: Modus nicht definiert.");
    }
  }

  // Eingabe losgelassen auswerten
  if (!KEY_ENTER) {
    switch (currentMode) {
      case mode.Beam:
        if (rimFree == true) {
          questionMark = questionMarks[0];
          document.getElementById(beamCursor).innerHTML = questionMark;
        }
        beamCursorBlocked = false;
        break;
      case mode.Set:
        setAtomCursorBlocked = false;
        break;
      default:
        console.log("KEY_ENTER up: Modus nicht definiert.");
    }
  }

  if (KEY_CONTROL) {
    switchMode();
  }

  if (!KEY_CONTROL) {
    setCursorBlocked = false;
  }

  if (KEY_E) {
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

/*************************************/
/* Setzt alle Tasten auf losgelassen */
/*************************************/
function deleteKeyboardBuffer() {
  KEY_SHIFT = false;
  KEY_CONTROL = false;
  KEY_UP = false;
  KEY_DOWN = false;
  KEY_RIGHT = false;
  KEY_LEFT = false;
  KEY_ENTER = false;
  KEY_E = false;
}

/**********************************/
/* Umschalten der verschiedenen   */
/* Modi                           */
/**********************************/
function switchMode() {
  if (setCursorBlocked) return;
  switch (currentMode) {
    case mode.Beam:
      currentMode = mode.Set;
      setCursorBlocked = true;
      document.getElementById(getSetID()).innerHTML = atomQuestionMark;
      questionMark = questionMarks[1];
      if (!hold) {
        document.getElementById(beamCursor).innerHTML = questionMark;
      } else {
        document.getElementById("hold").innerHTML = questionMark;
      }
      break;
    case mode.Set:
      currentMode = mode.Beam;
      setCursorBlocked = true;
      if (atomSetArray[setCursorX][setCursorY] == 0) {
        document.getElementById(getSetID()).innerHTML = "";
      } else {
        document.getElementById(getSetID()).innerHTML = atomImage;
      }
      questionMark = questionMarks[0];
      if (!hold) {
        document.getElementById(beamCursor).innerHTML = questionMark;
      } else {
        document.getElementById("hold").innerHTML = questionMark;
      }
      break;
    default:
      console.log("switchMode(): currentMode nicht definiert.");
  }
}

/************************************/
/* Gibt einen eindeutigen Orb       */
/* aus dem Orb-Array zurück         */
/************************************/
function getOrb() {
  let x = 0;
  let sucess = false;
  let orb;

  if (randomOrbs) {
    // zufälligen noch nicht genutzen Orb auswählen
    do {
      x = rand(0, 15);
      if (orbsUsed[x] == false) {
        orbsUsed[x] = true;
        sucess = true;
      }
    } while (sucess == false);
    orb = orbs[x];
  } else {
    // den nächsten nicht genutzten Orb in aufsteigender Reihenfolge auswählen
    orb = orbs[currOrb];
    currOrb++;
  }
  return orb;
}

/*************************************/
/* Gibt eine Zufallszahl aus der     */
/* Zahlenmenge min bis max zurück    */
/*************************************/
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/************************************/
/* Setzt den Abfrage-Cursor auf das */
/* nächste freie Feld               */
/* gegen den Uhrzeigersinn          */
/************************************/
function moveBeamCursorRight() {
  if (rimFree == false) return;
  lastBeamCursor = beamCursor;
  let free = false;
  do {
    ++beamCursor;
    if (beamCursor == 33) {
      beamCursor = 1;
    }
    if (erg[beamCursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastBeamCursor).innerHTML = "";
  document.getElementById(beamCursor).innerHTML = questionMark;
}

/************************************/
/* Setzt den Abfrage-Cursor auf das */
/* nächste freie Feld               */
/* im Uhrzeigersinn                 */
/************************************/
function moveBeamCursorLeft() {
  if (rimFree == false) return;
  lastBeamCursor = beamCursor;
  let free = false;
  do {
    --beamCursor;
    if (beamCursor == 0) {
      beamCursor = 32;
    }
    if (erg[beamCursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastBeamCursor).innerHTML = "";
  document.getElementById(beamCursor).innerHTML = questionMark;
}

/*******************************/
/* Bewegt den Abfrage-Cursor   */
/* auf das nächste freie Feld  */
/* nach rechts.                */
/* Falls kein Feld frei ist    */
/* wird die Funktion sofort    */
/* verlassen                   */
/*******************************/

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
  if (count == 2 && rimUsed == 30) return;
  if (count == 1 && rimUsed == 31) return;

  moveBeamCursorRight();
}

/*******************************/
/* Ermittelt aus der aktuellen */
/* Set-Cursor Position die     */
/* zugehörige Feld-ID des      */
/* Experimentierfeldes und     */
/* gibt diese zurück           */
/*******************************/
function getSetID() {
  let setID = "f" + setCursorX + setCursorY;
  return setID;
}

/********************************/
/* Ermittelt aus der vorherigen */
/* Set-Cursor Position die      */
/* zugehörige Feld-ID des       */
/* Experimentierfeldes und      */
/* gibt diese zurück            */
/********************************/
function getLastSetID() {
  let setLastID = "f" + setCursorLastX + setCursorLastY;
  return setLastID;
}

/****************************/
/* Ermittelt die Feld-ID    */
/* aus den x, y Koordinaten */
/* und gibt diese zurück    */
/****************************/
function getID(x, y) {
  let setID = "f" + x + y;
  return setID;
}

/************************************/
/* Ermittelt aus den Koordinaten    */
/* x und y sowie der Strahlrichtung */
/* die Rim-ID und gibt diese zurück */
/************************************/
function getRimID(x, y, direction) {
  let cutDirec = direction.substring(3, 4);
  let key = x + "." + y + "." + cutDirec;
  let rimID = coordinates2Beam.get(key);
  return rimID;
}

/********************************/
/* Setzt den Set-Cursor eine    */
/* Position nach rechts         */
/********************************/
function moveSetCursorRight() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorX < 7) {
    setCursorX++;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;
  }
}

/********************************/
/* Setzt den Set-Cursor eine    */
/* Position nach links          */
/********************************/
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
  }
}

/********************************/
/* Setzt den Set-Cursor eine    */
/* Position nach oben           */
/********************************/
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
  }
}

/********************************/
/* Setzt den Set-Cursor eine    */
/* Position nach unten          */
/********************************/
function moveSetCursorDown() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorY < 7) {
    setCursorY++;
    fid = getLastSetID();
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      document.getElementById(fid).innerHTML = "";
    } else {
      document.getElementById(fid).innerHTML = setAtomMark;
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = atomQuestionMark;
  }
}

/********************************/
/* Setzt und löscht im Wechsel  */
/* ein Atom an der Position des */
/* Set-Cursors                  */
/********************************/
function toggleSetAtom() {
  if (setAtomCursorBlocked == true) return;

  let fid = getSetID();

  if (atomSetArray[setCursorX][setCursorY] == 0) {
    setAtomProbeField();
    document.getElementById(fid).innerHTML = setAtomMark;
  } else {
    deleteAtomProbeField();
    document.getElementById(fid).innerHTML = "";
  }
}

/********************************/
/* Setzt ein Atom an der        */
/* Position des Set-Cursors     */
/********************************/
function setAtomProbeField() {
  if (setAtomsCnt < atomsCnt) {
    atomSetArray[setCursorX][setCursorY] = 1;
    ++setAtomsCnt;
    document.getElementById("setcnt").innerHTML = placedAtoms[setAtomsCnt];
  } else {
    window.alert(textAlert3 + atomsCnt + textAlert4);
  }
}

/********************************/
/* Löscht ein Atom an der       */
/* Position des Set-Cursors     */
/********************************/
function deleteAtomProbeField() {
  atomSetArray[setCursorX][setCursorY] = 0;
  --setAtomsCnt;
  document.getElementById("setcnt").innerHTML = placedAtoms[setAtomsCnt];
}

/************************************/
/* Verteilt atomsCnt Atome auf dem  */
/* Experimentierfeld auf zufälligen */
/* Positionen                       */
/************************************/
function setAtoms() {
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
      atomArray[x][y] = 0;
      document.getElementById("f" + x + y).innerHTML = "";
    }
  }

  for (let i = 1; i <= atomsCnt; i++) {
    let sucess = false;
    do {
      let x = rand(1, 8) - 1;
      let y = rand(1, 8) - 1;
      if (atomArray[x][y] == 0) {
        sucess = true;
        atomArray[x][y] = 1;
      }
    } while (sucess == false);
  }
  // showAtoms();
}

/*******************************/
/* Zeigt die Atome auf dem     */
/* Experimentierfeld an        */
/*******************************/
function showAtoms() {
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
      if (atomArray[x][y] == 1) {
        document.getElementById("f" + x + y).innerHTML = atomImage;
      }
    }
  }
}

/*******************************/
/* Berechnet das Ergebnis      */
/* einer Eingabe und zeigt     */
/* es auf dem Spielbrett an    */
/*******************************/
function calculateBeam() {
  if (rimFree == false) return;
  if (beamCursorBlocked) return;

  let points;

  // beam2Coordinates
  // Array mit der Zuordnung der Position des Abfrage-Cursors (Rim-ID) zu den Feldkoordinaten und der Strahlrichtung
  // [0] = X-Koordinate, [1] = Y-Koordinate, [2] = Strahlrichtung (West-Ost: incX, Süd-Nord: decY, Ost-West: decX, Nord-Süd: incY)
  // beam2Coordinates[0] ist null, damit die Rim-ID direkt als Index für das Array verwendet werden kann
  let beam = beam2Coordinates[beamCursor].split(".");

  let beamContainer = {
    mode: beam[2],
    ex: 0,
    ey: 0,
    x: parseInt(beam[0]),
    y: parseInt(beam[1]),
    beamEntry: beamCursor,
    beamExit: null,
    points: 0,
    beamEnd: false,
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

/**********************************/
/* Bewegt den Untersuchungsstrahl */
/* über das Experementierfeld     */
/**********************************/
function moveBeam(beamContainer) {
  // Hauptstrahl
  let fieldMB = {
    x: undefined,
    y: undefined,
    valid: true,
  };

  // Nebenstrahl links
  let fieldLB = {
    x: undefined,
    y: undefined,
    valid: false,
  };

  // Nebenstrahl rechts
  let fieldRB = {
    x: undefined,
    y: undefined,
    valid: false,
  };

  if (beamContainer.mode == "incX") {
    console.log("moveBeam() incX läuft.");
    if (beamContainer.x < 7) {
      beamContainer.x++;
      if (beamContainer.y > 0) {
        fieldLB.x = beamContainer.x;
        fieldLB.y = beamContainer.y - 1;
        fieldLB.valid = true;
      }
      if (beamContainer.y < 7) {
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
      if (beamContainer.x < 7) {
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
      if (beamContainer.y < 7) {
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
    if (beamContainer.y < 7) {
      beamContainer.y++;
      if (beamContainer.x > 0) {
        fieldRB.x = beamContainer.x - 1;
        fieldRB.y = beamContainer.y;
        fieldRB.valid = true;
      }
      if (beamContainer.x < 7) {
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

/*************************************/
/* Überprüft den Untersuchungsstrahl */
/* auf Richtungsänderung, Absorption */
/* und Reflektion                    */
/*************************************/
function checkFields(fieldMB, fieldLB, fieldRB, beamContainer) {
  // Überprüfen auf Richtungsänderung, dabei zunächst Reflexion durch zwei Atome checken
  if (fieldLB.valid && fieldRB.valid) {
    if (
      atomArray[fieldMB.x][fieldMB.y] == 0 &&
      atomArray[fieldLB.x][fieldLB.y] == 1 &&
      atomArray[fieldRB.x][fieldRB.y] == 1
    ) {
      console.log("Reflektion LB + RB!");
      beamContainer.beamEnd = true;
      beamContainer.points = 1;
      erg[beamContainer.beamEntry] = true;
      setCursorAfterBeam(beamContainer.points);
      document.getElementById(beamContainer.beamEntry).innerHTML = orbR;
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
      // wenn nach einer Richtungsänderung das aktuelle Feld mit dem Eintrittsfeld identisch ist haben wir eine Reflektion
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
      // wenn nach einer Richtungsänderung das aktuelle Feld mit dem Eintrittsfeld identisch ist haben wir eine Reflektion
      if (
        beamContainer.x == beamContainer.ex &&
        beamContainer.y == beamContainer.ey
      ) {
        beamContainer.beamEnd = true;
        beamContainer.points = 1;
        erg[beamContainer.beamEntry] = true;
        setCursorAfterBeam(beamContainer.points);
        document.getElementById(beamContainer.beamEntry).innerHTML = orbR;
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
    return beamContainer;
  }

  return beamContainer;
}

/*****************************************/
/* Wenn ein Strahl das Experimentierfeld */
/* durchquert hat, wird hier der Anfang  */
/* und das Ende des Strahls mit zwei     */
/* gleichfarbigen Kugeln markiert        */
/*****************************************/
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
}

/*************************************/
/* Vergleicht die vom Spieler        */
/* gesetzten Atome mit dem vom       */
/* Computer versteckten, setzt dazu  */
/* die entsprechenden Grafiken auf   */
/* dem Eperimentierfeld und          */
/* ermittelt den Punktestand         */
/*************************************/
function calculateResult() {
  // Spieler informieren, dass vor der Auswertung erst alle Atome gesetzt sein müssen
  if (setAtomsCnt < atomsCnt) {
    window.alert(textAlert1 + atomsCnt + textAlert2);
    KEY_E = false;
    return;
  }

  hits = 0;
  missed = 0; // TODO wird eigentlich nicht gebraucht
  wrong = 0;

  // Auswertung der Treffer und setzen der grafischen Darstellung
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
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

  // Flag setzen dass das Spielende erreicht ist, aber noch einmal angezeigt werden soll
  gameEndShow = true;
}
