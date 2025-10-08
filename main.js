const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const sqlite3 = require('sqlite3').verbose();
// const DDG = require('duck-duck-scrape');

var db = new sqlite3.Database('dump.db');
db.run("CREATE TABLE IF NOT EXISTS firmen (uid TEXT PRIMARY KEY, firma TEXT, rechtsform TEXT, zweck TEXT, sitz TEXT, adresse TEXT, ort TEXT, kanton TEXT, status TEXT, moegliches_impressum TEXT)");
db.close();

const searchparameter = "AB";
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

// Rate limiter function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function possibleImpressQuery(query) {
  try {
    const searchResults = (await DDG.search(query, {
      safeSearch: DDG.SafeSearchType.OFF,
      marketRegion: 'ch'
    })).results[0];

    /* var filteredResults = [ ];
    searchResults.forEach(async function(search) {
      urlContains = ["impress", "impressum"].some(element => (search.url).includes(element));
      titleContains = ["impress", "impressum"].some(element => (search.url).includes(element));
      if (urlContains || titleContains) {
        filteredResults.push(search);
      };
    }); */

    return Array.isArray(searchResults.url) ? searchResults.url[0] : searchResults.url;
  } catch {
    return [ ];
  }
};

async function fetchCompany(company) {
  return await (await fetch(`https://www.zefix.ch/ZefixREST/api/v1/firm/${company.ehraid}/withoutShabPub.json`, {
    "credentials": "include",
    "headers": {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
    },
    "method": "GET",
    "mode": "cors"
  })).json();
};

async function writeSQL(data) {
  const db = await new sqlite3.Database('dump.db');
  db.configure('busyTimeout', 5000);

  const insertQuery = 'INSERT OR IGNORE INTO firmen (uid, firma, rechtsform, zweck, sitz, adresse, ort, kanton, status, moegliches_impressum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  await db.run(insertQuery, [data["UID"], data["Firma"], data["Rechtsform"], data["Zweck"], data["Sitz"], data["Adresse"], data["Ort"], data["Kanton"], data["Status"], data["Moegliches_Impressum"]]);

  await db.close();
};

