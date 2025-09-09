const KosherZmanim = require('kosher-zmanim');
const { ComplexZmanimCalendar, GeoLocation } = KosherZmanim;

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

// Fonction pour calculer la différence en secondes
function diffInSeconds(time1, time2) {
  if (!time1 || !time2) return null;
  const [h1, m1, s1] = time1.split(':').map(Number);
  const [h2, m2, s2] = time2.split(':').map(Number);
  const total1 = h1 * 3600 + m1 * 60 + s1;
  const total2 = h2 * 3600 + m2 * 60 + s2;
  return total1 - total2;
}

console.log('=== COMPARAISON DES COORDONNÉES POUR LE 9 SEPTEMBRE 2025 ===\n');

// Anciennes coordonnées (plus précises)
const oldLocation = new GeoLocation(
  'Jerusalem Old',
  31.765253810009863,
  35.174672210258755,
  754,
  'Asia/Jerusalem'
);

// Nouvelles coordonnées
const newLocation = new GeoLocation(
  'Jerusalem New',
  31.7651178,
  35.1746176,
  754,
  'Asia/Jerusalem'
);

const date = new Date('2025-09-09');

// Valeurs cibles du tableau
const targets = {
  'עלות השחר 90': '04:48:00',
  'עלות השחר 72': '05:06:00',
  'ציצית ותפילין': '05:28:00',
  'הנץ במישור': '06:20:00',
  'סוזק"ש מג"א 90': '08:42:00',
  'סוזק"ש מג"א 72': '08:51:00',
  'סוזק"ש גר"א': '09:28:00',
  'סוזת"פ מג"א 90': '10:00:00',
  'סוזת"פ מג"א 72': '10:06:00',
  'סוזת"פ גר"א': '10:30:00',
  'חצות': '12:36:00',
  'מנחה גדולה': '13:07:00',
  'מנחה קטנה': '16:15:00',
  'פלג המנחה': '17:34:00',
  'שקיעה במישור': '18:52:30',
  'צאה"כ ר"ת': '20:05:00'
};

// Calculer avec les deux sets de coordonnées
const oldCal = new ComplexZmanimCalendar(oldLocation);
oldCal.setDate(date);

const newCal = new ComplexZmanimCalendar(newLocation);
newCal.setDate(date);

console.log('Coordonnées anciennes: 31.765253810009863, 35.174672210258755');
console.log('Coordonnées nouvelles: 31.7651178, 35.1746176');
console.log('Différence: ~0.00014 degrés latitude, ~0.00005 degrés longitude\n');

// Méthodes optimales identifiées
const methods = [
  { name: 'עלות השחר 90', method: 'getAlos19Point8Degrees', target: '04:48:00' },
  { name: 'עלות השחר 72', method: 'getAlos16Point1Degrees', target: '05:06:00' },
  { name: 'ציצית ותפילין', method: 'getMisheyakir11Point5Degrees', target: '05:28:00' },
  { name: 'הנץ במישור', method: 'getSeaLevelSunrise', target: '06:20:00' },
  { name: 'הנץ רגיל', method: 'getSunrise', target: '06:20:00' },
  { name: 'סוזק"ש מג"א 90', method: 'getSofZmanShmaMGA19Point8Degrees', target: '08:42:00' },
  { name: 'סוזק"ש מג"א 72', method: 'getSofZmanShmaMGA16Point1Degrees', target: '08:51:00' },
  { name: 'סוזק"ש גר"א', method: 'getSofZmanShmaGRA', target: '09:28:00' },
  { name: 'סוזת"פ מג"א 90', method: 'getSofZmanTfilaMGA19Point8Degrees', target: '10:00:00' },
  { name: 'סוזת"פ מג"א 72', method: 'getSofZmanTfilaMGA16Point1Degrees', target: '10:06:00' },
  { name: 'סוזת"פ גר"א', method: 'getSofZmanTfilaBaalHatanya', target: '10:30:00' },
  { name: 'חצות', method: 'getChatzos', target: '12:36:00' },
  { name: 'מנחה גדולה', method: 'getMinchaGedola30Minutes', target: '13:07:00' },
  { name: 'שקיעה במישור', method: 'getSeaLevelSunset', target: '18:52:30' },
  { name: 'שקיעה רגילה', method: 'getSunset', target: '18:57:00' },
  { name: 'צאה"כ ר"ת', method: 'getTzais72', target: '20:05:00' }
];

