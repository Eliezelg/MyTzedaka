# 📋 PHASE 3 - Frontend Custom Multi-Tenant

## 🎯 Objectif
Créer un système de sites web automatiques et personnalisables pour chaque association/synagogue dans le même projet Next.js (frontend-hub), avec des fonctionnalités spécifiques pour les communautés religieuses.

## 🏗️ Architecture Technique

### 1. **Intégration dans Frontend-Hub**
```
frontend-hub/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Routes hub existantes
│   │   └── sites/              # NOUVEAU: Sites custom
│   │       └── [domain]/       # Routes par domaine/subdomain
│   │           ├── page.tsx
│   │           ├── about/
│   │           ├── campaigns/
│   │           ├── donate/
│   │           ├── zmanim/     # Horaires halakhiques
│   │           ├── prayers/    # Horaires de prières
│   │           ├── courses/    # Planning des cours
│   │           ├── events/
│   │           └── admin/
│   ├── components/
│   │   ├── sites/              # NOUVEAU: Composants sites custom
│   │   │   ├── blocks/         # Blocs réutilisables
│   │   │   ├── jewish/         # Composants judaïques
│   │   │   │   ├── ZmanimWidget.tsx
│   │   │   │   ├── PrayerSchedule.tsx
│   │   │   │   ├── CourseCalendar.tsx
│   │   │   │   ├── ShabbatTimes.tsx
│   │   │   │   └── HebrewDateDisplay.tsx
│   │   │   ├── layout/
│   │   │   └── theme/
│   │   └── [existing]/         # Composants existants réutilisables
```

### 2. **Middleware de Résolution Multi-Tenant**
```typescript
// middleware.ts - Extension du middleware existant
export async function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;
  
  // Détection site custom vs hub
  if (isCustomDomain(hostname) || pathname.startsWith('/sites/')) {
    // Résolution du tenant par domaine/subdomain
    const tenant = await resolveTenant(hostname);
    
    // Injection des données tenant dans les headers
    request.headers.set('x-tenant-id', tenant.id);
    request.headers.set('x-tenant-slug', tenant.slug);
    request.headers.set('x-site-mode', 'custom');
    
    // Rewrite vers /sites/[domain]
    return NextResponse.rewrite(
      new URL(`/sites/${tenant.slug}${pathname}`, request.url)
    );
  }
  
  // Logique hub existante...
}
```

## 📊 Modèles de Données Étendus

### Extension du Schema Prisma

