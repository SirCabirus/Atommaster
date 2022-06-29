/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 0.26                           */
/* 29.06.2022                             */
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

// wird nur während der Entwicklung gebraucht
let mockup = true;

// sollen die Orbs in zufälliger Reihenfolge ausgegeben werden
let randomOrbs = true;

// ist der Cursor blockiert
let cursorBlocked = false;

// Speicher der genutzten Orbs
let orbsUsed = [];
for (let i = 0; i < 16; i++) {
  orbsUsed[i] = false;
}

// Zeiger auf aktuellen Orb falls keine Zufallsreihenfolge
let currOrb = 0;

// Position des Abfrage-Cursors
let cursor = 1;
let lastCursor = cursor;

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

// Flag ob Spiel verloren ist
let gameLost = false;

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

// let atomImage = '<img src="img/atom-l.png">';
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
let KEY_ENTER = false; // die Eingabe-Taste
let KEY_CONTROL = false; // die STRG-Taste

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

  // Eingabe wurde gedrückt
  if (e.key == "Enter") {
    KEY_ENTER = true;
  }

  // STRG wurde gedrückt
  if (e.key == "Control") {
    KEY_CONTROL = true;
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

  // Eingabe wurde losgelassen
  if (e.key == "Enter") {
    KEY_ENTER = false;

    if (rimFree == true) {
      questionMark = questionMarks[0];
      document.getElementById(cursor).innerHTML = questionMark;
    }
    cursorBlocked = false;
  }

  // STRG wurde losgelassen
  if (e.key == "Control") {
    KEY_CONTROL = false;
  }
};

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

