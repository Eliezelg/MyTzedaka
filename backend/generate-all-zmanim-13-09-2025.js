const KosherZmanim = require("kosher-zmanim");
const fs = require('fs');
const path = require('path');

// Configuration pour le 13 septembre 2025
const targetDate = new Date(2025, 8, 13); // Mois 8 = Septembre (0-indexed)
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
calendar.setDate(targetDate);

// Fonction pour formater le temps
function formatTime(dateTime) {
    if (!dateTime || dateTime === null) {
        return "N/A";
    }
    try {
        // Vérifier si c'est un objet DateTime de Luxon
        if (dateTime && dateTime.isLuxonDateTime) {
            // Convertir en Date JavaScript
            const jsDate = dateTime.toJSDate();
            return jsDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                timeZone: timezone 
            });
        }
        // Si c'est déjà une Date JavaScript
        else if (dateTime instanceof Date && !isNaN(dateTime.getTime())) {
            const year = dateTime.getFullYear();
            if (year < 1900 || year > 3000) {
                return "Date invalide";
            }
            return dateTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                timeZone: timezone 
            });
        }
        return "N/A";
    } catch (error) {
        console.error("Erreur formatTime:", error);
        return "Erreur";
    }
}

// Fonction pour formater une durée en millisecondes
function formatDuration(ms) {
    if (typeof ms !== 'number' || isNaN(ms) || ms <= 0) {
        return "N/A";
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

// Test de base pour vérifier que le calendrier fonctionne
console.log("Test de base:");
console.log("Date:", targetDate.toLocaleDateString());
console.log("Sunrise:", calendar.getSunrise());
console.log("Sunset:", calendar.getSunset());
console.log("---\n");

// Collecter tous les zmanim
let results = [];
let totalCount = 0;
let validCount = 0;

console.log("Calcul des zmanim pour le 13 septembre 2025...\n");

// Structure des zmanim avec les méthodes exactes
const zmanimCategories = {
    "Aube (Alot HaShachar)": [
        { method: "getAlos120", name: "Alot 120 minutes" },
        { method: "getAlos120Zmanis", name: "Alot 120 minutes Zmanis" },
        { method: "getAlos96", name: "Alot 96 minutes" },
        { method: "getAlos96Zmanis", name: "Alot 96 minutes Zmanis" },
        { method: "getAlos90", name: "Alot 90 minutes" },
        { method: "getAlos90Zmanis", name: "Alot 90 minutes Zmanis" },
        { method: "getAlos72", name: "Alot 72 minutes" },
        { method: "getAlos72Zmanis", name: "Alot 72 minutes Zmanis" },
        { method: "getAlos60", name: "Alot 60 minutes" },
        { method: "getAlos26Degrees", name: "Alot 26 degrés" },
        { method: "getAlos19Point8Degrees", name: "Alot 19.8 degrés ⭐" },
        { method: "getAlos19Degrees", name: "Alot 19 degrés" },
        { method: "getAlos18Degrees", name: "Alot 18 degrés" },
        { method: "getAlos16Point1Degrees", name: "Alot 16.1 degrés ⭐" },
        { method: "getAlosBaalHatanya", name: "Alot Baal HaTanya" }
    ],
    "Misheyakir (Tallit et Tefillin)": [
        { method: "getMisheyakir11Point5Degrees", name: "Misheyakir 11.5 degrés ⭐" },
        { method: "getMisheyakir11Degrees", name: "Misheyakir 11 degrés" },
        { method: "getMisheyakir10Point2Degrees", name: "Misheyakir 10.2 degrés" },
        { method: "getMisheyakir9Point5Degrees", name: "Misheyakir 9.5 degrés" },
        { method: "getMisheyakir7Point65Degrees", name: "Misheyakir 7.65 degrés" }
    ],
    "Lever du soleil (Hanetz)": [
        { method: "getSunrise", name: "Lever du soleil" },
        { method: "getSeaLevelSunrise", name: "Lever au niveau de la mer ⭐" },
        { method: "getSunriseBaalHatanya", name: "Lever Baal HaTanya" }
    ],
    "Sof Zman Kriat Shema": [
        { method: "getSofZmanShmaGRA", name: "Shema GRA ⭐" },
        { method: "getSofZmanShmaBaalHatanya", name: "Shema Baal HaTanya" },
        { method: "getSofZmanShmaMGA120Minutes", name: "Shema MGA 120 minutes" },
        { method: "getSofZmanShmaMGA96Minutes", name: "Shema MGA 96 minutes" },
        { method: "getSofZmanShmaMGA96MinutesZmanis", name: "Shema MGA 96 min Zmanis" },
        { method: "getSofZmanShmaMGA90Minutes", name: "Shema MGA 90 minutes" },
        { method: "getSofZmanShmaMGA90MinutesZmanis", name: "Shema MGA 90 min Zmanis" },
        { method: "getSofZmanShmaMGA72Minutes", name: "Shema MGA 72 minutes" },
        { method: "getSofZmanShmaMGA72MinutesZmanis", name: "Shema MGA 72 min Zmanis" },
        { method: "getSofZmanShmaMGA60Minutes", name: "Shema MGA 60 minutes" },
        { method: "getSofZmanShmaMGA19Point8Degrees", name: "Shema MGA 19.8 degrés ⭐" },
        { method: "getSofZmanShmaMGA18Degrees", name: "Shema MGA 18 degrés" },
        { method: "getSofZmanShmaMGA16Point1Degrees", name: "Shema MGA 16.1 degrés ⭐" },
        { method: "getSofZmanShma3HoursBeforeChatzos", name: "Shema 3 heures avant Chatzot" },
        { method: "getSofZmanShmaAteretTorah", name: "Shema Ateret Torah ⭐" },
        { method: "getSofZmanShmaAlos16Point1ToSunset", name: "Shema Alos 16.1 to Sunset" },
        { method: "getSofZmanShmaAlos16Point1ToTzaisGeonim7Point083Degrees", name: "Shema Alos to Tzais" }
    ],
    "Sof Zman Tefila": [
        { method: "getSofZmanTfilaGRA", name: "Tefila GRA" },
        { method: "getSofZmanTfilaBaalHatanya", name: "Tefila Baal HaTanya ⭐" },
        { method: "getSofZmanTfilaMGA120Minutes", name: "Tefila MGA 120 minutes" },
        { method: "getSofZmanTfilaMGA96Minutes", name: "Tefila MGA 96 minutes" },
        { method: "getSofZmanTfilaMGA96MinutesZmanis", name: "Tefila MGA 96 min Zmanis" },
        { method: "getSofZmanTfilaMGA90Minutes", name: "Tefila MGA 90 minutes" },
        { method: "getSofZmanTfilaMGA90MinutesZmanis", name: "Tefila MGA 90 min Zmanis" },
        { method: "getSofZmanTfilaMGA72Minutes", name: "Tefila MGA 72 minutes" },
        { method: "getSofZmanTfilaMGA72MinutesZmanis", name: "Tefila MGA 72 min Zmanis ⭐" },
        { method: "getSofZmanTfilaMGA60Minutes", name: "Tefila MGA 60 minutes" },
        { method: "getSofZmanTfilaMGA19Point8Degrees", name: "Tefila MGA 19.8 degrés ⭐" },
        { method: "getSofZmanTfilaMGA18Degrees", name: "Tefila MGA 18 degrés" },
        { method: "getSofZmanTfilaMGA16Point1Degrees", name: "Tefila MGA 16.1 degrés ⭐" },
        { method: "getSofZmanTfila2HoursBeforeChatzos", name: "Tefila 2 heures avant Chatzot" },
        { method: "getSofZmanTfilahAteretTorah", name: "Tefila Ateret Torah" },
        { method: "getSofZmanTfilaAlos16Point1ToSunset", name: "Tefila Alos to Sunset" }
    ],
    "Chatzot (Midi)": [
        { method: "getChatzos", name: "Chatzot ⭐" },
        { method: "getFixedLocalChatzos", name: "Chatzot solaire fixe" }
    ],
    "Mincha": [
        { method: "getMinchaGedola", name: "Mincha Gedola" },
        { method: "getMinchaGedola30Minutes", name: "Mincha Gedola 30 min ⭐" },
        { method: "getMinchaGedola72Minutes", name: "Mincha Gedola 72 min" },
        { method: "getMinchaGedola16Point1Degrees", name: "Mincha Gedola 16.1 degrés" },
        { method: "getMinchaGedolaAteretTorah", name: "Mincha Gedola Ateret Torah" },
        { method: "getMinchaGedolaBaalHatanya", name: "Mincha Gedola Baal HaTanya" },
        { method: "getMinchaGedolaBaalHatanyaGreaterThan30", name: "Mincha Gedola GRA Baal HaTanya" },
        { method: "getMinchaKetana", name: "Mincha Ketana" },
        { method: "getMinchaKetana72Minutes", name: "Mincha Ketana 72 min" },
        { method: "getMinchaKetana16Point1Degrees", name: "Mincha Ketana 16.1 degrés" },
        { method: "getMinchaKetanaAteretTorah", name: "Mincha Ketana Ateret Torah" },
        { method: "getMinchaKetanaBaalHatanya", name: "Mincha Ketana Baal HaTanya" },
        { method: "getMinchaKetanaGRAFixedLocalChatzosToSunset", name: "Mincha Ketana GRA Fixed ⭐" }
    ],
    "Plag HaMincha": [
        { method: "getPlagHamincha", name: "Plag HaMincha" },
        { method: "getPlagHamincha60Minutes", name: "Plag HaMincha 60 min" },
        { method: "getPlagHamincha72Minutes", name: "Plag HaMincha 72 min" },
        { method: "getPlagHamincha72MinutesZmanis", name: "Plag HaMincha 72 min Zmanis" },
        { method: "getPlagHamincha90Minutes", name: "Plag HaMincha 90 min" },
        { method: "getPlagHamincha90MinutesZmanis", name: "Plag HaMincha 90 min Zmanis" },
        { method: "getPlagHamincha96Minutes", name: "Plag HaMincha 96 min" },
        { method: "getPlagHamincha96MinutesZmanis", name: "Plag HaMincha 96 min Zmanis" },
        { method: "getPlagHamincha16Point1Degrees", name: "Plag HaMincha 16.1 degrés" },
        { method: "getPlagHamincha18Degrees", name: "Plag HaMincha 18 degrés" },
        { method: "getPlagHamincha19Point8Degrees", name: "Plag HaMincha 19.8 degrés" },
        { method: "getPlagHamincha26Degrees", name: "Plag HaMincha 26 degrés" },
        { method: "getPlagHaminchaAteretTorah", name: "Plag HaMincha Ateret Torah" },
        { method: "getPlagHaminchaBaalHatanya", name: "Plag HaMincha Baal HaTanya" },
        { method: "getPlagHaminchaGRAFixedLocalChatzosToSunset", name: "Plag HaMincha GRA Fixed ⭐" },
        { method: "getPlagAlos16Point1ToSunset", name: "Plag Alos 16.1 to Sunset" },
        { method: "getPlagAlosToSunset", name: "Plag Alos to Sunset" }
    ],
    "Coucher du soleil (Shkia)": [
        { method: "getSunset", name: "Coucher du soleil" },
        { method: "getSeaLevelSunset", name: "Coucher au niveau de la mer ⭐" },
        { method: "getSunsetBaalHatanya", name: "Coucher Baal HaTanya" }
    ],
    "Bein HaShmashot": [
        { method: "getBainHashmashosRT13Point5MinutesBefore7Point083Degrees", name: "Bein HaShmashot RT 13.5 min" },
        { method: "getBainHashmashosRT58Point5Minutes", name: "Bein HaShmashot RT 58.5 min" },
        { method: "getBainHashmashosRT13Point24Degrees", name: "Bein HaShmashot RT 13.24 degrés" },
        { method: "getBainHashmashosRT2Stars", name: "Bein HaShmashot RT 2 étoiles ⭐" }
    ],
    "Tzait HaKochavim (Sortie des étoiles)": [
        { method: "getTzais", name: "Tzait 3 étoiles" },
        { method: "getTzaisGeonim3Point65Degrees", name: "Tzait Geonim 3.65 degrés" },
        { method: "getTzaisGeonim3Point676Degrees", name: "Tzait Geonim 3.676 degrés" },
        { method: "getTzaisGeonim4Point37Degrees", name: "Tzait Geonim 4.37 degrés ⭐" },
        { method: "getTzaisGeonim4Point61Degrees", name: "Tzait Geonim 4.61 degrés" },
        { method: "getTzaisGeonim4Point8Degrees", name: "Tzait Geonim 4.8 degrés" },
        { method: "getTzaisGeonim5Point88Degrees", name: "Tzait Geonim 5.88 degrés" },
        { method: "getTzaisGeonim5Point95Degrees", name: "Tzait Geonim 5.95 degrés" },
        { method: "getTzaisGeonim6Point45Degrees", name: "Tzait Geonim 6.45 degrés" },
        { method: "getTzaisGeonim7Point083Degrees", name: "Tzait Geonim 7.083 degrés" },
        { method: "getTzaisGeonim7Point67Degrees", name: "Tzait Geonim 7.67 degrés" },
        { method: "getTzaisGeonim8Point5Degrees", name: "Tzait Geonim 8.5 degrés" },
        { method: "getTzaisGeonim9Point3Degrees", name: "Tzait Geonim 9.3 degrés" },
        { method: "getTzaisGeonim9Point75Degrees", name: "Tzait Geonim 9.75 degrés" },
        { method: "getTzaisBaalHatanya", name: "Tzait Baal HaTanya" },
        { method: "getTzais16Point1Degrees", name: "Tzait 16.1 degrés" },
        { method: "getTzais18Degrees", name: "Tzait 18 degrés" },
        { method: "getTzais19Point8Degrees", name: "Tzait 19.8 degrés" },
        { method: "getTzais26Degrees", name: "Tzait 26 degrés" },
        { method: "getTzais50", name: "Tzait 50 minutes" },
        { method: "getTzais60", name: "Tzait 60 minutes" },
        { method: "getTzais72", name: "Tzait 72 minutes (RT) ⭐" },
        { method: "getTzais72Zmanis", name: "Tzait 72 minutes Zmanis" },
        { method: "getTzais90", name: "Tzait 90 minutes" },
        { method: "getTzais90Zmanis", name: "Tzait 90 minutes Zmanis" },
        { method: "getTzais96", name: "Tzait 96 minutes" },
        { method: "getTzais96Zmanis", name: "Tzait 96 minutes Zmanis" },
        { method: "getTzais120", name: "Tzait 120 minutes" },
        { method: "getTzais120Zmanis", name: "Tzait 120 minutes Zmanis" },
        { method: "getTzaisAteretTorah", name: "Tzait Ateret Torah" }
    ],
    "Heures Saisonnières (Shaot Zmaniyot)": [
        { method: "getShaahZmanisGra", name: "Heure GRA" },
        { method: "getShaahZmanisMGA", name: "Heure MGA" },
        { method: "getShaahZmanisBaalHatanya", name: "Heure Baal HaTanya" },
        { method: "getShaahZmanis16Point1Degrees", name: "Heure 16.1 degrés" },
        { method: "getShaahZmanis18Degrees", name: "Heure 18 degrés" },
        { method: "getShaahZmanis19Point8Degrees", name: "Heure 19.8 degrés" },
        { method: "getShaahZmanis26Degrees", name: "Heure 26 degrés" },
        { method: "getShaahZmanis60Minutes", name: "Heure 60 minutes" },
        { method: "getShaahZmanis72Minutes", name: "Heure 72 minutes" },
        { method: "getShaahZmanis72MinutesZmanis", name: "Heure 72 min Zmanis" },
        { method: "getShaahZmanis90Minutes", name: "Heure 90 minutes" },
        { method: "getShaahZmanis90MinutesZmanis", name: "Heure 90 min Zmanis" },
        { method: "getShaahZmanis96Minutes", name: "Heure 96 minutes" },
        { method: "getShaahZmanis96MinutesZmanis", name: "Heure 96 min Zmanis" },
        { method: "getShaahZmanis120Minutes", name: "Heure 120 minutes" },
        { method: "getShaahZmanis120MinutesZmanis", name: "Heure 120 min Zmanis" },
        { method: "getShaahZmanisAteretTorah", name: "Heure Ateret Torah" }
    ],
    "Zmanim spéciaux": [
        { method: "getSofZmanAchilasChametzGRA", name: "Sof Zman Achilas Chametz GRA" },
        { method: "getSofZmanAchilasChametzMGA72Minutes", name: "Sof Zman Achilas Chametz MGA 72 min" },
        { method: "getSofZmanAchilasChametzMGA16Point1Degrees", name: "Sof Zman Achilas Chametz MGA 16.1°" },
        { method: "getSofZmanBiurChametzGRA", name: "Sof Zman Biur Chametz GRA" },
        { method: "getSofZmanBiurChametzMGA72Minutes", name: "Sof Zman Biur Chametz MGA 72 min" },
        { method: "getSofZmanBiurChametzBaalHatanya", name: "Sof Zman Biur Chametz Baal HaTanya" },
        { method: "getCandleLighting", name: "Allumage des bougies Shabbat (18 min avant)" }
    ]
};

// Calculer tous les zmanim
for (const [category, methods] of Object.entries(zmanimCategories)) {
    results.push(`\n## ${category}\n`);
    
    for (const zmanimInfo of methods) {
        totalCount++;
        
        try {
            // Vérifier si la méthode existe
            if (typeof calendar[zmanimInfo.method] !== 'function') {
                results.push(`${totalCount}. **${zmanimInfo.name}** : Méthode non disponible`);
                continue;
            }
            
            // Appeler la méthode
            const result = calendar[zmanimInfo.method]();
            
            // Traiter le résultat selon son type
            if (result && result.isLuxonDateTime) {
                // C'est un DateTime de Luxon
                const formatted = formatTime(result);
                if (formatted !== "N/A" && formatted !== "Date invalide") {
                    validCount++;
                }
                results.push(`${totalCount}. **${zmanimInfo.name}** : ${formatted}`);
            } else if (result instanceof Date) {
                const formatted = formatTime(result);
                if (formatted !== "N/A" && formatted !== "Date invalide") {
                    validCount++;
                }
                results.push(`${totalCount}. **${zmanimInfo.name}** : ${formatted}`);
            } else if (typeof result === 'number' && result > 0) {
                // C'est probablement une durée en millisecondes
                const formatted = formatDuration(result);
                if (formatted !== "N/A") {
                    validCount++;
                }
                results.push(`${totalCount}. **${zmanimInfo.name}** : ${formatted}`);
            } else {
                results.push(`${totalCount}. **${zmanimInfo.name}** : N/A`);
            }
            
        } catch (error) {
            console.error(`Erreur avec ${zmanimInfo.method}:`, error.message);
            results.push(`${totalCount}. **${zmanimInfo.name}** : Erreur - ${error.message}`);
        }
    }
}

// Créer le document Markdown final
const markdown = `# Liste Complète des ${totalCount} Zmanim pour le 13 Septembre 2025

## 📍 Informations de localisation
- **Date** : Samedi 13 septembre 2025 (Shabbat)
- **Coordonnées** : ${latitude}°N, ${longitude}°E
- **Élévation** : ${elevation}m
- **Fuseau horaire** : ${timezone}

## 📊 Statistiques
- **Total de méthodes testées** : ${totalCount}
- **Méthodes avec résultats valides** : ${validCount}
- **Taux de succès** : ${((validCount/totalCount)*100).toFixed(1)}%
- **Bibliothèque utilisée** : KosherZmanim v0.9.0

## ⭐ Légende
Les méthodes marquées avec ⭐ sont recommandées pour leur haute précision selon l'analyse comparative avec le calendrier עתים לבינה.

---
${results.join('\n')}

---

## 📝 Notes importantes

### Heures Saisonnières (Shaot Zmaniyot)
Les valeurs affichées en format "Xh Ym Zs" représentent la durée d'une heure saisonnière, qui est calculée comme 1/12 du jour (du lever au coucher) ou de la nuit selon la méthode utilisée.

### Méthodes recommandées pour une précision optimale

#### Horaires critiques (précision ≤ 30 secondes)
- **Alot 90 min** → Utiliser \`getAlos19Point8Degrees()\`
- **Alot 72 min** → Utiliser \`getAlos16Point1Degrees()\`  
- **Misheyakir** → Utiliser \`getMisheyakir11Point5Degrees()\`
- **Lever** → Utiliser \`getSeaLevelSunrise()\`
- **Shema GRA** → Utiliser \`getSofZmanShmaGRA()\`
- **Shema MGA 90** → Utiliser \`getSofZmanShmaMGA19Point8Degrees()\`
- **Shema MGA 72** → Utiliser \`getSofZmanShmaMGA16Point1Degrees()\`
- **Tefila GRA** → Utiliser \`getSofZmanTfilaBaalHatanya()\`
- **Tefila MGA 90** → Utiliser \`getSofZmanTfilaMGA19Point8Degrees()\`
- **Tefila MGA 72** → Utiliser \`getSofZmanTfilaMGA72MinutesZmanis()\`
- **Mincha Gedola** → Utiliser \`getMinchaGedola30Minutes()\`
- **Coucher** → Utiliser \`getSeaLevelSunset()\`
- **Tzait RT** → Utiliser \`getTzais72()\`

### Variations selon les communautés
- **Ashkénazes** : Utilisent généralement les méthodes GRA
- **Séfarades** : Préfèrent souvent les calculs basés sur les degrés
- **Hassidim** : Suivent fréquemment les opinions du Baal HaTanya
- **Ateret Torah** : Méthode spécifique à certaines communautés américaines

### Facteurs d'influence
1. **Élévation** : Affecte directement les horaires de lever et coucher
2. **Réfraction atmosphérique** : Prise en compte dans les calculs au niveau de la mer
3. **Saison** : Les durées des heures saisonnières varient selon la période de l'année
4. **Latitude** : Plus on s'éloigne de l'équateur, plus les variations saisonnières sont importantes

---

*Document généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*
*Pour les coordonnées ${latitude}°N, ${longitude}°E*
`;

// Sauvegarder le fichier
const outputPath = path.join(__dirname, '..', 'documentation', 'ZMANIM-COMPLET-180-METHODES-13-09-2025.md');
fs.writeFileSync(outputPath, markdown);

console.log(`\n✅ Document créé avec succès !`);
console.log(`📁 Fichier : ${outputPath}`);
console.log(`📊 Résumé : ${validCount}/${totalCount} zmanim calculés avec succès`);
console.log(`📍 Pour : ${latitude}°N, ${longitude}°E le 13/09/2025`);