#### Système de Modules Configurables
```prisma
// Configuration des modules/fonctionnalités activés
model TenantModules {
  id          String   @id @default(uuid())
  tenantId    String   @unique
  
  // Modules de base
  donations        Boolean @default(true)   // Système de dons
  campaigns        Boolean @default(true)   // Campagnes de collecte
  events           Boolean @default(true)   // Événements
  blog             Boolean @default(true)   // Blog/Actualités
  gallery          Boolean @default(false)  // Galerie photos
  
  // Modules synagogue
  zmanim           Boolean @default(false)  // Horaires halakhiques
  prayers          Boolean @default(false)  // Horaires de prières
  courses          Boolean @default(false)  // Planning des cours
  hebrewCalendar   Boolean @default(false)  // Calendrier hébraïque
  members          Boolean @default(false)  // Gestion des membres
  
  // Modules avancés
  library          Boolean @default(false)  // Bibliothèque de textes
  yahrzeits        Boolean @default(false)  // Anniversaires de décès
  seatingChart     Boolean @default(false)  // Plan de synagogue
  mikvah           Boolean @default(false)  // Réservation Mikvé
  kashrut          Boolean @default(false)  // Informations cacherout
  eruv             Boolean @default(false)  // Status de l'Erouv
  
  // Modules communautaires
  marketplace      Boolean @default(false)  // Petites annonces
  directory        Boolean @default(false)  // Annuaire communautaire
  chesed           Boolean @default(false)  // Entraide (covoiturage, etc.)
  newsletter       Boolean @default(false)  // Newsletter
  
  // Configuration par module
  modulesConfig    Json    @default("{}")   // Configuration détaillée
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@map("tenant_modules")
}

model SynagogueSettings {
  id          String   @id @default(uuid())
  tenantId    String   @unique
  
  // Localisation pour calculs
  latitude    Decimal  @db.Decimal(10,8)
  longitude   Decimal  @db.Decimal(11,8)
  timezone    String   @default("Europe/Paris")
  city        String
  
  // Configuration des calculs halakhiques
  calculationMethod String @default("MGA") // MGA, GRA, etc.
  customSettings    Json   @default("{}")
  
  // Options d'affichage
  showZmanim       Boolean @default(true)
  showHebrewDate   Boolean @default(true)
  showParasha      Boolean @default(true)
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@map("synagogue_settings")
}

model Prayer {
  id          String   @id @default(uuid())
  tenantId    String
  
  // Informations de base
  name        String   // Shaharit, Minha, Arvit, etc.
  type        PrayerType
  
  // Horaires
  timeMode    TimeMode // FIXED, ZMAN_BASED, CONDITIONAL
  fixedTime   String?  // HH:MM pour horaires fixes
  zmanBased   Json?    // Configuration basée sur zmanim
  conditions  Json?    // Conditions spéciales (ex: été/hiver)
  
  // Lieu
  location    String?  // Salle principale, Beit Midrash, etc.
  roomId      String?
  
  // Récurrence
  recurrence  Json     // Jours de la semaine, exceptions
  
  // Statut
  isActive    Boolean  @default(true)
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  room        Room?    @relation(fields: [roomId], references: [id])
  
  @@map("prayers")
}

model Room {
  id          String   @id @default(uuid())
  tenantId    String
  
  name        String
  capacity    Int?
  description String?
  
  prayers     Prayer[]
  courses     Course[]
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@map("rooms")
}

model Course {
  id          String   @id @default(uuid())
  tenantId    String
  
  // Informations du cours
  title       String
  description String   @db.Text
  rabbi       String?  // Nom du Rav/enseignant
  
  // Planning
  dayOfWeek   Int      // 0-6 (Dimanche-Samedi)
  startTime   String   // HH:MM
  endTime     String   // HH:MM
  
  // Lieu
  roomId      String?
  location    String?  // Si pas de salle spécifique
  
  // Type et niveau
  type        CourseType
  level       CourseLevel
  language    String   @default("fr")
  
  // Options
  isOnline    Boolean  @default(false)
  zoomLink    String?
  
  // Statut
  isActive    Boolean  @default(true)
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  room        Room?    @relation(fields: [roomId], references: [id])
  
  @@map("courses")
}

enum PrayerType {
  SHAHARIT    // Prière du matin
  MINHA       // Prière de l'après-midi
  ARVIT       // Prière du soir
  MOUSSAF     // Prière supplémentaire (Shabbat/fêtes)
  SELICHOT    // Prières de pénitence
  SPECIAL     // Événement spécial
}

enum TimeMode {
  FIXED       // Horaire fixe
  ZMAN_BASED  // Basé sur les zmanim
  CONDITIONAL // Avec conditions
}

enum CourseType {
  TALMUD
  TORAH
  HALAKHA
  MOUSSAR
  HASSIDOUT
  KABBALAH
  HEBREW
  YOUTH
  WOMEN
  OTHER
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}
```

## 🎛️ Interface d'Administration des Modules

### Panneau de Configuration des Modules
```typescript
interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'synagogue' | 'advanced' | 'community';
  icon: string;
  enabled: boolean;
  premium: boolean; // Module payant
  dependencies?: string[]; // Modules requis
  settings?: ModuleSettings;
}

// Page d'administration des modules
<ModulesManager>
  <ModuleCategory title="Modules de Base">
    <ModuleCard 
      module="donations"
      title="Système de Dons"
      description="Collecte de dons avec Stripe"
      enabled={modules.donations}
      onToggle={toggleModule}
    />
    <ModuleCard 
      module="campaigns"
      title="Campagnes"
      description="Créer et gérer des campagnes de collecte"
      enabled={modules.campaigns}
      dependencies={['donations']}
    />
  </ModuleCategory>
  
  <ModuleCategory title="Modules Synagogue">
    <ModuleCard 
      module="zmanim"
      title="Horaires Halakhiques"
      description="Calcul automatique des zmanim"
      enabled={modules.zmanim}
      premium={true}
      onConfigure={() => openZmanimSettings()}
    />
    <ModuleCard 
      module="prayers"
      title="Horaires de Prières"
      description="Gestion des offices avec salles multiples"
      enabled={modules.prayers}
      dependencies={['zmanim']}
    />
  </ModuleCategory>
</ModulesManager>
```

