/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 0.24                           */
/* 26.06.2022                             */
/*                                        */
/* Frank Wolter                           */
/*                                        */
/******************************************/

/**************************************/
/* Globale Variablen und Konstanten   */
/**************************************/

// wird nur während der Entwicklung gebraucht
let mockup = true;

// sollen die Orbs in zufälliger Reihenfolge ausgegeben werden
let randomOrbs = true;

// ist der Cursor blockiert
let cursorBlocked = false;

// Dauer einer Cursor-Blockade in ms
const cursorBlockedDuration = 2000;

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

// Anzahl der Versuche
trials = 0;

// Anzahl der maximalen Versuche
maxTrials = 10;

// Anzahl der Punkte
let score = 0;

// Flag ob Spiel verloren ist
let gameLost = false;

// Statuszeile
let gamestatus;

// Parameter für im Intervall aufgerufene Funktionen
let updateHandle;
let updateIntervall = 100;

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

/**********************************/
/*      Tastatur abfragen         */
/**********************************/
/*        Event-Handler           */
/* wenn Taste gedrückt wurde      */
/**********************************/
document.onkeydown = function (e) {
  // console.log(">" + e.key + "<");
  if (cursorBlocked) {
    return;
  }

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
      console.log("x: " + x + "  orbsUsed[x]: " + orbsUsed[x]);
      if (orbsUsed[x] == false) {
        orbsUsed[x] = true;
        sucess = true;
      }
    } while (sucess == false);
    console.log("Nach do-while -> x: " + x + "  orbsUsed[x]: " + orbsUsed[x]);
    orb = orbs[x];
  } else {
    // den nächsten nicht genutzten Orb in aufsteigender Reihenfolge auswählen
    orb = orbs[currOrb];
    currOrb++;
  }
  return orb;
}

/*************************************/
/* Gibt einen Zufallszahl aus der    */
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
  document.getElementById(cursor).innerHTML = questionMark;

  if (mockup) {
    // Mockup Atome anzeigen
    document.getElementById(312).innerHTML = atomImage;
    document.getElementById(517).innerHTML = atomImage;
    document.getElementById(510).innerHTML = atomImage;
    document.getElementById(111).innerHTML = atomImage;
  }

  // Aufruf von Funktionen, die im zeitlichen Intervall immer wieder aufgerufen werden
  updateHandle = setInterval(update, updateIntervall);
}

function update() {
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
    cursorBlocked = true;
  }

  if (gameLost == false) {
    gamestatus =
      "Versuche: " +
      trials +
      space +
      "Frei: " +
      (maxTrials - trials) +
      space +
      "Punkte: " +
      score;
  } else {
    gamestatus = "Das Molekül ist zerfallen. Du hast verloren!";
  }
  document.getElementById("status").innerHTML = gamestatus;
}

function moveCursorRight() {
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
  console.log("Cursor r: " + cursor);

  document.getElementById(lastCursor).innerHTML = "";
  document.getElementById(cursor).innerHTML = questionMark;
}

function moveCursorLeft() {
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
  console.log("Cursor l: " + cursor);

  document.getElementById(lastCursor).innerHTML = "";
  document.getElementById(cursor).innerHTML = questionMark;
}

