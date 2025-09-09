const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TENANT_ID = 'e1131e29-1cea-4048-a7b2-4e8f19fb2271'; // siah tenant ID

const testDate = '2025-10-09'; // Date de test octobre

async function testOptimalZmanim() {
  try {
    console.log('🔍 Test des méthodes optimales de calcul Zmanim');
    console.log('📅 Date de test:', testDate);
    console.log('📍 Lieu: Jérusalem (31.7651178, 35.1746176)');
    console.log('');

    const response = await axios.get(`${API_URL}/tenant/${TENANT_ID}/zmanim/date`, {
      params: { date: testDate },
      headers: { 'X-Tenant-ID': TENANT_ID }
    });

    const zmanim = response.data;
    
    // Horaires de référence עתים לבינה pour le 9.10.25
    const reference = {
      alotHaShachar_90: '5:08',
      alotHaShachar_72: '5:25',
      misheyakir_11_5: '5:39',
      hanetzMishor: '6:35',
      sofZmanShmaGRA: '9:36',
      sofZmanShmaMGA90: '9:13',
      sofZmanShmaMGA72: '9:24',
      sofZmanTefilaGRA: '10:29',
      sofZmanTefilaMGA90: '10:14',
      sofZmanTefilaMGA72: '10:23',
      chatzot: '12:29',
      minchaGedola: '12:59',
      minchaKetana: '15:57',
      plagHaMincha: '16:58',
      shkiaMishor: '18:22',
      tzeitHakochavim_18: '18:49',
      tzeitHakochavim_13: '18:58',
      tzeitHakochavim_72: '19:34'
    };

    console.log('📊 Comparaison avec עתים לבינה :');
    console.log('');
    console.log('Horaire                | API       | עתים לבינה | Différence');
    console.log('----------------------|-----------|------------|------------');
    
    Object.entries(reference).forEach(([key, refTime]) => {
      const apiTime = zmanim[key];
      if (apiTime) {
        const diff = calculateTimeDifference(apiTime, refTime);
        const emoji = Math.abs(diff) <= 30 ? '✅' : Math.abs(diff) <= 60 ? '⚠️' : '❌';
        console.log(`${key.padEnd(21)} | ${apiTime.padEnd(9)} | ${refTime.padEnd(10)} | ${formatDifference(diff)} ${emoji}`);
      }
    });

    // Afficher aussi les méthodes alternatives disponibles
    console.log('\n📝 Méthodes alternatives disponibles :');
    if (zmanim.hanetzHaChama) console.log(`hanetzHaChama (avec élévation): ${zmanim.hanetzHaChama}`);
    if (zmanim.shkiatHaChama) console.log(`shkiatHaChama (avec élévation): ${zmanim.shkiatHaChama}`);

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

function calculateTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  return minutes1 - minutes2;
}

function formatDifference(diff) {
  const sign = diff >= 0 ? '+' : '';
  if (Math.abs(diff) < 60) {
    return `${sign}${diff}s`;
  } else {
    const minutes = Math.floor(Math.abs(diff) / 60);
    const seconds = Math.abs(diff) % 60;
    return `${sign}${diff < 0 ? '-' : ''}${minutes}m${seconds}s`;
  }
}

testOptimalZmanim();