### Navigation Dynamique selon Modules
```typescript
// Génération automatique du menu selon modules activés
const generateNavigation = (modules: TenantModules) => {
  const navigation = [
    { path: '/', label: 'Accueil', always: true },
  ];
  
  if (modules.donations) {
    navigation.push({ path: '/donate', label: 'Faire un Don' });
  }
  
  if (modules.campaigns) {
    navigation.push({ path: '/campaigns', label: 'Campagnes' });
  }
  
  if (modules.zmanim || modules.prayers) {
    navigation.push({ 
      path: '/synagogue', 
      label: 'Synagogue',
      subItems: [
        modules.zmanim && { path: '/zmanim', label: 'Zmanim' },
        modules.prayers && { path: '/prayers', label: 'Horaires' },
        modules.courses && { path: '/courses', label: 'Cours Torah' },
      ].filter(Boolean)
    });
  }
  
  if (modules.members) {
    navigation.push({ path: '/members', label: 'Espace Membres' });
  }
  
  return navigation;
};
```

### Configuration Par Module
```typescript
// Exemple: Configuration du module Zmanim
interface ZmanimModuleConfig {
  enabled: boolean;
  settings: {
    calculationMethod: 'MGA' | 'GRA' | 'CUSTOM';
    displayFormat: 'full' | 'compact' | 'widget';
    showSeconds: boolean;
    autoLocation: boolean;
    customLocation?: {
      lat: number;
      lng: number;
    };
    visibleTimes: {
      alot: boolean;
      misheyakir: boolean;
      hanetz: boolean;
      shema: boolean;
      tefila: boolean;
      chatzot: boolean;
      minchaGedola: boolean;
      minchaKetana: boolean;
      plag: boolean;
      shkia: boolean;
      tzeis: boolean;
    };
  };
}
```

## 🎨 Fonctionnalités Spécifiques Synagogue

### 1. **Widget Zmanim (Horaires Halakhiques)** - Module Optionnel

