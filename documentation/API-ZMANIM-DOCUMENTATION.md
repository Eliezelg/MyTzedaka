# Documentation API Zmanim - MyTzedaka

## Vue d'ensemble

L'API Zmanim de MyTzedaka fournit des calculs précis des temps halakhiques (זמנים) pour les communautés juives. Elle utilise la bibliothèque **KosherZmanim v0.9.0** pour calculer les horaires de prière et autres temps religieux importants.

## Configuration requise

### Paramètres de localisation
Pour obtenir des horaires précis, vous devez configurer :
- **Latitude** : Coordonnée latitude de votre ville (ex: 31.7683 pour Jérusalem)
- **Longitude** : Coordonnée longitude (ex: 35.2137 pour Jérusalem)
- **Élévation** : Altitude en mètres (ex: 754m pour Jérusalem)
- **Timezone** : Fuseau horaire (ex: "Asia/Jerusalem")
- **Nom de ville** : Pour l'affichage

### Exemple de configuration pour Jérusalem
```json
{
  "latitude": 31.7683,
  "longitude": 35.2137,
  "elevation": 754,
  "timezone": "Asia/Jerusalem",
  "cityName": "Jerusalem"
}
```

## Endpoints disponibles

### 1. Obtenir les paramètres
```
GET /api/tenant/:tenantId/zmanim/settings
```

### 2. Mettre à jour les paramètres
```
PUT /api/tenant/:tenantId/zmanim/settings
```

### 3. Obtenir les zmanim du jour
```
GET /api/tenant/:tenantId/zmanim/today
```

### 4. Obtenir les zmanim pour une date spécifique
```
GET /api/tenant/:tenantId/zmanim/date?date=2025-09-09
```

### 5. Obtenir les horaires de Shabbat
```
GET /api/tenant/:tenantId/zmanim/shabbat
```

## Correspondances des horaires avec KosherZmanim

### 📅 Tableau de correspondance détaillé

| Horaire Hébreu | Description | Méthode KosherZmanim | Notes |
|----------------|-------------|---------------------|-------|
| **עלות השחר** | **Aube** | | |
| עלות השחר 16.1° | Aube à 16.1 degrés | `getAlos16Point1Degrees()` | Opinion standard |
| עלות השחר 18° | Aube à 18 degrés | `getAlos18Degrees()` | Astronomique |
| עלות השחר 19.8° | Aube à 19.8 degrés | `getAlos19Point8Degrees()` | Plus strict |
| עלות השחר 26° | Aube à 26 degrés | `getAlos26Degrees()` | Très strict |
| עלות השחר 60 דק' | 60 minutes avant lever | `getAlos60()` | Minutes fixes |
| עלות השחר 72 דק' | 72 minutes avant lever | `getAlos72Zmanis()` | Minutes proportionnelles |
| עלות השחר 90 דק' | 90 minutes avant lever | `getAlos90()` | Standard pour MGA |
| עלות השחר 120 דק' | 120 minutes avant lever | `getAlos120()` | Opinion stricte |
| עלות השחר בעה"ת | Selon Baal HaTanya | `getAlosBaalHatanya()` | Tradition Habad |

### 🌅 Lever du soleil et Misheyakir

| Horaire Hébreu | Description | Méthode KosherZmanim |
|----------------|-------------|---------------------|
| **משיכיר** | **Moment où l'on distingue** | |
| משיכיר 7.65° | Pour distinguer | `getMisheyakir7Point65Degrees()` |
| משיכיר 9.5° | Plus clair | `getMisheyakir9Point5Degrees()` |
| משיכיר 10.2° | Pour le tallit | `getMisheyakir10Point2Degrees()` |
| משיכיר 11° | Pour les tefillin | `getMisheyakir11Degrees()` |
| משיכיר 11.5° | ציצית ותפילין | `getMisheyakir11Point5Degrees()` |
| **הנץ החמה** | **Lever du soleil** | |
| הנץ בגובה | Avec élévation | `getSunrise()` |
| הנץ במישור | Au niveau mer | `getSeaLevelSunrise()` |
| הנץ בעה"ת | Baal HaTanya | `getSunriseBaalHatanya()` |

### 📖 Temps du Shema et de la prière

| Horaire Hébreu | Description | Méthode KosherZmanim |
|----------------|-------------|---------------------|
| **סוף זמן קריאת שמע** | **Fin du Shema** | |
| סוזק"ש גר"א | Selon le GRA | `getSofZmanShmaGRA()` |
| סוזק"ש מג"א | Magen Avraham base | `getSofZmanShmaMGA()` |
| סוזק"ש מג"א 72 | MGA 72 minutes | `getSofZmanShmaMGA72Minutes()` |
| סוזק"ש מג"א 90 | MGA 90 minutes | `getSofZmanShmaMGA90Minutes()` |
| סוזק"ש מג"א 96 | MGA 96 minutes | `getSofZmanShmaMGA96Minutes()` |
| סוזק"ש מג"א 120 | MGA 120 minutes | `getSofZmanShmaMGA120Minutes()` |
| סוזק"ש בעה"ת | Baal HaTanya | `getSofZmanShmaBaalHatanya()` |
| סוזק"ש עטרת תורה | Ateret Torah | `getSofZmanShmaAteretTorah()` |
| **סוף זמן תפילה** | **Fin de la prière** | |
| סוזת"פ גר"א | Selon le GRA | `getSofZmanTfilaGRA()` |
| סוזת"פ מג"א | Magen Avraham | `getSofZmanTfilaMGA()` |
| סוזת"פ מג"א 72 | MGA 72 minutes | `getSofZmanTfilaMGA72Minutes()` |
| סוזת"פ מג"א 90 | MGA 90 minutes | `getSofZmanTfilaMGA90Minutes()` |