function calculateBeam() {
  if (trials - maxTrials == 0) {
    gameLost = true;
    return;
  }

  if (cursorBlocked) return;
  
  if (mockup) {
    if (cursor == 1) {
      erg[1] = true;
      moveCursorRight();
      document.getElementById(1).innerHTML = orbR;
      trials++;
    } else if (cursor == 2) {
      erg[2] = true;
      moveCursorRight();
      document.getElementById(2).innerHTML = orbA;
      trials++;
    } else if (cursor == 3) {
      erg[3] = true;
      moveCursorRight();
      document.getElementById(3).innerHTML = orbR;
      trials++;
    } else if (cursor == 4 || cursor == 10) {
      let beam = getOrb();
      erg[4] = true;
      erg[10] = true;
      moveCursorRight();
      document.getElementById(4).innerHTML = beam;
      document.getElementById(10).innerHTML = beam;
      trials++;
    } else if (cursor == 5 || cursor == 20) {
      let beam = getOrb();
      erg[5] = true;
      erg[20] = true;
      moveCursorRight();
      document.getElementById(5).innerHTML = beam;
      document.getElementById(20).innerHTML = beam;
      trials++;
    } else if (cursor == 6 || cursor == 19) {
      let beam = getOrb();
      erg[6] = true;
      erg[19] = true;
      moveCursorRight();
      document.getElementById(6).innerHTML = beam;
      document.getElementById(19).innerHTML = beam;
      trials++;
    } else if (cursor == 7 || cursor == 21) {
      let beam = getOrb();
      erg[7] = true;
      erg[21] = true;
      moveCursorRight();
      document.getElementById(7).innerHTML = beam;
      document.getElementById(21).innerHTML = beam;
      trials++;
    } else if (cursor == 8) {
      erg[8] = true;
      moveCursorRight();
      document.getElementById(8).innerHTML = orbA;
      trials++;
    } else if (cursor == 9) {
      erg[9] = true;
      moveCursorRight();
      document.getElementById(9).innerHTML = orbA;
      trials++;
    } else if (cursor == 11) {
      erg[11] = true;
      moveCursorRight();
      document.getElementById(11).innerHTML = orbA;
      trials++;
    } else if (cursor == 12) {
      erg[12] = true;
      moveCursorRight();
      document.getElementById(12).innerHTML = orbR;
      trials++;
    } else if (cursor == 13) {
      erg[13] = true;
      moveCursorRight();
      document.getElementById(13).innerHTML = orbA;
      trials++;
    } else if (cursor == 14) {
      erg[14] = true;
      moveCursorRight();
      document.getElementById(14).innerHTML = orbR;
      trials++;
    } else if (cursor == 15 || cursor == 26) {
      let beam = getOrb();
      erg[15] = true;
      erg[26] = true;
      moveCursorRight();
      document.getElementById(15).innerHTML = beam;
      document.getElementById(26).innerHTML = beam;
      trials++;
    } else if (cursor == 16 || cursor == 25) {
      let beam = getOrb();
      erg[16] = true;
      erg[25] = true;
      moveCursorRight();
      document.getElementById(16).innerHTML = beam;
      document.getElementById(25).innerHTML = beam;
      trials++;
    } else if (cursor == 17) {
      erg[17] = true;
      moveCursorRight();
      document.getElementById(17).innerHTML = orbA;
      trials++;
    } else if (cursor == 18 || cursor == 23) {
      let beam = getOrb();
      erg[18] = true;
      erg[23] = true;
      moveCursorRight();
      document.getElementById(18).innerHTML = beam;
      document.getElementById(23).innerHTML = beam;
      trials++;
    } else if (cursor == 22) {
      erg[22] = true;
      moveCursorRight();
      document.getElementById(22).innerHTML = orbA;
      trials++;
    } else if (cursor == 24) {
      erg[24] = true;
      moveCursorRight();
      document.getElementById(24).innerHTML = orbA;
      trials++;
    } else if (cursor == 27) {
      erg[27] = true;
      moveCursorRight();
      document.getElementById(27).innerHTML = orbR;
      trials++;
    } else if (cursor == 28) {
      erg[28] = true;
      moveCursorRight();
      document.getElementById(28).innerHTML = orbA;
      trials++;
    } else if (cursor == 29) {
      erg[29] = true;
      moveCursorRight();
      document.getElementById(29).innerHTML = orbR;
      trials++;
    } else if (cursor == 30) {
      erg[30] = true;
      moveCursorRight();
      document.getElementById(30).innerHTML = orbA;
      trials++;
    } else if (cursor == 31) {
      erg[31] = true;
      moveCursorRight();
      document.getElementById(31).innerHTML = orbA;
      trials++;
    } else if (cursor == 32) {
      erg[32] = true;
      moveCursorRight();
      document.getElementById(32).innerHTML = orbA;
      trials++;
    }
  }
  
  // Cursor kurz blockieren um unbeabsichtigtes mehrfaches Abfeuern zu verhindern
  cursorBlocked = true;
  questionMark = questionMarks[1];
  document.getElementById(cursor).innerHTML = questionMark;
  setTimeout(function () {
    questionMark = questionMarks[0];
    document.getElementById(cursor).innerHTML = questionMark;
    cursorBlocked = false;
  }, cursorBlockedDuration);
}