#### API Zmanim - KosherZmanim
```typescript
// Installation
// npm install kosher-zmanim

import { 
  ComplexZmanimCalendar, 
  GeoLocation,
  AstronomicalCalendar,
  JewishCalendar,
  HebrewDateFormatter,
  ZmanimFormatter
} from 'kosher-zmanim';

// Service Zmanim pour l'application
export class ZmanimService {
  private location: GeoLocation;
  private calendar: ComplexZmanimCalendar;
  private jewishCalendar: JewishCalendar;
  
  constructor(
    locationName: string,
    latitude: number,
    longitude: number,
    elevation: number = 0,
    timeZone: string = 'Europe/Paris'
  ) {
    this.location = new GeoLocation(
      locationName,
      latitude,
      longitude,
      elevation,
      timeZone
    );
    
    this.calendar = new ComplexZmanimCalendar(this.location);
    this.jewishCalendar = new JewishCalendar();
  }
  
  // Obtenir tous les zmanim pour une date
  getZmanimForDate(date: Date): ExtendedZmanimData {
    this.calendar.setDate(date);
    this.jewishCalendar.setDate(date);
    
    return {
      // Aube
      alotHaShachar_72: this.formatTime(this.calendar.getAlos72()),
      alotHaShachar_90: this.formatTime(this.calendar.getAlos90()),
      alotHaShachar_120: this.formatTime(this.calendar.getAlos120()),
      alotHaShachar_16_1: this.formatTime(this.calendar.getAlos16Point1Degrees()),
      
      // Misheyakir
      misheyakir_10_2: this.formatTime(this.calendar.getMisheyakir10Point2Degrees()),
      misheyakir_11: this.formatTime(this.calendar.getMisheyakir11Degrees()),
      misheyakir_11_5: this.formatTime(this.calendar.getMisheyakir11Point5Degrees()),
      
      // Lever
      hanetzHaChama: this.formatTime(this.calendar.getSunrise()),
      hanetzHaChamaElevation: this.formatTime(this.calendar.getSeaLevelSunrise()),
      
      // Shema
      sofZmanShmaGRA: this.formatTime(this.calendar.getSofZmanShmaGRA()),
      sofZmanShmaMGA: this.formatTime(this.calendar.getSofZmanShmaMGA()),
      sofZmanShmaFixedLocal: this.formatTime(this.calendar.getSofZmanShmaFixedLocal()),
      
      // Tefila
      sofZmanTefilaGRA: this.formatTime(this.calendar.getSofZmanTfilaGRA()),
      sofZmanTefilaMGA: this.formatTime(this.calendar.getSofZmanTfilaMGA()),
      
      // Chatzot
      chatzot: this.formatTime(this.calendar.getChatzos()),
      
      // Minha
      minchaGedola: this.formatTime(this.calendar.getMinchaGedola()),
      minchaKetana: this.formatTime(this.calendar.getMinchaKetana()),
      plagHaMincha: this.formatTime(this.calendar.getPlagHamincha()),
      
      // Coucher
      shkiatHaChama: this.formatTime(this.calendar.getSunset()),
      
      // Sortie des étoiles
      tzeitHakochavim: this.formatTime(this.calendar.getTzais()),
      tzeitHakochavim_72: this.formatTime(this.calendar.getTzais72()),
      tzeitHakochavim_RT: this.formatTime(this.calendar.getTzais72MinutesZmanis()),
      
      // Informations juives
      hebrewDate: this.getHebrewDate(),
      parasha: this.getParasha(),
      yomTov: this.getYomTov(),
      isShabbat: this.jewishCalendar.isShabbos(),
      candleLighting: this.getCandleLighting(),
      havdalah: this.getHavdalah()
    };
  }
  
  // Calculer les horaires de prières basés sur les zmanim
  calculatePrayerTimes(config: PrayerConfig): PrayerSchedule {
    const zmanim = this.getZmanimForDate(new Date());
    const schedule: PrayerSchedule = {};
    
    config.prayers.forEach(prayer => {
      if (prayer.timeMode === 'FIXED') {
        schedule[prayer.name] = prayer.fixedTime;
      } else if (prayer.timeMode === 'ZMAN_BASED') {
        const baseTime = zmanim[prayer.baseZman];
        schedule[prayer.name] = this.addMinutes(baseTime, prayer.offset);
      } else if (prayer.timeMode === 'CONDITIONAL') {
        // Logique conditionnelle (été/hiver, jour de semaine, etc.)
        schedule[prayer.name] = this.calculateConditionalTime(prayer, zmanim);
      }
    });
    
    return schedule;
  }
  
  private formatTime(date: Date | null): string {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  private getHebrewDate(): string {
    const formatter = new HebrewDateFormatter();
    formatter.setHebrewFormat(true);
    return formatter.format(this.jewishCalendar);
  }
  
  private getParasha(): string {
    const formatter = new HebrewDateFormatter();
    return formatter.formatParsha(this.jewishCalendar);
  }
}
```

