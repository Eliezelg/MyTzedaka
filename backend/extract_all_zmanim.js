const KosherZmanim = require('kosher-zmanim');
const { ComplexZmanimCalendar, GeoLocation } = KosherZmanim;

// Configuration pour Jérusalem avec coordonnées précises
const location = new GeoLocation(
  'Jerusalem',
  31.765253810009863,
  35.174672210258755,
  754,
  'Asia/Jerusalem'
);

// Fonction pour formater le temps
function formatTime(date) {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return null;
  }
}

// Fonction pour convertir en minutes depuis minuit
function toMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
}

// Fonction pour calculer la différence en secondes
function diffInSeconds(time1, time2) {
  if (!time1 || !time2) return null;
  const min1 = toMinutes(time1);
  const min2 = toMinutes(time2);
  return Math.round((min1 - min2) * 60);
}

// Test pour le 9 septembre 2025
console.log('=== EXTRACTION COMPLÈTE DES ZMANIM - 9 SEPTEMBRE 2025 ===\n');
const calendar = new ComplexZmanimCalendar(location);
const date = new Date('2025-09-09');
calendar.setDate(date);

// Valeurs cibles du tableau
const targets = {
  'alot90': '04:48:00',
  'alot72': '05:06:00',
  'misheyakir': '05:28:00',
  'hanetzMishor': '06:20:00',
  'shemaMGA90': '08:42:00',
  'shemaMGA72': '08:51:00',
  'shemaGRA': '09:28:00',
  'tefilaMGA90': '10:00:00',
  'tefilaMGA72': '10:06:00',
  'tefilaGRA': '10:30:00',
  'chatzot': '12:36:00',
  'minchaGedola': '13:07:00',
  'minchaKetana': '16:15:00',
  'plagHamincha': '17:34:00',
  'shkiaMishor': '18:52:30',
  'tzeitGeonim18': '19:10:00',
  'tzeitBenonit': '19:19:00',
  'tzeitRT': '20:05:00'
};

// Obtenir toutes les méthodes get*
const proto = Object.getPrototypeOf(calendar);
const methods = Object.getOwnPropertyNames(proto)
  .filter(m => m.startsWith('get') && typeof calendar[m] === 'function')
  .filter(m => !['getClassName', 'getDate', 'getLocation', 'getAteretTorahSunsetOffset', 
                'getFixedLocalChatzosBasedZmanim', 'getMoladBasedTime', 'getZmanisBasedOffset'].includes(m));

// Pour stocker les résultats
const results = {};

// Variables pour les calculs custom
const sunrise = calendar.getSunrise();
const sunset = calendar.getSunset();
const seaLevelSunrise = calendar.getSeaLevelSunrise();
const seaLevelSunset = calendar.getSeaLevelSunset();

// Exécuter chaque méthode et capturer le résultat
methods.forEach(method => {
  try {
    let result;
    // Certaines méthodes nécessitent des paramètres
    if (method.includes('MinchaKetana') || method.includes('PlagHamincha')) {
      if (method.includes('GRAFixedLocalChatzosToSunset')) {
        result = calendar[method]();
      } else if (sunrise && sunset) {
        result = calendar[method](sunrise, sunset);
      } else {
        result = calendar[method]();
      }
    } else {
      result = calendar[method]();
    }
    
    const formattedTime = formatTime(result);
    if (formattedTime) {
      results[method] = formattedTime;
    }
  } catch (e) {
    // Ignorer les erreurs silencieusement
  }
});

// Ajouter des calculs manuels
if (sunrise) {
  const sunrise60 = new Date(sunrise);
  sunrise60.setMinutes(sunrise60.getMinutes() - 60);
  results['custom_sunrise_minus_60'] = formatTime(sunrise60);
  
  const sunrise72 = new Date(sunrise);
  sunrise72.setMinutes(sunrise72.getMinutes() - 72);
  results['custom_sunrise_minus_72'] = formatTime(sunrise72);
  
  const sunrise90 = new Date(sunrise);
  sunrise90.setMinutes(sunrise90.getMinutes() - 90);
  results['custom_sunrise_minus_90'] = formatTime(sunrise90);
}

if (sunset) {
  const sunset18 = new Date(sunset);
  sunset18.setMinutes(sunset18.getMinutes() + 18);
  results['custom_sunset_plus_18'] = formatTime(sunset18);
  
  const sunset20 = new Date(sunset);
  sunset20.setMinutes(sunset20.getMinutes() + 20);
  results['custom_sunset_plus_20'] = formatTime(sunset20);
  
  const sunset42 = new Date(sunset);
  sunset42.setMinutes(sunset42.getMinutes() + 42);
  results['custom_sunset_plus_42'] = formatTime(sunset42);
  
  const sunset50 = new Date(sunset);
  sunset50.setMinutes(sunset50.getMinutes() + 50);
  results['custom_sunset_plus_50'] = formatTime(sunset50);
  
  const sunset60 = new Date(sunset);
  sunset60.setMinutes(sunset60.getMinutes() + 60);
  results['custom_sunset_plus_60'] = formatTime(sunset60);
  
  const sunset72 = new Date(sunset);
  sunset72.setMinutes(sunset72.getMinutes() + 72);
  results['custom_sunset_plus_72'] = formatTime(sunset72);
  
  const sunset90 = new Date(sunset);
  sunset90.setMinutes(sunset90.getMinutes() + 90);
  results['custom_sunset_plus_90'] = formatTime(sunset90);
}

// Analyser les correspondances
console.log('TOTAL DE MÉTHODES TESTÉES:', Object.keys(results).length);
console.log('\n=== MEILLEURES CORRESPONDANCES PAR HORAIRE ===\n');

Object.entries(targets).forEach(([targetName, targetTime]) => {
  console.log(`\n${targetName.toUpperCase()} (cible: ${targetTime}):`);
  
  // Trouver les 5 meilleures correspondances
  const matches = [];
  Object.entries(results).forEach(([method, time]) => {
    const diff = diffInSeconds(time, targetTime);
    if (diff !== null && Math.abs(diff) < 600) { // Moins de 10 minutes
      matches.push({ method, time, diff });
    }
  });
  
  // Trier par différence absolue
  matches.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));
  
  // Afficher les 5 meilleures
  matches.slice(0, 5).forEach(match => {
    const sign = match.diff >= 0 ? '+' : '';
    const status = Math.abs(match.diff) <= 30 ? '✅' : Math.abs(match.diff) <= 60 ? '⚠️' : '❌';
    console.log(`  ${status} ${match.method}: ${match.time} (${sign}${match.diff}s)`);
  });
  
  if (matches.length === 0) {
    console.log('  ❌ Aucune correspondance proche trouvée');
  }
});

// Afficher toutes les valeurs pour référence
console.log('\n\n=== TOUTES LES VALEURS CALCULÉES ===\n');
const sortedResults = Object.entries(results).sort((a, b) => {
  const timeA = toMinutes(a[1]);
  const timeB = toMinutes(b[1]);
  return (timeA || 0) - (timeB || 0);
});

sortedResults.forEach(([method, time]) => {
  console.log(`${method}: ${time}`);
});