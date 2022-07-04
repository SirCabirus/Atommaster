/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 0.42                           */
/* 04.06.2022                             */
/*                                        */
/* Frank Wolter                           */
/*                                        */
/******************************************/

/**************************************/
/* Globale Variablen und Konstanten   */
/**************************************/

// Array für die Atome
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

const mode = {
  Beam: Symbol("beam"),
  Set: Symbol("set"),
};

let currentMode;

// wird nur während der Entwicklung gebraucht
let mockup = true;

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

// Position des Abfrage-Cursors
let beamCursor = 1;
let lastBeamCursor = beamCursor;

// Position des Set-Cursors
let setCursorX = 0;
let setCursorY = 0;
let setCursorLastX = 0;
let setCursorLastY = 0;

// Anzahl der zu ermittelnden Atome
let atomsCnt = 4;

// Anzahl der gesetzten Atome
let setAtomsCnt = 0;

// Speicher für die belegten Abfragefelder
let erg = [33];
for (let i = 0; i < 33; i++) {
  erg[i] = false;
}

// Zähler der genutzten Randflächen
rimUsed = 0;

// Flag ob es noch freie Randfläche gibt
rimFree = true;

// Anzahl der Versuche
trials = 0;

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

// Parameter für im Intervall aufgerufene Funktionen
let gameLoopHandle;
let gameLoopIntervall = 100;

// Grafiken
let questionMarks = [
  '<img src="img/questionMarkBlue.png">',
  '<img src="img/questionMarkOrange.png">',
];
let questionMark = questionMarks[0];
let questionMarkCurrent = 0;

let setAtomMark = '<img src="img/atom2-s.png">';
let atomQuestionMark = '<img src="img/atomQuestionMark.png">';
let atomRight = '<img src="img/atomRight.png">';
let atomWrong = '<img src="img/atomWrong.png">';
let atomMissed = '<img src="img/atom2-s.png">';

let atomImage = '<img src="img/atom2-s.png">';
let orbA = '<img src="img/orbA.png">';
let orbR = '<img src="img/orbR.png">';

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

// fünf Leerzeichen
const space = "\xa0\xa0\xa0\xa0\xa0";

// Variablen für die Tastatureingaben
let KEY_RIGHT = false; // die 'Pfeil nach rechts' Cursor-Taste
let KEY_LEFT = false; // die 'Pfeil nach links' Cursor-Taste
let KEY_UP = false; // die 'Pfeil nach oben' Cursor-Taste
let KEY_DOWN = false; // die 'Pfeil nach unten' Cursor-Taste
let KEY_ENTER = false; // die Eingabe-Taste
let KEY_CONTROL = false; // die STRG-Taste
let KEY_E = false; // die E-Taste

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
  currentMode = mode.Beam;

  // Abfrage-Cursor anzeigen
  // der Cursor wird durch die Funktionen moveCursorRight und moveCursorLeft versetzt
  document.getElementById(beamCursor).innerHTML = questionMark;

  if (mockup) {
    // Atome speichern

    atomArray[1][0] = 1;
    atomArray[2][2] = 1;
    atomArray[0][4] = 1;
    atomArray[7][4] = 1;

    // setAtoms();

    // Atome anzeigen
    // showAtoms();
  }

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

  // gamestatus = "Versuche: " + trials + space + "Punkte: " + score;
  gamestatus =
    "Versuche: " +
    trials +
    space +
    "Punkte: " +
    score +
    space +
    "Treffer: " +
    hits +
    space +
    "Verpasst: " +
    missed + 
    space +
    "Falsch: " +
    wrong;
  document.getElementById("status").innerHTML = gamestatus;

  if (gameEndShow) gameEnd = true;
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
      document.getElementById(getSetID()).innerHTML = setAtomMark;
      questionMark = questionMarks[1];
      document.getElementById(beamCursor).innerHTML = questionMark;
      break;
    case mode.Set:
      currentMode = mode.Beam;
      setCursorBlocked = true;
      if (atomSetArray[setCursorX][setCursorY] == 0) {
        document.getElementById(getSetID()).innerHTML = "";
      }
      questionMark = questionMarks[0];
      document.getElementById(beamCursor).innerHTML = questionMark;
      break;
    default:
      console.log("switchMode(): currentMode nicht definiert.");
  }
}

/************************************/
/* Gibt einen eindeutigen Orb       */
/* aus dem Orbs-Array zurück        */
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
function setCursorAfterBeam(count) {
  if (count == 2 && rimUsed == 30) return;
  if (count == 1 && rimUsed == 31) return;

  moveBeamCursorRight();
}

function getSetID() {
  let setID = "f" + setCursorX + setCursorY;
  return setID;
}

function getLastSetID() {
  let setLastID = "f" + setCursorLastX + setCursorLastY;
  return setLastID;
}

function getID(x, y) {
  let setID = "f" + x + y;
  return setID;
}

function moveSetCursorRight() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorX < 7) {
    setCursorX++;
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      fid = getLastSetID();
      document.getElementById(fid).innerHTML = "";
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = setAtomMark;
  }
}

function moveSetCursorLeft() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorX > 0) {
    setCursorX--;
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      fid = getLastSetID();
      document.getElementById(fid).innerHTML = "";
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = setAtomMark;
  }
}