#### Liste Complète des Zmanim Configurables
```typescript
interface ExtendedZmanimData {
  // Aube et Lever
  alotHaShachar_72: string;        // Aube - 72 minutes avant lever
  alotHaShachar_90: string;        // Aube - 90 minutes avant lever
  alotHaShachar_120: string;       // Aube - 120 minutes (Magen Avraham)
  alotHaShachar_16_1: string;      // Aube - 16.1 degrés
  misheyakir_10_2: string;         // Tefilines - 10.2 degrés
  misheyakir_11: string;           // Tefilines - 11 degrés
  misheyakir_11_5: string;         // Tefilines - 11.5 degrés
  
  // Lever du soleil
  hanetzHaChama: string;           // Lever du soleil (niveau mer)
  hanetzHaChamaElevation: string;  // Lever ajusté à l'élévation
  
  // Shema et Tefila
  sofZmanShmaGRA: string;          // Fin Shema (Gra/Baal Hatanya)
  sofZmanShmaMGA: string;          // Fin Shema (Magen Avraham)
  sofZmanShmaFixedLocal: string;   // Fin Shema (3 heures fixes)
  sofZmanTefilaGRA: string;        // Fin Tefila (Gra)
  sofZmanTefilaMGA: string;        // Fin Tefila (Magen Avraham)
  sofZmanTefilaFixedLocal: string; // Fin Tefila (4 heures fixes)
  
  // Milieu du jour
  chatzot: string;                 // Midi halakhique
  
  // Minha
  minchaGedola: string;            // Grande Minha (30 min après Chatzot)
  minchaGedola_Ateret: string;     // Grande Minha (Ateret Torah)
  minchaKetana: string;            // Petite Minha (GRA)
  minchaKetana_Ateret: string;     // Petite Minha (Ateret Torah)
  plagHaMincha: string;            // Plag HaMinha (GRA)
  plagHaMincha_Ateret: string;     // Plag HaMinha (Ateret Torah)
  
  // Coucher et Sortie
  candleLighting: string;          // Allumage des bougies (18 min avant)
  candleLighting_20: string;       // Allumage (20 min - Yeroushalayim)
  candleLighting_30: string;       // Allumage (30 min - certaines communautés)
  candleLighting_40: string;       // Allumage (40 min - certaines communautés)
  
  shkiatHaChama: string;           // Coucher du soleil (niveau mer)
  shkiatHaChamaElevation: string;  // Coucher ajusté à l'élévation
  bainHashmashot: string;          // Entre les soleils
  
  // Sortie des étoiles
  tzeitHakochavim: string;         // 3 étoiles moyennes (GRA)
  tzeitHakochavim_5_95: string;    // Sortie - 5.95 degrés
  tzeitHakochavim_7_083: string;   // Sortie - 7.083 degrés (3 petites étoiles)
  tzeitHakochavim_8_5: string;     // Sortie - 8.5 degrés
  tzeitHakochavim_13: string;      // Sortie - 13 degrés (Rabbeinu Tam)
  tzeitHakochavim_16_1: string;    // Sortie - 16.1 degrés
  tzeitHakochavim_18: string;      // Sortie - 18 degrés
  tzeitHakochavim_19_8: string;    // Sortie - 19.8 degrés
  tzeitHakochavim_24: string;      // Sortie - 24 degrés
  tzeitHakochavim_26: string;      // Sortie - 26 degrés
  tzeitHakochavim_42: string;      // Sortie - 42 minutes
  tzeitHakochavim_50: string;      // Sortie - 50 minutes
  tzeitHakochavim_72: string;      // Sortie - 72 minutes (Rabbeinu Tam)
  tzeitHakochavim_90: string;      // Sortie - 90 minutes
  tzeitHakochavim_120: string;     // Sortie - 120 minutes
  
  // Shabbat et Yom Tov
  tzeitShabbat: string;            // Sortie Shabbat (selon minhag)
  tzeitShabbat_RT: string;         // Sortie Shabbat (Rabbeinu Tam)
  havdalah_8_5: string;            // Havdala - 8.5 degrés
  havdalah_42: string;             // Havdala - 42 minutes
  havdalah_50: string;             // Havdala - 50 minutes
  havdalah_60: string;             // Havdala - 60 minutes
  havdalah_72: string;             // Havdala - 72 minutes
  
  // Heures temporelles
  shaahZmanisGRA: string;          // Heure temporelle (GRA)
  shaahZmanisMGA: string;          // Heure temporelle (Magen Avraham)
  
  // Jeûnes
  sofZmanAchilatChametz: string;   // Fin manger Hametz
  sofZmanBiurChametz: string;      // Fin brûler Hametz
  
  // Autres
  molad: string;                   // Nouvelle lune
  earliestTallit: string;          // Plus tôt pour Tallit
  earliestTefillin: string;        // Plus tôt pour Tefilines
  samuchLeMinchaKetana: string;    // Proche de Minha Ketana
}

// Configuration de l'affichage par le responsable
interface ZmanimDisplayConfig {
  categories: {
    dawn: {
      title: "Aube",
      enabled: boolean;
      times: {
        alot_72: { label: "Alot (72 min)", show: boolean, default: false },
        alot_90: { label: "Alot (90 min)", show: boolean, default: false },
        alot_120: { label: "Alot (120 min - MGA)", show: boolean, default: true },
        alot_16_1: { label: "Alot (16.1°)", show: boolean, default: false },
      }
    },
    morning: {
      title: "Matin",
      enabled: boolean;
      times: {
        misheyakir: { label: "Misheyakir", show: boolean, default: true },
        hanetz: { label: "Lever du soleil", show: boolean, default: true },
        shema_gra: { label: "Fin Shema (GRA)", show: boolean, default: true },
        shema_mga: { label: "Fin Shema (MGA)", show: boolean, default: false },
        tefila_gra: { label: "Fin Tefila (GRA)", show: boolean, default: true },
        tefila_mga: { label: "Fin Tefila (MGA)", show: boolean, default: false },
      }
    },
    afternoon: {
      title: "Après-midi",
      enabled: boolean;
      times: {
        chatzot: { label: "Chatzot", show: boolean, default: true },
        mincha_gedola: { label: "Minha Guedola", show: boolean, default: true },
        mincha_ketana: { label: "Minha Ketana", show: boolean, default: true },
        plag: { label: "Plag HaMinha", show: boolean, default: false },
      }
    },
    evening: {
      title: "Soir",
      enabled: boolean;
      times: {
        candles_18: { label: "Allumage (18 min)", show: boolean, default: true },
        shkia: { label: "Coucher du soleil", show: boolean, default: true },
        tzeis_3stars: { label: "Sortie (3 étoiles)", show: boolean, default: true },
        tzeis_rt: { label: "Sortie (R. Tam)", show: boolean, default: false },
      }
    }
  }
}

// Composant d'affichage
<ZmanimWidget 
  location={synagogueSettings}
  date={selectedDate}
  calculationMethod="MGA"
  showAllTimes={false}
  highlightCurrent={true}
/>
```

