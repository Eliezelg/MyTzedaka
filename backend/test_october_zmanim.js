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
const date = new Date('2025-10-09');
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

console.log('=== 9 OCTOBRE 2025 - COMPARAISON AVEC עתים לבינה ===\n');

console.log('ALOT HASHACHAR 90 (cible: 5:09):');
console.log('  90 minutes:', formatTime(calendar.getAlos90()));
console.log('  90 Zmanis:', formatTime(calendar.getAlos90Zmanis()));
console.log('  19.8°:', formatTime(calendar.getAlos19Point8Degrees()));
console.log('  18°:', formatTime(calendar.getAlos18Degrees()));

console.log('\nALOT HASHACHAR 72 (cible: 5:26):');
const sunriseTime = calendar.getSunrise();
if (sunriseTime) {
  const alos72 = new Date(sunriseTime);
  alos72.setMinutes(alos72.getMinutes() - 72);
  console.log('  72 fixes:', formatTime(alos72));
}
console.log('  72 Zmanis:', formatTime(calendar.getAlos72Zmanis()));
console.log('  16.1°:', formatTime(calendar.getAlos16Point1Degrees()));

console.log('\nMISHEYAKIR 11.5° (cible: 5:48):');
console.log('  11.5°:', formatTime(calendar.getMisheyakir11Point5Degrees()));
console.log('  11°:', formatTime(calendar.getMisheyakir11Degrees()));

console.log('\nHANETZ (cible במישור: 6:38:45):');
console.log('  Niveau mer:', formatTime(calendar.getSeaLevelSunrise()));
console.log('  Avec élévation:', formatTime(calendar.getSunrise()));

console.log('\nSOF ZMAN SHEMA MGA 90 (cible: 8:47):');
console.log('  MGA 90:', formatTime(calendar.getSofZmanShmaMGA90Minutes()));
console.log('  MGA 90 Zmanis:', formatTime(calendar.getSofZmanShmaMGA90MinutesZmanis()));
console.log('  MGA 19.8°:', formatTime(calendar.getSofZmanShmaMGA19Point8Degrees()));
console.log('  Ateret Torah:', formatTime(calendar.getSofZmanShmaAteretTorah()));

console.log('\nSOF ZMAN SHEMA MGA 72 (cible: 8:56):');
console.log('  MGA 72:', formatTime(calendar.getSofZmanShmaMGA72Minutes()));
console.log('  MGA 72 Zmanis:', formatTime(calendar.getSofZmanShmaMGA72MinutesZmanis()));

console.log('\nSOF ZMAN SHEMA GRA (cible: 9:32):');
console.log('  GRA:', formatTime(calendar.getSofZmanShmaGRA()));

console.log('\nSOF ZMAN TEFILA MGA 90 (cible: 10:00):');
console.log('  MGA 90:', formatTime(calendar.getSofZmanTfilaMGA90Minutes()));
console.log('  MGA 90 Zmanis:', formatTime(calendar.getSofZmanTfilaMGA90MinutesZmanis()));
console.log('  MGA 19.8°:', formatTime(calendar.getSofZmanTfilaMGA19Point8Degrees()));

console.log('\nSOF ZMAN TEFILA MGA 72 (cible: 10:06):');
console.log('  MGA 72:', formatTime(calendar.getSofZmanTfilaMGA72Minutes()));
console.log('  MGA 72 Zmanis:', formatTime(calendar.getSofZmanTfilaMGA72MinutesZmanis()));

console.log('\nCHATZOT (cible: 12:26):');
console.log('  Chatzot:', formatTime(calendar.getChatzos()));

console.log('\nMINCHA GEDOLA (cible: 12:56):');
console.log('  Standard:', formatTime(calendar.getMinchaGedola()));
console.log('  30 minutes:', formatTime(calendar.getMinchaGedola30Minutes()));

console.log('\nMINCHA KETANA (cible: 15:49 / 3:49 PM):');
const sunrise = calendar.getSunrise();
const sunset = calendar.getSunset();
console.log('  Standard:', formatTime(calendar.getMinchaKetana(sunrise, sunset)));
console.log('  GRA Fixed:', formatTime(calendar.getMinchaKetanaGRAFixedLocalChatzosToSunset()));
console.log('  Baal HaTanya:', formatTime(calendar.getMinchaKetanaBaalHatanya()));

console.log('\nPLAG HAMINCHA (cible: 17:01 / 5:01 PM):');
console.log('  Standard:', formatTime(calendar.getPlagHamincha(sunrise, sunset)));
console.log('  GRA Fixed:', formatTime(calendar.getPlagHaminchaGRAFixedLocalChatzosToSunset()));
console.log('  Ateret Torah:', formatTime(calendar.getPlagHaminchaAteretTorah()));

console.log('\nSHKIA (cible במישור: 6:13:45 PM):');
console.log('  Niveau mer:', formatTime(calendar.getSeaLevelSunset()));
console.log('  Avec élévation:', formatTime(calendar.getSunset()));

console.log('\nTZEIT 6.45° (cible: 6:40 PM):');
console.log('  6.45°:', formatTime(calendar.getTzaisGeonim6Point45Degrees()));
console.log('  5.95°:', formatTime(calendar.getTzaisGeonim5Point95Degrees()));

console.log('\nTZEIT 20 MIN (cible: 6:33 PM):');
const sunset20 = calendar.getSunset();
if (sunset20) {
  const tzeis20 = new Date(sunset20);
  tzeis20.setMinutes(tzeis20.getMinutes() + 20);
  console.log('  20 min après coucher:', formatTime(tzeis20));
}

console.log('\nTZEIT RT 72 (cible: 7:25 PM):');
console.log('  72 minutes:', formatTime(calendar.getTzais72()));

console.log('\nCHATZOT LAYLA (cible: 12:26 AM):');
console.log('  Minuit:', formatTime(calendar.getMidnightTonight()));