const kanton = {
  "Obwalden": "OW",
  "Zug": "ZG",
  "Glarus": "GL",
  "Uri": "UR",
  "Solothurn": "SO",
  "Nidwalden": "NW",
  "Zürich": "ZH",
  "Schwyz": "SZ",
  "Brig (Oberwallis)": "VS",
  "Basel-Landschaft": "BL",
  "Appenzell I. Rh.": "AI",
  "Basel-Stadt": "BS",
  "Aargau": "AG",
  "St-Maurice (Bas Valais)": "VS",
  "Sion (Valais Central)": "VS",
  "Jura": "JU",
  "Genève": "GE",
  "Luzern": "LU",
  "Neuchâtel": "NE",
  "Vaud": "VD",
  "Fribourg": "FR",
  "Bern": "BE",
  "Schaffhausen": "SH",
  "Appenzell A. Rh.": "AR",
  "Graubünden": "GR",
  "St. Gallen": "SG",
  "Thurgau": "TG",
  "Ticino": "TI",
  "Basel": "BS",
  "Lausanne": "VD",
  "Winterthur": "ZH",
  "St. Moritz": "GR",
  "Davos": "GR",
  "Lugano": "TI",
  "Bellinzona": "TI",
  "Locarno": "TI",
  "Chur": "GR",
  "Frauenfeld": "TG",
  "Aarau": "AG",
  "Herisau": "AR",
  "Appenzell": "AI",
  "Stans": "NW",
  "Sarnen": "OW",
  "Altdorf": "UR",
  "Schwyz": "SZ",
  "Glarus": "GL",
  "Delémont": "JU",
  "Sion": "VS",
  "Martigny": "VS",
  "Monthey": "VS",
  "Sierre": "VS",
  "Visp": "VS",
  "Brig": "VS",
  "Zermatt": "VS",
  "Verbier": "VS",
  "Crans-Montana": "VS",
  "Nyon": "VD",
  "Montreux": "VD",
  "Vevey": "VD",
  "Yverdon-les-Bains": "VD",
  "Morges": "VD",
  "Pully": "VD",
  "Renens": "VD",
  "Bulle": "FR",
  "Fribourg": "FR",
  "Thun": "BE",
  "Biel": "BE",
  "Köniz": "BE",
  "Burgdorf": "BE",
  "Langenthal": "BE",
  "Steffisburg": "BE",
  "Spiez": "BE",
  "Interlaken": "BE",
  "Moutier": "BE",
  "La Chaux-de-Fonds": "NE",
  "Le Locle": "NE",
  "Neuchâtel": "NE",
  "Genève": "GE",
  "Carouge": "GE",
  "Lancy": "GE",
  "Vernier": "GE",
  "Meyrin": "GE",
  "Onex": "GE",
  "Thônex": "GE",
  "Versoix": "GE",
  "Chêne-Bougeries": "GE",
  "Plan-les-Ouates": "GE",
  "Wädenswil": "ZH",
  "Uster": "ZH",
  "Dübendorf": "ZH",
  "Dietikon": "ZH",
  "Wetzikon": "ZH",
  "Kloten": "ZH",
  "Schlieren": "ZH",
  "Volketswil": "ZH",
  "Horgen": "ZH",
  "Adliswil": "ZH",
  "Thalwil": "ZH",
  "Küsnacht": "ZH",
  "Meilen": "ZH",
  "Richterswil": "ZH",
  "Pfäffikon": "ZH",
  "Illnau-Effretikon": "ZH",
  "Opfikon": "ZH",
  "Wallisellen": "ZH",
  "Rüti": "ZH",
  "Regensdorf": "ZH",
  "Affoltern am Albis": "ZH",
  "Bülach": "ZH",
  "Baden": "AG",
  "Wettingen": "AG",
  "Wohlen": "AG",
  "Rheinfelden": "AG",
  "Spreitenbach": "AG",
  "Oftringen": "AG",
  "Zofingen": "AG",
  "Suhr": "AG",
  "Buchs": "AG",
  "Muri": "AG",
  "Lenzburg": "AG",
  "Brugg": "AG",
  "Kreuzlingen": "TG",
  "Arbon": "TG",
  "Weinfelden": "TG",
  "Amriswil": "TG",
  "Romanshorn": "TG",
  "Sirnach": "TG",
  "Münchwilen": "TG",
  "Wil": "SG",
  "Rapperswil-Jona": "SG",
  "Gossau": "SG",
  "Uzwil": "SG",
  "Buchs": "SG",
  "Flawil": "SG",
  "Jona": "SG",
  "Wattwil": "SG",
  "Altstätten": "SG",
  "Widnau": "SG",
  "Rorschach": "SG",
  "Bad Ragaz": "SG",
  "Sargans": "SG",
  "Mels": "SG",
  "Walenstadt": "SG",
  "Kirchberg": "SG",
  "Ebnat-Kappel": "SG",
  "Goldach": "SG",
  "Mörschwil": "SG",
  "Wittenbach": "SG",
  "Gaiserwald": "SG",
  "Andwil": "SG",
  "Degersheim": "SG",
  "Oberriet": "SG",
  "Rebstein": "SG",
  "Au": "SG",
  "Berneck": "SG",
  "Diepoldsau": "SG",
  "Grabs": "SG",
  "Sevelen": "SG",
  "Vilters-Wangs": "SG",
  "Wartau": "SG",
  "Emmen": "LU",
  "Kriens": "LU",
  "Horw": "LU",
  "Ebikon": "LU",
  "Sursee": "LU",
  "Littau": "LU",
  "Hochdorf": "LU",
  "Root": "LU",
  "Meggen": "LU",
  "Rothenburg": "LU",
  "Adligenswil": "LU",
  "Willisau": "LU",
  "Entlebuch": "LU",
  "Malters": "LU",
  "Neuenkirch": "LU",
  "Rain": "LU",
  "Reiden": "LU",
  "Ruswil": "LU",
  "Schötz": "LU",
  "Sempach": "LU",
  "Triengen": "LU",
  "Udligenswil": "LU",
  "Vitznau": "LU",
  "Weggis": "LU",
  "Wolhusen": "LU",
  "Liestal": "BL",
  "Allschwil": "BL",
  "Reinach": "BL",
  "Muttenz": "BL",
  "Pratteln": "BL",
  "Binningen": "BL",
  "Bottmingen": "BL",
  "Oberwil": "BL",
  "Aesch": "BL",
  "Gelterkinden": "BL",
  "Laufen": "BL",
  "Sissach": "BL",
  "Birsfelden": "BL",
  "Münchenstein": "BL",
  "Arlesheim": "BL",
  "Dornach": "SO",
  "Olten": "SO",
  "Grenchen": "SO",
  "Derendingen": "SO",
  "Zuchwil": "SO",
  "Bettlach": "SO",
  "Bellach": "SO",
  "Trimbach": "SO",
  "Wangen bei Olten": "SO",
  "Gerlafingen": "SO",
  "Oensingen": "SO",
  "Balsthal": "SO",
  "Egerkingen": "SO",
  "Härkingen": "SO",
  "Kestenholz": "SO",
  "Neuendorf": "SO",
  "Niedergösgen": "SO",
  "Rickenbach": "SO",
  "Schönenwerd": "SO",
  "Starrkirch-Wil": "SO",
  "Winznau": "SO",
  "Riehen": "BS",
  "Bettingen": "BS"
}