### 2. **Gestionnaire d'Horaires de Prières**
```typescript
// Configuration flexible des prières
interface PrayerSchedule {
  // Horaire fixe
  fixed: {
    time: string; // "07:00"
    days: number[]; // [1,2,3,4,5] (Lun-Ven)
  };
  
  // Basé sur les zmanim
  zmanBased: {
    baseZman: 'hanetzHaChama' | 'shkiatHaChama' | ...;
    offset: number; // Minutes avant/après
    conditions?: {
      season?: 'summer' | 'winter';
      dayType?: 'weekday' | 'shabbat' | 'holiday';
    };
  };
  
  // Plusieurs offices le même jour
  multiple: {
    offices: Office[];
    rooms?: Room[];
  };
}
```

### 3. **Planning des Cours Torah**
```typescript
<CourseCalendar
  courses={activeCourses}
  view="week" | "month" | "list"
  filters={{
    type: CourseType[],
    level: CourseLevel,
    rabbi: string,
    online: boolean
  }}
  onCourseClick={(course) => showDetails(course)}
/>
```

### 4. **Calendrier Juif Intégré**
```typescript
interface HebrewCalendarData {
  hebrewDate: string;        // "15 Kislev 5784"
  parasha: string;           // Portion de la semaine
  holiday?: string;          // Fête juive
  omerCount?: number;        // Compte du Omer
  specialReadings?: string[];// Lectures spéciales
  candles?: {
    lighting: string;        // Allumage des bougies
    havdalah: string;        // Havdala
  };
}
```

## 🔧 Fonctionnalités Avancées Supplémentaires

### 1. **Système de Membres**
- Gestion des cotisations
- Anniversaires hébraïques (Yahrzeit)
- Invitations aux événements
- Places réservées à la synagogue

### 2. **Gestion des Événements Religieux**
- Bar/Bat Mitzvah
- Mariages (Houppa)
- Brit Mila
- Séouda (repas communautaires)

### 3. **Bibliothèque de Textes**
- Divrei Torah hebdomadaires
- Archives des sermons
- Textes d'étude
- Ressources éducatives

