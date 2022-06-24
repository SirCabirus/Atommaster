/******************************************/
/*              Atommaster                */
/*                                        */
/* Umsetzung des Brettspiels ORDO         */
/* welches auch als Black Box bekannt ist */
/*                                        */
/* Version 0.2                            */
/* 23.06.2022                             */
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

// soll der Cursor blinken
let flashTheCursor = false;

// Speicher der genutzten Orbs
let orbsUsed = [];
for (let i = 0; i < 16; i++) {
  orbsUsed[i] = false;
}

// Zeiger auf aktuellen Orb falls keine Zufallsreihenfolge
let currOrb = 0;

// Position des Abfrage-Cursors
let cursor = 2;
let lastCursor = cursor;

// Speicher für die belegten Abfragefelder
let erg = [33];
for (let i = 0; i < 33; i++) {
  erg[i] = false;
}

// Parameter für im Intervall aufgerufene Funktionen
let updateHandle;
let updateIntervall = 100;

let flashCursorHandle;
let flashCursorIntervall = 1000;

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

// Variablen für die Tastatureingaben
let KEY_RIGHT = false; // die 'Pfeil nach rechts' Cursor-Taste
let KEY_LEFT = false; // die 'Pfeil nach links' Cursor-Taste

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

    // Mockup Auswertung anzeigen
    erg[1] = true;
    erg[4] = true;
    erg[7] = true;
    erg[10] = true;
    erg[11] = true;
    erg[12] = true;
    erg[18] = true;
    erg[21] = true;
    erg[23] = true;
    erg[32] = true;

    let beam1 = getOrb();
    let beam2 = getOrb();
    let beam3 = getOrb();

    document.getElementById(1).innerHTML = orbR;
    document.getElementById(4).innerHTML = beam1;
    document.getElementById(7).innerHTML = beam3;
    document.getElementById(10).innerHTML = beam1;
    document.getElementById(11).innerHTML = orbA;
    document.getElementById(12).innerHTML = orbR;
    document.getElementById(18).innerHTML = beam2;
    document.getElementById(21).innerHTML = beam3;
    document.getElementById(23).innerHTML = beam2;
    document.getElementById(32).innerHTML = orbA;
  }

  // Aufruf von Funktionen, die im zeitlichen Intervall immer wieder aufgerufen werden
  updateHandle = setInterval(update, updateIntervall);
  if (flashTheCursor) {
    flashCursorHandle = setInterval(flashCursor, flashCursorIntervall);
  }
}

function update() {
  // Cursor nach rechts bewegen
  if (KEY_RIGHT) {
    ++cursor;
    // console.log("Cursor r: " + cursor);
    // wenn Cursor auf belegtem Feld steht
    if (erg[cursor] == true) {
      // Cursor auf das nächste unbelegte Feld stellen
      while (erg[cursor] == true) {
        ++cursor;
        // console.log("Korrektur Cursor r: " + cursor);
      }
      // vorheriges Feld auf dem Cursor stand löschen
      document.getElementById(lastCursor).innerHTML = "";
    } // Ende Cursor auf belegtem Feld

    // wenn Cursor auf letztem Feld angekommen ist auf Anfang zurücksetzen
    if (cursor == 33) {
      document.getElementById(lastCursor).innerHTML = "";
      cursor = 1;

      // wenn Cursor auf belegtem Feld steht
      if (erg[cursor] == true) {
        // Cursor auf das nächste unbelegte Feld stellen
        while (erg[cursor] == true) {
          ++cursor;
          // console.log("Korrektur Cursor r: " + cursor);
        }
        // vorheriges Feld wo Cursor stand löschen und aktuellen Cursor anzeigen
        document.getElementById(lastCursor).innerHTML = "";
      } // Ende Cursor auf belegtem Feld
    } else {
      if (erg[cursor - 1] == false) {
        document.getElementById(cursor - 1).innerHTML = "";
      }
      document.getElementById(cursor).innerHTML = questionMark;
      lastCursor = cursor;
    }
    document.getElementById(cursor).innerHTML = questionMark;
  }

  // Cursor nach links bewegen
  if (KEY_LEFT) {
    --cursor;
    // console.log("Cursor r: " + cursor);
    // wenn Cursor auf belegtem Feld steht
    if (erg[cursor] == true) {
      // Cursor auf das nächste unbelegte Feld stellen
      while (erg[cursor] == true) {
        --cursor;
        // console.log("Korrektur Cursor l: " + cursor);
      }
      // vorheriges Feld auf dem Cursor stand löschen
      document.getElementById(lastCursor).innerHTML = "";
    } // Ende Cursor auf belegtem Feld

    if (cursor == 0) {
      document.getElementById(lastCursor).innerHTML = "";
      cursor = 32;

      // wenn Cursor auf belegtem Feld steht
      if (erg[cursor] == true) {
        // Cursor auf das nächste unbelegte Feld stellen
        while (erg[cursor] == true) {
          --cursor;
          // console.log("Korrektur Cursor l: " + cursor);
        }
        // vorheriges Feld wo Cursor stand löschen und aktuellen Cursor anzeigen
        document.getElementById(lastCursor).innerHTML = "";
      } // Ende Cursor auf belegtem Feld
    } else {
      if (erg[cursor + 1] == false) {
        document.getElementById(cursor + 1).innerHTML = "";
      }
      document.getElementById(cursor).innerHTML = questionMark;
      lastCursor = cursor;
    }
    document.getElementById(cursor).innerHTML = questionMark;
  }

}

function flashCursor() {
  if (questionMarkCurrent == 0) {
    questionMark = questionMarks[1];
    questionMarkCurrent = 1;
  } else {
    questionMark = questionMarks[0];
    questionMarkCurrent = 0;
  }
  document.getElementById(cursor).innerHTML = questionMark;
}