const rechtsform = {
  1: 'EU', // Einzelunternehmen
  2: 'KG', // Kollektivgesellschaft
  3: 'AG', // Aktiengesellschaft
  4: 'GmbH', // Gesellschaft mit beschränkter Haftung
  5: 'Gen', // Genossenschaft
  6: 'e.V.', // Verein (eingetragener Verein)
  7: 'Stiftung', // Stiftung
  8: 'IÖR', // Institut des öffentlichen Rechts
  9: 'Zweigndl.', // Zweigniederlassung
  10: 'KG', // Kommanditgesellschaft
  11: 'Zweigndl. ausl. Ges.', // Zweigniederlassung einer ausländischen Gesellschaft
  12: 'KGaA', // Kommanditaktiengesellschaft
  13: 'BR', // Besondere Rechtsform
  14: 'Gem.', // Gemeinschaft
  15: 'InvG festes Kapital', // Investmentgesellschaft mit festem Kapital
  16: 'InvG variables Kapital', // Investmentgesellschaft mit variablem Kapital
  17: 'KGKKA', // Kommanditgesellschaft für kollektive Kapitalanlagen
  18: 'nichtkfm. Prokura', // Nichtkaufmännische Prokura
  0: '(unbekannt)' // (unbekannt)
};

async function zefixQuery() {
  var episode = 0;

  while (true) {
    const query = (await (await fetch("https://www.zefix.ch/ZefixREST/api/v1/firm/search.json", {
      "credentials": "include",
      "headers": {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
        "Content-Type": "application/json",
      },
      "body": "{\"languageKey\":\"de\",\"maxEntries\":5000,\"offset\":" + episode + ",\"name\":\"" + searchparameter + "\"}",
      "method": "POST",
      "mode": "cors"
    })).json());

    if (query.error) {
      break;
    }

    for (const company of query['list']) {
      var db = new sqlite3.Database('dump.db');
      const wasFound = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM firmen WHERE uid = ?', [company.uidFormatted], (err, row) => {
          if (err) {
            console.error(err.message);
            resolve(false); // Reject if there's an error
            return;
          }
    
          resolve(row.count > 0); // Resolve with true or false based on the count
        });
      });
      db.close();

      if (! wasFound) {
        await delay(RATE_LIMIT_DELAY); // Rate limiting
        const response = await fetchCompany(company);

        // const query = company.name + " " + response.address.street + " " + response.address.houseNumber + " " + response.address.town + " " + response.address.swissZipCode + ' "Impressum"';
        // const possible_impress = await possibleImpressQuery(query);

        const data = {
          "UID": response.uidFormatted,
          "Firma": company.name,
          "Rechtsform": rechtsform[response.legalFormId],
          "Zweck": response.purpose,
          "Sitz": response.legalSeat,
          "Adresse": response.address.street + " " + response.address.houseNumber,
          "Ort": response.address.swissZipCode + " " + response.address.town + " " + (response.address.addon !== null ? response.address.addon : ""),
          "Kanton": kanton[response.address.town],
          "Status": response.status,
          "Moegliches_Impressum": ""
        };
        await writeSQL(data);
        console.log(data);
      };
    };

    if (! query.hasMoreResults) {
      break;
    };

    episode = query.maxOffset;
    // console.log("* Querying more results...");
  };
};

zefixQuery();
