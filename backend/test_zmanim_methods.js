const KosherZmanim = require('kosher-zmanim');
const { ComplexZmanimCalendar, GeoLocation } = KosherZmanim;

const location = new GeoLocation(
  'Jerusalem',
  31.765253810009863,
  35.174672210258755,
  754,
  'Asia/Jerusalem'
);

const calendar = new ComplexZmanimCalendar(location);
const date = new Date('2025-09-09');
calendar.setDate(date);

function formatTime(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return hours + ':' + minutes + ':' + seconds;
  } catch (e) {
    return 'N/A';
  }
}

console.log('=== ALOT HASHACHAR (cible: 4:48) ===');
console.log('90 minutes:', formatTime(calendar.getAlos90()));
console.log('90 Zmanis:', formatTime(calendar.getAlos90Zmanis()));
console.log('96 minutes:', formatTime(calendar.getAlos96()));
console.log('96 Zmanis:', formatTime(calendar.getAlos96Zmanis()));
console.log('120 minutes:', formatTime(calendar.getAlos120()));
console.log('120 Zmanis:', formatTime(calendar.getAlos120Zmanis()));
console.log('16.1°:', formatTime(calendar.getAlos16Point1Degrees()));
console.log('18°:', formatTime(calendar.getAlos18Degrees()));
console.log('19.8°:', formatTime(calendar.getAlos19Point8Degrees()));
console.log('26°:', formatTime(calendar.getAlos26Degrees()));
console.log('Baal HaTanya:', formatTime(calendar.getAlosBaalHatanya()));

console.log('\n=== ALOT 72 MINUTES (cible: 5:06) ===');
console.log('72 Zmanis:', formatTime(calendar.getAlos72Zmanis()));
console.log('60 minutes:', formatTime(calendar.getAlos60()));

console.log('\n=== SOF ZMAN SHEMA MGA (cible 90: 8:42, cible 72: 8:51) ===');
console.log('MGA base:', formatTime(calendar.getSofZmanShmaMGA()));
console.log('MGA 72 min:', formatTime(calendar.getSofZmanShmaMGA72Minutes()));
console.log('MGA 72 Zmanis:', formatTime(calendar.getSofZmanShmaMGA72MinutesZmanis()));
console.log('MGA 90 min:', formatTime(calendar.getSofZmanShmaMGA90Minutes()));
console.log('MGA 90 Zmanis:', formatTime(calendar.getSofZmanShmaMGA90MinutesZmanis()));
console.log('MGA 96 min:', formatTime(calendar.getSofZmanShmaMGA96Minutes()));
console.log('MGA 96 Zmanis:', formatTime(calendar.getSofZmanShmaMGA96MinutesZmanis()));
console.log('MGA 120 min:', formatTime(calendar.getSofZmanShmaMGA120Minutes()));
console.log('MGA 16.1°:', formatTime(calendar.getSofZmanShmaMGA16Point1Degrees()));
console.log('MGA 18°:', formatTime(calendar.getSofZmanShmaMGA18Degrees()));
console.log('MGA 19.8°:', formatTime(calendar.getSofZmanShmaMGA19Point8Degrees()));
console.log('Baal HaTanya:', formatTime(calendar.getSofZmanShmaBaalHatanya()));
console.log('Ateret Torah:', formatTime(calendar.getSofZmanShmaAteretTorah()));

console.log('\n=== SOF ZMAN TEFILA MGA (cible 90: 10:00, cible 72: 10:06) ===');
console.log('MGA base:', formatTime(calendar.getSofZmanTfilaMGA()));
console.log('MGA 72 min:', formatTime(calendar.getSofZmanTfilaMGA72Minutes()));
console.log('MGA 72 Zmanis:', formatTime(calendar.getSofZmanTfilaMGA72MinutesZmanis()));
console.log('MGA 90 min:', formatTime(calendar.getSofZmanTfilaMGA90Minutes()));
console.log('MGA 90 Zmanis:', formatTime(calendar.getSofZmanTfilaMGA90MinutesZmanis()));
console.log('MGA 96 min:', formatTime(calendar.getSofZmanTfilaMGA96Minutes()));
console.log('MGA 96 Zmanis:', formatTime(calendar.getSofZmanTfilaMGA96MinutesZmanis()));
console.log('MGA 120 min:', formatTime(calendar.getSofZmanTfilaMGA120Minutes()));
console.log('MGA 16.1°:', formatTime(calendar.getSofZmanTfilaMGA16Point1Degrees()));
console.log('MGA 18°:', formatTime(calendar.getSofZmanTfilaMGA18Degrees()));
console.log('MGA 19.8°:', formatTime(calendar.getSofZmanTfilaMGA19Point8Degrees()));
console.log('Baal HaTanya:', formatTime(calendar.getSofZmanTfilaBaalHatanya()));
console.log('Ateret Torah:', formatTime(calendar.getSofZmanTfilaAteretTorah()));

console.log('\n=== MINCHA KETANA (cible: 16:15 / 4:15 PM) ===');
const sunrise = calendar.getSunrise();
const sunset = calendar.getSunset();
console.log('Standard:', formatTime(calendar.getMinchaKetana(sunrise, sunset)));
console.log('72 minutes:', formatTime(calendar.getMinchaKetana72Minutes()));
console.log('16.1°:', formatTime(calendar.getMinchaKetana16Point1Degrees()));
console.log('Ateret Torah:', formatTime(calendar.getMinchaKetanaAteretTorah()));
console.log('Baal HaTanya:', formatTime(calendar.getMinchaKetanaBaalHatanya()));
console.log('GRA Fixed:', formatTime(calendar.getMinchaKetanaGRAFixedLocalChatzosToSunset()));

console.log('\n=== PLAG HAMINCHA (cible: 17:34 / 5:34 PM) ===');
console.log('Standard:', formatTime(calendar.getPlagHamincha(sunrise, sunset)));
console.log('60 min:', formatTime(calendar.getPlagHamincha60Minutes()));
console.log('72 min:', formatTime(calendar.getPlagHamincha72Minutes()));
console.log('72 Zmanis:', formatTime(calendar.getPlagHamincha72MinutesZmanis()));
console.log('90 min:', formatTime(calendar.getPlagHamincha90Minutes()));
console.log('90 Zmanis:', formatTime(calendar.getPlagHamincha90MinutesZmanis()));
console.log('96 min:', formatTime(calendar.getPlagHamincha96Minutes()));
console.log('96 Zmanis:', formatTime(calendar.getPlagHamincha96MinutesZmanis()));
console.log('120 min:', formatTime(calendar.getPlagHamincha120Minutes()));
console.log('120 Zmanis:', formatTime(calendar.getPlagHamincha120MinutesZmanis()));
console.log('16.1°:', formatTime(calendar.getPlagHamincha16Point1Degrees()));
console.log('18°:', formatTime(calendar.getPlagHamincha18Degrees()));
console.log('19.8°:', formatTime(calendar.getPlagHamincha19Point8Degrees()));
console.log('26°:', formatTime(calendar.getPlagHamincha26Degrees()));
console.log('Ateret Torah:', formatTime(calendar.getPlagHaminchaAteretTorah()));
console.log('Baal HaTanya:', formatTime(calendar.getPlagHaminchaBaalHatanya()));
console.log('GRA Fixed:', formatTime(calendar.getPlagHaminchaGRAFixedLocalChatzosToSunset()));
console.log('Alos to Sunset:', formatTime(calendar.getPlagAlosToSunset()));
console.log('Alos 16.1 to Tzais:', formatTime(calendar.getPlagAlos16Point1ToTzaisGeonim7Point083Degrees()));