function moveSetCursorUp() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorY > 0) {
    setCursorY--;
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      fid = getLastSetID();
      document.getElementById(fid).innerHTML = "";
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = setAtomMark;
  }
}

function moveSetCursorDown() {
  setCursorLastX = setCursorX;
  setCursorLastY = setCursorY;
  let fid;
  if (setCursorY < 7) {
    setCursorY++;
    if (atomSetArray[setCursorLastX][setCursorLastY] == 0) {
      fid = getLastSetID();
      document.getElementById(fid).innerHTML = "";
    }
    fid = getSetID();
    document.getElementById(fid).innerHTML = setAtomMark;
  }
}

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

function setAtomProbeField() {
  if (setAtomsCnt < atomsCnt) {
    atomSetArray[setCursorX][setCursorY] = 1;
    ++setAtomsCnt;
  }
}

function deleteAtomProbeField() {
  atomSetArray[setCursorX][setCursorY] = 0;
  --setAtomsCnt;
}

/***********************************/
/* Verteilt atomsCnt Atome auf dem */
/* Spielfeld auf zufälligen        */
/* Positionen                      */
/***********************************/
function setAtoms() {
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
}

/*******************************/
/* Zeigt die Atome auf dem     */
/* Spielfeld an                */
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

  if (mockup) {
    if (beamCursor == 32) {
      erg[32] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(32).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 31) {
      erg[31] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(31).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 30) {
      erg[30] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(30).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 29 || beamCursor == 23) {
      let beam = getOrb();
      erg[29] = true;
      erg[23] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(29).innerHTML = beam;
      document.getElementById(23).innerHTML = beam;
      trials++;
    } else if (beamCursor == 28 || beamCursor == 13) {
      let beam = getOrb();
      erg[13] = true;
      erg[28] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(13).innerHTML = beam;
      document.getElementById(28).innerHTML = beam;
      trials++;
    } else if (beamCursor == 27 || beamCursor == 14) {
      let beam = getOrb();
      erg[14] = true;
      erg[27] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(14).innerHTML = beam;
      document.getElementById(27).innerHTML = beam;
      trials++;
    } else if (beamCursor == 12 || beamCursor == 26) {
      let beam = getOrb();
      erg[12] = true;
      erg[26] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(12).innerHTML = beam;
      document.getElementById(26).innerHTML = beam;
      trials++;
    } else if (beamCursor == 25) {
      erg[25] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(25).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 24) {
      erg[24] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(24).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 22) {
      erg[22] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(22).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 21) {
      erg[21] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(21).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 20) {
      erg[20] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(20).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 19) {
      erg[19] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(19).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 7 || beamCursor == 18) {
      let beam = getOrb();
      erg[7] = true;
      erg[18] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(7).innerHTML = beam;
      document.getElementById(18).innerHTML = beam;
      trials++;
    } else if (beamCursor == 8 || beamCursor == 17) {
      let beam = getOrb();
      erg[8] = true;
      erg[17] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(8).innerHTML = beam;
      document.getElementById(17).innerHTML = beam;
      trials++;
    } else if (beamCursor == 16) {
      erg[16] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(16).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 10 || beamCursor == 15) {
      let beam = getOrb();
      erg[10] = true;
      erg[15] = true;
      points = 2;
      setCursorAfterBeam(points);
      document.getElementById(10).innerHTML = beam;
      document.getElementById(15).innerHTML = beam;
      trials++;
    } else if (beamCursor == 11) {
      erg[11] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(11).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 9) {
      erg[9] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(9).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 6) {
      erg[6] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(6).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 5) {
      erg[5] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(5).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 4) {
      erg[4] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(4).innerHTML = orbR;
      trials++;
    } else if (beamCursor == 3) {
      erg[3] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(3).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 2) {
      erg[2] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(2).innerHTML = orbA;
      trials++;
    } else if (beamCursor == 1) {
      erg[1] = true;
      points = 1;
      setCursorAfterBeam(points);
      document.getElementById(1).innerHTML = orbA;
      trials++;
    }

    // Punktestand abgleichen
    score = score + points;

    // Anzahl genutzter Randfelder erhöhen
    rimUsed = rimUsed + points; // TODO rimUsed hat immer den gleichen Wert wie score

    // Abfrage-Cursor parken wenn kein Platz mehr frei ist und Status merken
    if (rimUsed >= 32) {
      rimFree = false;
      document.getElementById("hold").innerHTML = questionMark;
    }
  }

  // Wenn noch Platz frei ist Cursor bis zum Loslassen der Return-Taste blockieren
  // um unbeabsichtigtes mehrfaches Abfeuern zu verhindern
  if (rimFree) {
    beamCursorBlocked = true;
    questionMark = questionMarks[1];
    document.getElementById(beamCursor).innerHTML = questionMark;
  }
}

function calculateResult() {
  if (setAtomsCnt < atomsCnt) {
    window.alert("Es sind noch keine " + atomsCnt + " Atome gesetzt!");
    KEY_E = false;
    return;
  }
  
  hits = 0;
  missed = 0;
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
  questionMark = questionMarks[0];
  document.getElementById(beamCursor).innerHTML = questionMark;
  
  score = score + missed * 5;
  gameEndShow = true;
}