/**************************************/
/*       Spiel starten                */
/*                                    */
/*    Diese Funktion wird über den    */
/*    body der Seite index.html       */
/*    aufgerufen                      */
/**************************************/
function startGame() {
  // Abfrage-Cursor anzeigen
  // der Cursor wird durch die Funktionen moveCursorRight und moveCursorLeft versetzt
  document.getElementById(cursor).innerHTML = questionMark;

  if (mockup) {
    // Atome speichern

    atomArray[0][1] = 1;
    atomArray[2][2] = 1;
    atomArray[4][0] = 1;
    atomArray[4][7] = 1;

    // setAtoms();

    // Atome anzeigen
    showAtoms();
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
  // Cursor nach rechts bewegen
  if (KEY_RIGHT) {
    moveCursorRight();
  }

  // Cursor nach links bewegen
  if (KEY_LEFT) {
    moveCursorLeft();
  }

  // Eingabe auswerten
  if (KEY_ENTER) {
    calculateBeam();
  }

  gamestatus =
    "Versuche: " +
    trials +
    space +
    "Punkte: " +
    score;
  document.getElementById("status").innerHTML = gamestatus;
}

/*******************************/
/* Setzt den Cursor auf das    */
/* nächste freie Feld          */
/* gegen den Uhrzeigersinn     */
/*******************************/
function moveCursorRight() {
  if (rimFree == false) return;
  lastCursor = cursor;
  let free = false;
  do {
    ++cursor;
    if (cursor == 33) {
      cursor = 1;
    }
    if (erg[cursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastCursor).innerHTML = "";
  document.getElementById(cursor).innerHTML = questionMark;
}

/*******************************/
/* Setzt den Cursor auf das    */
/* nächste freie Feld          */
/* im Uhrzeigersinn            */
/*******************************/
function moveCursorLeft() {
  if (rimFree == false) return;
  lastCursor = cursor;
  let free = false;
  do {
    --cursor;
    if (cursor == 0) {
      cursor = 32;
    }
    if (erg[cursor] == false) {
      free = true;
    }
  } while (free == false);

  document.getElementById(lastCursor).innerHTML = "";
  document.getElementById(cursor).innerHTML = questionMark;
}

function setCursorAfterBeam() {
  if (rimUsed < 31) {
    moveCursorRight();
  }
}

/*******************************/
/* Verteilt vier Atome auf dem */
/* Spielfeld auf zufälligen    */
/* Positionen                  */
/*******************************/
function setAtoms() {
  for (let i = 1; i <= 4; i++) {
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

  let points;

  if (cursorBlocked) return;

  if (mockup) {
    if (cursor == 32) {
      erg[32] = true;
      setCursorAfterBeam();
      document.getElementById(32).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 31) {
      erg[31] = true;
      setCursorAfterBeam();
      document.getElementById(31).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 30) {
      erg[30] = true;
      setCursorAfterBeam();
      document.getElementById(30).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 29 || cursor == 23) {
      let beam = getOrb();
      erg[29] = true;
      erg[23] = true;
      setCursorAfterBeam();
      document.getElementById(29).innerHTML = beam;
      document.getElementById(23).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 28 || cursor == 13) {
      let beam = getOrb();
      erg[13] = true;
      erg[28] = true;
      setCursorAfterBeam();
      document.getElementById(13).innerHTML = beam;
      document.getElementById(28).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 27 || cursor == 14) {
      let beam = getOrb();
      erg[14] = true;
      erg[27] = true;
      setCursorAfterBeam();
      document.getElementById(14).innerHTML = beam;
      document.getElementById(27).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 12 || cursor == 26) {
      let beam = getOrb();
      erg[12] = true;
      erg[26] = true;
      setCursorAfterBeam();
      document.getElementById(12).innerHTML = beam;
      document.getElementById(26).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 25) {
      erg[25] = true;
      setCursorAfterBeam();
      document.getElementById(25).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 24) {
      erg[24] = true;
      setCursorAfterBeam();
      document.getElementById(24).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 22) {
      erg[22] = true;
      setCursorAfterBeam();
      document.getElementById(22).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 21) {
      erg[21] = true;
      setCursorAfterBeam();
      document.getElementById(21).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 20) {
      erg[20] = true;
      setCursorAfterBeam();
      document.getElementById(20).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 19) {
      erg[19] = true;
      setCursorAfterBeam();
      document.getElementById(19).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 7 || cursor == 18) {
      let beam = getOrb();
      erg[7] = true;
      erg[18] = true;
      setCursorAfterBeam();
      document.getElementById(7).innerHTML = beam;
      document.getElementById(18).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 8 || cursor == 17) {
      let beam = getOrb();
      erg[8] = true;
      erg[17] = true;
      setCursorAfterBeam();
      document.getElementById(8).innerHTML = beam;
      document.getElementById(17).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 16) {
      erg[16] = true;
      setCursorAfterBeam();
      document.getElementById(16).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 10 || cursor == 15) {
      let beam = getOrb();
      erg[10] = true;
      erg[15] = true;
      setCursorAfterBeam();
      document.getElementById(10).innerHTML = beam;
      document.getElementById(15).innerHTML = beam;
      trials++;
      points = 2;
    } else if (cursor == 11) {
      erg[11] = true;
      setCursorAfterBeam();
      document.getElementById(11).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 9) {
      erg[9] = true;
      setCursorAfterBeam();
      document.getElementById(9).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 6) {
      erg[6] = true;
      setCursorAfterBeam();
      document.getElementById(6).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 5) {
      erg[5] = true;
      setCursorAfterBeam();
      document.getElementById(5).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 4) {
      erg[4] = true;
      moveCursorRight();
      document.getElementById(4).innerHTML = orbR;
      trials++;
      points = 1;
    } else if (cursor == 3) {
      erg[3] = true;
      setCursorAfterBeam();
      document.getElementById(3).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 2) {
      erg[2] = true;
      setCursorAfterBeam();
      document.getElementById(2).innerHTML = orbA;
      trials++;
      points = 1;
    } else if (cursor == 1) {
      erg[1] = true;
      setCursorAfterBeam();
      document.getElementById(1).innerHTML = orbA;
      trials++;
      points = 1;
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

  // Wenn noch Platz frei istCursor bis zum Loslassen der Return-Taste blockieren 
  // um unbeabsichtigtes mehrfaches Abfeuern zu verhindern
  if (rimFree) {
    cursorBlocked = true;
    questionMark = questionMarks[1];
    document.getElementById(cursor).innerHTML = questionMark;
  }
}