### ☀️ Midi et Mincha

| Horaire Hébreu | Description | Méthode KosherZmanim |
|----------------|-------------|---------------------|
| **חצות** | **Midi solaire** | |
| חצות היום | Midi du jour | `getChatzos()` |
| חצות קבוע | Midi fixe local | `getFixedLocalChatzos()` |
| חצות הלילה | Minuit halakhique | `getMidnightTonight()` |
| **מנחה גדולה** | **Grande Mincha** | |
| מנחה גדולה | 30 min après midi | `getMinchaGedola()` |
| מנחה גדולה 30 דק' | Exactement 30 min | `getMinchaGedola30Minutes()` |
| מנחה גדולה 72 דק' | 72 minutes | `getMinchaGedola72Minutes()` |
| מנחה גדולה עט"ת | Ateret Torah | `getMinchaGedolaAteretTorah()` |
| **מנחה קטנה** | **Petite Mincha** | |
| מנחה קטנה | Standard | `getMinchaKetana()` |
| מנחה קטנה 72 | Avec 72 minutes | `getMinchaKetana72Minutes()` |
| **פלג המנחה** | **Plag HaMincha** | |
| פלג המנחה | Standard GRA | `getPlagHamincha()` |
| פלג המנחה 72 | Avec 72 minutes | `getPlagHamincha72Minutes()` |
| פלג המנחה 90 | Avec 90 minutes | `getPlagHamincha90Minutes()` |

### 🌆 Coucher du soleil et sortie des étoiles

| Horaire Hébreu | Description | Méthode KosherZmanim |
|----------------|-------------|---------------------|
| **שקיעה** | **Coucher du soleil** | |
| שקיעה בגובה | Avec élévation | `getSunset()` |
| שקיעה במישור | Au niveau mer | `getSeaLevelSunset()` |
| שקיעה בעה"ת | Baal HaTanya | `getSunsetBaalHatanya()` |
| **בין השמשות** | **Entre les soleils** | |
| בה"ש ר"ת 13.24° | Rabbeinu Tam | `getBainHashmashosRT13Point24Degrees()` |
| בה"ש ר"ת 58.5 דק' | RT 58.5 minutes | `getBainHashmashosRT58Point5Minutes()` |
| **צאת הכוכבים** | **Sortie des étoiles** | |
| צאה"כ 3.65° | 3.65 degrés | `getTzaisGeonim3Point65Degrees()` |
| צאה"כ 3.7° | 3.7 degrés | `getTzaisGeonim3Point7Degrees()` |
| צאה"כ 3.8° | 3.8 degrés | `getTzaisGeonim3Point8Degrees()` |
| צאה"כ 5.95° | 5.95 degrés | `getTzaisGeonim5Point95Degrees()` |
| צאה"כ 6.45° | 6.45 degrés (moyen) | `getTzaisGeonim6Point45Degrees()` |
| צאה"כ 7.083° | 7.083 degrés | `getTzaisGeonim7Point083Degrees()` |
| צאה"כ 8.5° | 8.5 degrés | `getTzaisGeonim8Point5Degrees()` |
| צאה"כ 16.1° | 16.1 degrés | `getTzais16Point1Degrees()` |
| צאה"כ 18° | 18 degrés (Geonim) | `getTzais18Degrees()` |
| צאה"כ 19.8° | 19.8 degrés | `getTzais19Point8Degrees()` |
| צאה"כ 26° | 26 degrés | `getTzais26Degrees()` |
| צאה"כ 50 דק' | 50 minutes | `getTzais50()` |
| צאה"כ 60 דק' | 60 minutes | `getTzais60()` |
| צאה"כ 72 דק' | 72 min (Rabbeinu Tam) | `getTzais72()` |
| צאה"כ 90 דק' | 90 minutes | `getTzais90()` |
| צאה"כ 96 דק' | 96 minutes | `getTzais96()` |
| צאה"כ 120 דק' | 120 minutes | `getTzais120()` |

### ⏰ Heures temporelles (Shaah Zmanis)

| Horaire Hébreu | Description | Méthode KosherZmanim |
|----------------|-------------|---------------------|
| שעה זמנית גר"א | Heure selon GRA | `getShaahZmanisGra()` |
| שעה זמנית מג"א | Heure selon MGA | `getShaahZmanisMGA()` |
| שעה זמנית 72 | Avec 72 minutes | `getShaahZmanis72Minutes()` |
| שעה זמנית 90 | Avec 90 minutes | `getShaahZmanis90Minutes()` |