console.log('COMPARAISON DES HORAIRES:\n');
console.log('Horaire                | Cible    | Anciennes coord. | Nouvelles coord. | Diff ancien | Diff nouveau | Amélioration');
console.log('----------------------|----------|------------------|------------------|-------------|--------------|-------------');

methods.forEach(({ name, method, target }) => {
  const oldTime = formatTime(oldCal[method]());
  const newTime = formatTime(newCal[method]());
  
  const oldDiff = diffInSeconds(oldTime, target);
  const newDiff = diffInSeconds(newTime, target);
  
  const oldDiffStr = oldDiff !== null ? (oldDiff >= 0 ? '+' : '') + oldDiff + 's' : 'N/A';
  const newDiffStr = newDiff !== null ? (newDiff >= 0 ? '+' : '') + newDiff + 's' : 'N/A';
  
  let improvement = '';
  if (oldDiff !== null && newDiff !== null) {
    const improvementSec = Math.abs(oldDiff) - Math.abs(newDiff);
    if (improvementSec > 0) {
      improvement = `✅ -${improvementSec}s`;
    } else if (improvementSec < 0) {
      improvement = `❌ +${Math.abs(improvementSec)}s`;
    } else {
      improvement = '➖ Identique';
    }
  }
  
  const oldStatus = Math.abs(oldDiff) <= 30 ? '✓' : Math.abs(oldDiff) <= 60 ? '?' : '✗';
  const newStatus = Math.abs(newDiff) <= 30 ? '✓' : Math.abs(newDiff) <= 60 ? '?' : '✗';
  
  console.log(`${name.padEnd(20)} | ${target} | ${oldTime} ${oldStatus} | ${newTime} ${newStatus} | ${oldDiffStr.padEnd(11)} | ${newDiffStr.padEnd(12)} | ${improvement}`);
});

// Tester aussi les méthodes standard pour le 9 septembre
console.log('\n\n=== MÉTHODES STANDARD (pour référence) ===\n');

const standardMethods = [
  { name: 'Alot 90 min', method: 'getAlos90', target: '04:48:00' },
  { name: 'Alot 72 min', method: 'getAlos72Zmanis', target: '05:06:00' },
  { name: 'Shema MGA 90', method: 'getSofZmanShmaMGA90Minutes', target: '08:42:00' },
  { name: 'Shema MGA 72', method: 'getSofZmanShmaMGA72Minutes', target: '08:51:00' },
  { name: 'Tefila MGA 90', method: 'getSofZmanTfilaMGA90Minutes', target: '10:00:00' },
  { name: 'Tefila MGA 72', method: 'getSofZmanTfilaMGA72Minutes', target: '10:06:00' }
];

console.log('Méthode              | Cible    | Anciennes coord. | Nouvelles coord. | Diff ancien | Diff nouveau');
console.log('---------------------|----------|------------------|------------------|-------------|-------------');

standardMethods.forEach(({ name, method, target }) => {
  const oldTime = formatTime(oldCal[method]());
  const newTime = formatTime(newCal[method]());
  
  const oldDiff = diffInSeconds(oldTime, target);
  const newDiff = diffInSeconds(newTime, target);
  
  const oldDiffStr = oldDiff !== null ? (oldDiff >= 0 ? '+' : '') + oldDiff + 's' : 'N/A';
  const newDiffStr = newDiff !== null ? (newDiff >= 0 ? '+' : '') + newDiff + 's' : 'N/A';
  
  console.log(`${name.padEnd(20)} | ${target} | ${oldTime} | ${newTime} | ${oldDiffStr.padEnd(11)} | ${newDiffStr}`);
});