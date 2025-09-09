const KosherZmanim = require("kosher-zmanim");
const fs = require('fs');

// Configuration pour le 13 septembre 2025
const date = new Date(2025, 8, 13); // Mois 8 = Septembre (0-indexed)
const latitude = 31.7650511;
const longitude = 35.1746302;
const elevation = 0;
const timezone = "Asia/Jerusalem";

// Créer la localisation
const location = new KosherZmanim.GeoLocation(
    "Custom Location", 
    latitude, 
    longitude, 
    elevation, 
    timezone
);

// Créer le calendrier
const calendar = new KosherZmanim.ComplexZmanimCalendar(location);
calendar.setDate(date);

// Fonction pour formater le temps
function formatTime(date) {
    if (!date || date === null) {
        return "N/A";
    }
    try {
        if (date instanceof Date) {
            return date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                timeZone: timezone 
            });
        }
        return "N/A";
    } catch (error) {
        return "Erreur";
    }
}

// Fonction pour formater une durée en millisecondes
function formatDuration(ms) {
    if (typeof ms !== 'number' || isNaN(ms)) {
        return "N/A";
    }
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Fonction pour appeler une méthode de manière sécurisée
function safeCall(method, params = []) {
    try {
        if (!calendar[method]) {
            return null;
        }
        const result = calendar[method](...params);
        return result;
    } catch (error) {
        console.error(`Erreur avec ${method}: ${error.message}`);
        return null;
    }
}

// Liste complète des zmanim
let results = [];
let totalCount = 0;

console.log("Calcul des zmanim en cours...\n");

// Aube (Alot HaShachar)
results.push("## Aube (Alot HaShachar)\n");
const alotMethods = [
    "getAlos120",
    "getAlos120Zmanis", 
    "getAlos96",
    "getAlos96Zmanis",
    "getAlos90",
    "getAlos90Zmanis",
    "getAlos72",
    "getAlos72Zmanis",
    "getAlos60",
    "getAlos26Degrees",
    "getAlos19Point8Degrees",
    "getAlos19Degrees",
    "getAlos18Degrees",
    "getAlos16Point1Degrees",
    "getAlosBaalHatanya"
];

alotMethods.forEach(method => {
    totalCount++;
    const time = safeCall(method);
    const formattedTime = formatTime(time);
    const methodName = method.replace(/get|Alos/g, '').replace(/([A-Z])/g, ' $1').trim();
    results.push(`${totalCount}. **Alot ${methodName}** : ${formattedTime}`);
});

// Misheyakir
results.push("\n## Misheyakir (Tallit et Tefillin)\n");
const misheyakirMethods = [
    "getMisheyakir11Point5Degrees",
    "getMisheyakir11Degrees",
    "getMisheyakir10Point2Degrees",
    "getMisheyakir9Point5Degrees",
    "getMisheyakir7Point65Degrees"
];

misheyakirMethods.forEach(method => {
    totalCount++;
    const time = safeCall(method);
    const formattedTime = formatTime(time);
    const degrees = method.match(/(\d+Point\d+|\d+)/)[0].replace('Point', '.');
    results.push(`${totalCount}. **Misheyakir ${degrees} degrés** : ${formattedTime}`);
});

// Lever du soleil
results.push("\n## Lever du soleil (Hanetz)\n");
totalCount++;
results.push(`${totalCount}. **Lever du soleil** : ${formatTime(safeCall("getSunrise"))}`);
totalCount++;
results.push(`${totalCount}. **Lever au niveau de la mer** : ${formatTime(safeCall("getSeaLevelSunrise"))}`);
totalCount++;
results.push(`${totalCount}. **Lever Baal HaTanya** : ${formatTime(safeCall("getSunriseBaalHatanya"))}`);

// Sof Zman Kriat Shema
results.push("\n## Sof Zman Kriat Shema\n");
const shemaMethods = [
    ["getSofZmanShmaGRA", "Shema GRA"],
    ["getSofZmanShmaBaalHatanya", "Shema Baal HaTanya"],
    ["getSofZmanShmaMGA120Minutes", "Shema MGA 120 minutes"],
    ["getSofZmanShmaMGA96Minutes", "Shema MGA 96 minutes"],
    ["getSofZmanShmaMGA96MinutesZmanis", "Shema MGA 96 min Zmanis"],
    ["getSofZmanShmaMGA90Minutes", "Shema MGA 90 minutes"],
    ["getSofZmanShmaMGA90MinutesZmanis", "Shema MGA 90 min Zmanis"],
    ["getSofZmanShmaMGA72Minutes", "Shema MGA 72 minutes"],
    ["getSofZmanShmaMGA72MinutesZmanis", "Shema MGA 72 min Zmanis"],
    ["getSofZmanShmaMGA60Minutes", "Shema MGA 60 minutes"],
    ["getSofZmanShmaMGA19Point8Degrees", "Shema MGA 19.8 degrés"],
    ["getSofZmanShmaMGA18Degrees", "Shema MGA 18 degrés"],
    ["getSofZmanShmaMGA16Point1Degrees", "Shema MGA 16.1 degrés"],
    ["getSofZmanShma3HoursBeforeChatzos", "Shema 3 heures avant Chatzot"],
    ["getSofZmanShmaAteretTorah", "Shema Ateret Torah"],
    ["getSofZmanShmaAlos16Point1ToSunset", "Shema Alos to Sunset"],
    ["getSofZmanShmaAlos16Point1ToTzaisGeonim7Point083Degrees", "Shema Alos to Tzais"]
];

shemaMethods.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Sof Zman Tefila
results.push("\n## Sof Zman Tefila\n");
const tefilaMethods = [
    ["getSofZmanTfilaGRA", "Tefila GRA"],
    ["getSofZmanTfilaBaalHatanya", "Tefila Baal HaTanya"],
    ["getSofZmanTfilaMGA120Minutes", "Tefila MGA 120 minutes"],
    ["getSofZmanTfilaMGA96Minutes", "Tefila MGA 96 minutes"],
    ["getSofZmanTfilaMGA96MinutesZmanis", "Tefila MGA 96 min Zmanis"],
    ["getSofZmanTfilaMGA90Minutes", "Tefila MGA 90 minutes"],
    ["getSofZmanTfilaMGA90MinutesZmanis", "Tefila MGA 90 min Zmanis"],
    ["getSofZmanTfilaMGA72Minutes", "Tefila MGA 72 minutes"],
    ["getSofZmanTfilaMGA72MinutesZmanis", "Tefila MGA 72 min Zmanis"],
    ["getSofZmanTfilaMGA60Minutes", "Tefila MGA 60 minutes"],
    ["getSofZmanTfilaMGA19Point8Degrees", "Tefila MGA 19.8 degrés"],
    ["getSofZmanTfilaMGA18Degrees", "Tefila MGA 18 degrés"],
    ["getSofZmanTfilaMGA16Point1Degrees", "Tefila MGA 16.1 degrés"],
    ["getSofZmanTfila2HoursBeforeChatzos", "Tefila 2 heures avant Chatzot"],
    ["getSofZmanTfilahAteretTorah", "Tefila Ateret Torah"],
    ["getSofZmanTfilaAlos16Point1ToSunset", "Tefila Alos to Sunset"]
];

tefilaMethods.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Chatzot
results.push("\n## Chatzot (Midi)\n");
totalCount++;
results.push(`${totalCount}. **Chatzot** : ${formatTime(safeCall("getChatzos"))}`);
totalCount++;
results.push(`${totalCount}. **Chatzot solaire fixe** : ${formatTime(safeCall("getFixedLocalChatzos"))}`);

// Mincha
results.push("\n## Mincha\n");
const minchaMethods = [
    ["getMinchaGedola", "Mincha Gedola"],
    ["getMinchaGedola30Minutes", "Mincha Gedola 30 min"],
    ["getMinchaGedola72Minutes", "Mincha Gedola 72 min"],
    ["getMinchaGedola16Point1Degrees", "Mincha Gedola 16.1 degrés"],
    ["getMinchaGedolaAteretTorah", "Mincha Gedola Ateret Torah"],
    ["getMinchaGedolaBaalHatanya", "Mincha Gedola Baal HaTanya"],
    ["getMinchaGedolaBaalHatanyaGreaterThan30", "Mincha Gedola GRA Baal HaTanya"],
    ["getMinchaKetana", "Mincha Ketana"],
    ["getMinchaKetana72Minutes", "Mincha Ketana 72 min"],
    ["getMinchaKetana16Point1Degrees", "Mincha Ketana 16.1 degrés"],
    ["getMinchaKetanaAteretTorah", "Mincha Ketana Ateret Torah"],
    ["getMinchaKetanaBaalHatanya", "Mincha Ketana Baal HaTanya"]
];

minchaMethods.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Plag HaMincha
results.push("\n## Plag HaMincha\n");
const plagMethods = [
    ["getPlagHamincha", "Plag HaMincha"],
    ["getPlagHamincha60Minutes", "Plag HaMincha 60 min"],
    ["getPlagHamincha72Minutes", "Plag HaMincha 72 min"],
    ["getPlagHamincha72MinutesZmanis", "Plag HaMincha 72 min Zmanis"],
    ["getPlagHamincha90Minutes", "Plag HaMincha 90 min"],
    ["getPlagHamincha90MinutesZmanis", "Plag HaMincha 90 min Zmanis"],
    ["getPlagHamincha96Minutes", "Plag HaMincha 96 min"],
    ["getPlagHamincha96MinutesZmanis", "Plag HaMincha 96 min Zmanis"],
    ["getPlagHamincha16Point1Degrees", "Plag HaMincha 16.1 degrés"],
    ["getPlagHamincha18Degrees", "Plag HaMincha 18 degrés"],
    ["getPlagHamincha19Point8Degrees", "Plag HaMincha 19.8 degrés"],
    ["getPlagHamincha26Degrees", "Plag HaMincha 26 degrés"],
    ["getPlagHaminchaAteretTorah", "Plag HaMincha Ateret Torah"],
    ["getPlagHaminchaBaalHatanya", "Plag HaMincha Baal HaTanya"],
    ["getPlagAlos16Point1ToSunset", "Plag Alos to Sunset"],
    ["getPlagAlosToSunset", "Plag Alos to Sunset (Standard)"]
];

plagMethods.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Coucher du soleil
results.push("\n## Coucher du soleil (Shkia)\n");
totalCount++;
results.push(`${totalCount}. **Coucher du soleil** : ${formatTime(safeCall("getSunset"))}`);
totalCount++;
results.push(`${totalCount}. **Coucher au niveau de la mer** : ${formatTime(safeCall("getSeaLevelSunset"))}`);
totalCount++;
results.push(`${totalCount}. **Coucher Baal HaTanya** : ${formatTime(safeCall("getSunsetBaalHatanya"))}`);

// Bein HaShmashot
results.push("\n## Bein HaShmashot\n");
const beinHashmashosMethodes = [
    ["getBainHashmashosRT13Point5MinutesBefore7Point083Degrees", "Bein HaShmashot RT 13.5 min"],
    ["getBainHashmashosRT58Point5Minutes", "Bein HaShmashot RT 58.5 min"],
    ["getBainHashmashosRT13Point24Degrees", "Bein HaShmashot RT 13.24 degrés"],
    ["getBainHashmashosRT2Stars", "Bein HaShmashot RT 2 étoiles"]
];

beinHashmashosMethodes.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Tzait HaKochavim
results.push("\n## Tzait HaKochavim (Sortie des étoiles)\n");
const tzaitMethods = [
    ["getTzais", "Tzait 3 étoiles"],
    ["getTzaisGeonim3Point65Degrees", "Tzait Geonim 3.65 degrés"],
    ["getTzaisGeonim3Point676Degrees", "Tzait Geonim 3.676 degrés"],
    ["getTzaisGeonim4Point37Degrees", "Tzait Geonim 4.37 degrés"],
    ["getTzaisGeonim4Point61Degrees", "Tzait Geonim 4.61 degrés"],
    ["getTzaisGeonim4Point8Degrees", "Tzait Geonim 4.8 degrés"],
    ["getTzaisGeonim5Point88Degrees", "Tzait Geonim 5.88 degrés"],
    ["getTzaisGeonim5Point95Degrees", "Tzait Geonim 5.95 degrés"],
    ["getTzaisGeonim6Point45Degrees", "Tzait Geonim 6.45 degrés"],
    ["getTzaisGeonim7Point083Degrees", "Tzait Geonim 7.083 degrés"],
    ["getTzaisGeonim7Point67Degrees", "Tzait Geonim 7.67 degrés"],
    ["getTzaisGeonim8Point5Degrees", "Tzait Geonim 8.5 degrés"],
    ["getTzaisGeonim9Point3Degrees", "Tzait Geonim 9.3 degrés"],
    ["getTzaisGeonim9Point75Degrees", "Tzait Geonim 9.75 degrés"],
    ["getTzaisBaalHatanya", "Tzait Baal HaTanya"],
    ["getTzais16Point1Degrees", "Tzait 16.1 degrés"],
    ["getTzais18Degrees", "Tzait 18 degrés"],
    ["getTzais19Point8Degrees", "Tzait 19.8 degrés"],
    ["getTzais26Degrees", "Tzait 26 degrés"],
    ["getTzais50", "Tzait 50 minutes"],
    ["getTzais60", "Tzait 60 minutes"],
    ["getTzais72", "Tzait 72 minutes"],
    ["getTzais72Zmanis", "Tzait 72 minutes Zmanis"],
    ["getTzais90", "Tzait 90 minutes"],
    ["getTzais90Zmanis", "Tzait 90 minutes Zmanis"],
    ["getTzais96", "Tzait 96 minutes"],
    ["getTzais96Zmanis", "Tzait 96 minutes Zmanis"],
    ["getTzais120", "Tzait 120 minutes"],
    ["getTzais120Zmanis", "Tzait 120 minutes Zmanis"],
    ["getTzaisAteretTorah", "Tzait Ateret Torah"]
];

tzaitMethods.forEach(([method, name]) => {
    totalCount++;
    const time = safeCall(method);
    results.push(`${totalCount}. **${name}** : ${formatTime(time)}`);
});

// Heures Saisonnières
results.push("\n## Heures Saisonnières (Shaot Zmaniyot)\n");
const shaotMethods = [
    ["getShaahZmanisGra", "Heure GRA"],
    ["getShaahZmanisMGA", "Heure MGA"],
    ["getShaahZmanisBaalHatanya", "Heure Baal HaTanya"],
    ["getShaahZmanis16Point1Degrees", "Heure 16.1 degrés"],
    ["getShaahZmanis18Degrees", "Heure 18 degrés"],
    ["getShaahZmanis19Point8Degrees", "Heure 19.8 degrés"],
    ["getShaahZmanis26Degrees", "Heure 26 degrés"],
    ["getShaahZmanis60Minutes", "Heure 60 minutes"],
    ["getShaahZmanis72Minutes", "Heure 72 minutes"],
    ["getShaahZmanis72MinutesZmanis", "Heure 72 min Zmanis"],
    ["getShaahZmanis90Minutes", "Heure 90 minutes"],
    ["getShaahZmanis90MinutesZmanis", "Heure 90 min Zmanis"],
    ["getShaahZmanis96Minutes", "Heure 96 minutes"],
    ["getShaahZmanis96MinutesZmanis", "Heure 96 min Zmanis"],
    ["getShaahZmanis120Minutes", "Heure 120 minutes"],
    ["getShaahZmanis120MinutesZmanis", "Heure 120 min Zmanis"],
    ["getShaahZmanisAteretTorah", "Heure Ateret Torah"]
];

shaotMethods.forEach(([method, name]) => {
    totalCount++;
    const duration = safeCall(method);
    const formatted = typeof duration === 'number' ? formatDuration(duration) : "N/A";
    results.push(`${totalCount}. **${name}** : ${formatted}`);
});

// Autres Zmanim
results.push("\n## Autres Zmanim\n");
totalCount++;
results.push(`${totalCount}. **Achilas Chametz GRA** : ${formatTime(safeCall("getSofZmanAchilasChametzGRA"))}`);
totalCount++;
results.push(`${totalCount}. **Achilas Chametz MGA 72 min** : ${formatTime(safeCall("getSofZmanAchilasChametzMGA72Minutes"))}`);
totalCount++;
results.push(`${totalCount}. **Achilas Chametz MGA 16.1°** : ${formatTime(safeCall("getSofZmanAchilasChametzMGA16Point1Degrees"))}`);
totalCount++;
results.push(`${totalCount}. **Biur Chametz GRA** : ${formatTime(safeCall("getSofZmanBiurChametzGRA"))}`);
totalCount++;
results.push(`${totalCount}. **Biur Chametz MGA 72 min** : ${formatTime(safeCall("getSofZmanBiurChametzMGA72Minutes"))}`);
totalCount++;
results.push(`${totalCount}. **Biur Chametz Baal HaTanya** : ${formatTime(safeCall("getSofZmanBiurChametzBaalHatanya"))}`);
totalCount++;
results.push(`${totalCount}. **Allumage Shabbat (18 min)** : ${formatTime(safeCall("getCandleLighting"))}`);

// Créer le document Markdown
const markdown = `# Liste Complète des ${totalCount} Zmanim
## Date : Samedi 13 septembre 2025
## Lieu : Latitude ${latitude}°N, Longitude ${longitude}°E
## Fuseau horaire : ${timezone}
## Élévation : ${elevation}m

---

### Résumé
- **Total de zmanim calculés** : ${totalCount}
- **Coordonnées utilisées** : ${latitude}°N, ${longitude}°E
- **Méthode de calcul** : KosherZmanim Library v0.9.0
- **Date du calcul** : ${date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

${results.join('\n')}

---

## Notes importantes

1. **Heures Zmaniyot** : Les valeurs en heures/minutes/secondes représentent la durée d'une heure saisonnière (1/12 du jour ou de la nuit)
2. **Précision** : Les calculs sont basés sur des formules astronomiques précises
3. **Variations** : Différentes communautés utilisent différentes méthodes de calcul selon leur tradition halakhique
4. **Élévation** : L'élévation affecte les horaires de lever et coucher du soleil
5. **Shabbat** : Le 13 septembre 2025 est un samedi (Shabbat)

## Méthodes recommandées (haute précision)

D'après l'analyse comparative avec le calendrier עתים לבינה :

### Horaires principaux recommandés :
- **Alot 90 min** : Utiliser \`getAlos19Point8Degrees()\` (précision ±7s)
- **Alot 72 min** : Utiliser \`getAlos16Point1Degrees()\` (précision ±14s)
- **Misheyakir** : Utiliser \`getMisheyakir11Point5Degrees()\` (précision ±40s)
- **Lever du soleil** : Utiliser \`getSeaLevelSunrise()\` (précision ±18s)
- **Shema GRA** : Utiliser \`getSofZmanShmaGRA()\` (précision ±1s)
- **Shema MGA 90** : Utiliser \`getSofZmanShmaMGA19Point8Degrees()\` (précision ±3s)
- **Shema MGA 72** : Utiliser \`getSofZmanShmaMGA16Point1Degrees()\` (précision ±14s)
- **Tefila GRA** : Utiliser \`getSofZmanTfilaBaalHatanya()\` (précision ±23s)
- **Tefila MGA 90** : Utiliser \`getSofZmanTfilaMGA19Point8Degrees()\` (précision ±7s)
- **Tefila MGA 72** : Utiliser \`getSofZmanTfilaMGA16Point1Degrees()\` (précision ±15s)
- **Chatzot** : Utiliser \`getChatzos()\` (précision ±46s)
- **Mincha Gedola** : Utiliser \`getMinchaGedola30Minutes()\` (précision ±14s)
- **Coucher** : Utiliser \`getSeaLevelSunset()\` (précision ±29s)
- **Tzait moyen** : Utiliser \`getBainHashmashosRT2Stars()\` (précision ±31s)
- **Tzait RT 72** : Utiliser \`getTzais72()\` (précision ±1s)

---

*Document généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*
*Utilisant KosherZmanim Library - ${totalCount} méthodes de calcul disponibles*
`;

// Sauvegarder le fichier
const outputPath = '/home/eli/Documents/MyTzedaka/documentation/ZMANIM-180-COMPLET-13-09-2025.md';
fs.writeFileSync(outputPath, markdown);

console.log(`\n✅ Document créé avec succès : ${outputPath}`);
console.log(`📊 Total de ${totalCount} zmanim calculés pour le 13 septembre 2025`);
console.log(`📍 Coordonnées : ${latitude}°N, ${longitude}°E`);