### 4. **Système de Dons Spécifiques**
- Aliyot (montées à la Torah)
- Dédicaces de cours
- Tzedaka pour occasions spéciales
- Matanot LaEvyonim

### 5. **Communication Communautaire**
- Annonces urgentes (SMS/Email)
- Newsletter hebdomadaire
- Rappels de Yahrzeit
- Notifications de minyan

## 🛠️ Stack Technique Additionnelle

### Librairie Principale - KosherZmanim
```bash
# Installation
npm install kosher-zmanim

# Types TypeScript inclus
# Documentation: https://github.com/BehindTheMath/KosherZmanim
```

**Fonctionnalités KosherZmanim**:
- ✅ 90+ méthodes de calcul de zmanim
- ✅ Support multi-timezone
- ✅ Calculs avec élévation
- ✅ Calendrier hébraïque complet
- ✅ Parasha, Yom Tov, Rosh Hodesh
- ✅ Daf Yomi
- ✅ TypeScript natif

### Services Complémentaires
- **Sefaria API** - Textes juifs et commentaires
- **OpenWeatherMap** - Météo pour Shabbat
- **Google Calendar** - Sync événements
- **Nominatim** - Géolocalisation inverse

## 📱 Fonctionnalités Mobile

### PWA Features
- Installation sur mobile
- Notifications push (rappels prières)
- Mode hors ligne (zmanim cachés)
- Compass pour direction de prière

### App Mobile Native (Phase future)
- Widget zmanim sur écran d'accueil
- Notifications intelligentes
- Mode Shabbat (interface simplifiée)

## 🚀 Phases de Développement

### Phase 1: Infrastructure (3-4 jours)
- [ ] Setup routing multi-tenant dans frontend-hub
- [ ] Middleware de résolution tenant
- [ ] Context provider pour données site
- [ ] Layout système adaptatif

### Phase 2: Pages Dynamiques (4-5 jours)
- [ ] Système de pages CMS
- [ ] Builder de contenu
- [ ] Templates prédéfinis
- [ ] Navigation dynamique

### Phase 3: Fonctionnalités Judaïques (5-6 jours)
- [ ] Widget Zmanim complet
- [ ] Gestionnaire de prières
- [ ] Planning des cours
- [ ] Calendrier hébraïque

### Phase 4: Personnalisation (3-4 jours)
- [ ] Theme engine
- [ ] Configuration synagogue
- [ ] Préférences utilisateur
- [ ] Multi-langue (FR/HE/EN)

### Phase 5: Intégrations (3-4 jours)
- [ ] Système de dons étendu
- [ ] Gestion des membres
- [ ] Communication (email/SMS)
- [ ] Analytics et rapports

### Phase 6: Optimisation (2-3 jours)
- [ ] Performance (SSG/ISR)
- [ ] SEO avancé
- [ ] PWA features
- [ ] Tests et déploiement

## 📈 Métriques de Succès

- Sites générés automatiquement < 30 secondes
- Temps de chargement < 2 secondes
- Score Lighthouse > 95
- Taux d'adoption > 80% des associations
- Satisfaction utilisateur > 4.5/5

## 🔐 Sécurité et Conformité

- Isolation stricte des données par tenant
- RGPD compliant
- Backup automatique quotidien
- SSL/TLS pour tous les domaines
- Rate limiting par tenant

## 💰 Modèle de Monétisation

### Pour les Associations
- **Gratuit**: Site basique avec features essentielles
- **Premium**: €29/mois - Personnalisation avancée
- **Pro**: €59/mois - Toutes features + support prioritaire

### Services Additionnels
- Domaine personnalisé: €15/an
- SMS notifications: €0.05/SMS
- Stockage supplémentaire: €5/10GB
- Formation personnalisée: €200/session

## 📝 Documentation Requise

- Guide d'administration pour responsables
- Documentation API pour développeurs
- Tutoriels vidéo pour utilisateurs
- FAQ et troubleshooting
- Guide de migration depuis autres plateformes

---

**Estimation totale**: 20-25 jours de développement

Ce plan intégré dans frontend-hub permet de mutualiser le code, réduire la maintenance et offrir une expérience unifiée tout en gardant une séparation claire entre le hub central et les sites des associations.