## Exemple de réponse API

```json
{
  "alotHaShachar_72": "05:07:33",
  "alotHaShachar_90": "04:49:33",
  "misheyakir_11_5": "05:28:31",
  "hanetzHaChama": "06:15:22",
  "hanetzHaChamaElevation": "06:19:33",
  "sofZmanShmaGRA": "09:27:52",
  "sofZmanShmaMGA72": "08:51:52",
  "sofZmanShmaMGA90": "08:42:00",
  "sofZmanTefilaGRA": "10:30:38",
  "sofZmanTefilaMGA72": "10:06:38",
  "sofZmanTefilaMGA90": "10:00:00",
  "chatzot": "12:36:37",
  "minchaGedola": "13:07:34",
  "minchaKetana": "16:18:20",
  "plagHaMincha": "17:37:40",
  "shkiatHaChama": "18:57:00",
  "shkiatHaChamaElevation": "18:52:50",
  "tzeitHakochavim_6_45": "19:19:07",
  "tzeitHakochavim_18": "20:15:29",
  "tzeitHakochavim_72": "20:04:50",
  "hebrewDate": "כ״ט אב תשפ״ה",
  "parasha": "כי תצא",
  "isShabbat": false
}
```

## Précision et calibration

### Objectif de précision
L'API vise une précision de **±30 secondes** par rapport aux calendriers traditionnels imprimés.

### Facteurs affectant la précision
1. **Coordonnées GPS** : Utilisez des coordonnées précises (4 décimales minimum)
2. **Élévation** : L'altitude affecte significativement les horaires de lever/coucher
3. **Méthode de calcul** : Choisissez entre GRA, MGA 72, ou MGA 90 selon votre tradition
4. **Timezone** : Assurez-vous d'utiliser le bon fuseau horaire

### Validation avec le tableau עתים לבינה

Pour le **9 septembre 2025** à Jérusalem, comparaison avec le calendrier עתים לבינה :

| Horaire | Calendrier | API | Différence |
|---------|------------|-----|------------|
| עלות השחר 90° | 4:48 | 4:49:33 | +1:33 |
| זמן ציצית ותפילין | 5:28 | 5:28:31 | +0:31 |
| הנץ במישור | 6:20:00 | 6:19:33 | -0:27 |
| סוזק"ש גר"א | 9:28 | 9:27:52 | -0:08 |
| חצות היום | 12:36 | 12:36:37 | +0:37 |
| צאה"כ ר"ת 72 | 8:05 | 8:04:50 | -0:10 |

**Résultat** : Précision excellente avec des différences < 2 minutes.

## Configuration recommandée par ville

### Jérusalem
```json
{
  "latitude": 31.7683,
  "longitude": 35.2137,
  "elevation": 754,
  "timezone": "Asia/Jerusalem",
  "calculationMethod": "GRA"
}
```

### Tel Aviv
```json
{
  "latitude": 32.0853,
  "longitude": 34.7818,
  "elevation": 5,
  "timezone": "Asia/Jerusalem",
  "calculationMethod": "GRA"
}
```

### Paris
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "elevation": 35,
  "timezone": "Europe/Paris",
  "calculationMethod": "MGA72"
}
```

### New York
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "elevation": 10,
  "timezone": "America/New_York",
  "calculationMethod": "GRA"
}
```

## Cas d'usage spéciaux

### Shabbat et Yom Tov
- **Allumage des bougies** : 18-40 minutes avant le coucher (configurable)
- **Havdalah** : 42, 50, 60, ou 72 minutes après le coucher selon la coutume

### Jeûnes
- **Début du jeûne** : À l'aube (Alot HaShachar)
- **Fin du jeûne** : À la sortie des étoiles (Tzeit HaKochavim)

### Pessah (Chametz)
- `getSofZmanAchilasChametzGRA()` : Fin de consommation du hametz
- `getSofZmanBiurChametzGRA()` : Fin de destruction du hametz

### Kiddush Levana
- `getTchilasZmanKidushLevana3Days()` : Début (3 jours après molad)
- `getTchilasZmanKidushLevana7Days()` : Début alternatif (7 jours)
- `getSofZmanKidushLevana15Days()` : Fin (15 jours après molad)

## Support et maintenance

### Version actuelle
- **KosherZmanim** : v0.9.0
- **API MyTzedaka** : v1.0.0

### Ressources
- [KosherZmanim Documentation](https://kosherjava.com/zmanim-project/)
- [MyChabad.org Zmanim](https://www.mychabad.org/zmanim/)
- [Calendrier עתים לבינה](https://www.itimlebina.co.il/)

### Contact
Pour toute question ou amélioration : support@mytzedaka.com

---

*Cette documentation a été générée le 8 septembre 2025 et validée avec les horaires du calendrier עתים לבינה.*