import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from './tenant-context.service';
import { 
  ComplexZmanimCalendar, 
  GeoLocation,
  JewishCalendar,
  HebrewDateFormatter,
  ZmanimFormatter
} from 'kosher-zmanim';

export interface ExtendedZmanimData {
  // Aube et Lever
  alotHaShachar_72?: string;
  alotHaShachar_90?: string;
  alotHaShachar_120?: string;
  alotHaShachar_16_1?: string;
  misheyakir_10_2?: string;
  misheyakir_11?: string;
  misheyakir_11_5?: string;
  
  // Lever du soleil
  hanetzHaChama?: string;
  hanetzHaChamaElevation?: string;
  hanetzMishor?: string;
  hanetzBaalHatanya?: string;
  
  // Shema et Tefila
  sofZmanShmaGRA?: string;
  sofZmanShmaMGA?: string;
  sofZmanShmaMGA72?: string;
  sofZmanShmaMGA90?: string;
  sofZmanShmaFixedLocal?: string;
  sofZmanTefilaGRA?: string;
  sofZmanTefilaMGA?: string;
  sofZmanTefilaMGA72?: string;
  sofZmanTefilaMGA90?: string;
  sofZmanTefilaFixedLocal?: string;
  
  // Milieu du jour
  chatzot?: string;
  
  // Minha
  minchaGedola?: string;
  minchaGedola_Ateret?: string;
  minchaKetana?: string;
  minchaKetana_Ateret?: string;
  plagHaMincha?: string;
  plagHaMincha_Ateret?: string;
  
  // Coucher et Sortie
  candleLighting?: string;
  candleLighting_20?: string;
  candleLighting_30?: string;
  candleLighting_40?: string;
  
  shkiatHaChama?: string;
  shkiatHaChamaElevation?: string;
  shkiaMishor?: string;
  bainHashmashot?: string;
  
  // Sortie des étoiles
  tzeitHakochavim?: string;
  tzeitHakochavim_5_95?: string;
  tzeitHakochavim_6_45?: string;
  tzeitHakochavim_7_083?: string;
  tzeitHakochavim_8_5?: string;
  tzeitHakochavim_13?: string;
  tzeitHakochavim_13_5?: string;
  tzeitHakochavim_16_1?: string;
  tzeitHakochavim_18?: string;
  tzeitHakochavim_19_8?: string;
  tzeitHakochavim_20?: string;
  tzeitHakochavim_24?: string;
  tzeitHakochavim_26?: string;
  tzeitHakochavim_42?: string;
  tzeitHakochavim_50?: string;
  tzeitHakochavim_72?: string;
  tzeitHakochavim_90?: string;
  tzeitHakochavim_120?: string;
  
  // Shabbat et Yom Tov
  tzeitShabbat?: string;
  tzeitShabbat_RT?: string;
  havdalah_8_5?: string;
  havdalah_42?: string;
  havdalah_50?: string;
  havdalah_60?: string;
  havdalah_72?: string;
  
  // Heures temporelles
  shaahZmanisGRA?: string;
  shaahZmanisMGA?: string;
  
  // Jeûnes
  sofZmanAchilatChametz?: string;
  sofZmanBiurChametz?: string;
  
  // Autres
  molad?: string;
  earliestTallit?: string;
  earliestTefillin?: string;
  samuchLeMinchaKetana?: string;
  
  // Informations juives
  hebrewDate?: string;
  parasha?: string;
  yomTov?: string;
  isShabbat?: boolean;
  omerCount?: number;
  isRoshChodesh?: boolean;
  isFastDay?: boolean;
  fastName?: string;
  fastStarts?: string;
  fastEnds?: string;
  
  // Daf Yomi
  dafYomi?: {
    masechta: string;     // Traité actuel
    daf: number;          // Page du jour
    hebrewMasechta?: string;
    startDate?: string;
    endDate?: string;
  };
  
  // Molad (nouvelle lune)
  moladInfo?: {
    molad: string;
    hours: number;
    minutes: number;
    chalakim: number;
    dayOfWeek: number;
  };
}

export interface ZmanimSettingsDto {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  cityName: string;
  showSeconds?: boolean;
  use24HourFormat?: boolean;
  showHebrewDate?: boolean;
  showParasha?: boolean;
  selectedZmanim?: string[];
  calculationMethod?: string;
  candleLightingOffset?: number;
  havdalahOffset?: number;
  
  // Display fields for each zman
  displayAlotHashachar72?: boolean;
  displayAlotHashachar90?: boolean;
  displayAlotHashachar120?: boolean;
  displayAlotHashachar16_1?: boolean;
  displayMisheyakir10_2?: boolean;
  displayMisheyakir11?: boolean;
  displayMisheyakir11_5?: boolean;
  displayHanetzHaChama?: boolean;
  displayHanetzElevation?: boolean;
  displaySofZmanShmaGRA?: boolean;
  displaySofZmanShmaMGA?: boolean;
  displaySofZmanShmaFixed?: boolean;
  displaySofZmanTfilaGRA?: boolean;
  displaySofZmanTfilaMGA?: boolean;
  displaySofZmanTfilaFixed?: boolean;
  displayChatzot?: boolean;
  displayMinchaGedola?: boolean;
  displayMinchaGedolaAteret?: boolean;
  displayMinchaKetana?: boolean;
  displayMinchaKetanaAteret?: boolean;
  displayPlagHamincha?: boolean;
  displayPlagHaminchaAteret?: boolean;
  displayCandleLighting?: boolean;
  displayCandleLighting20?: boolean;
  displayCandleLighting30?: boolean;
  displayCandleLighting40?: boolean;
  displayShkiatHaChama?: boolean;
  displayShkiatElevation?: boolean;
  displayBainHashmashot?: boolean;
  displayTzeitHakochavim?: boolean;
  displayTzeit5_95?: boolean;
  displayTzeit7_083?: boolean;
  displayTzeit8_5?: boolean;
  displayTzeit13?: boolean;
  displayTzeit16_1?: boolean;
  displayTzeit18?: boolean;
  displayTzeit19_8?: boolean;
  displayTzeit24?: boolean;
  displayTzeit26?: boolean;
  displayTzeit42?: boolean;
  displayTzeit50?: boolean;
  displayTzeit72?: boolean;
  displayTzeit90?: boolean;
  displayTzeit120?: boolean;
  displayTzeitShabbat?: boolean;
  displayTzeitShabbatRT?: boolean;
  displayHavdalah8_5?: boolean;
  displayHavdalah42?: boolean;
  displayHavdalah50?: boolean;
  displayHavdalah60?: boolean;
  displayHavdalah72?: boolean;
  displayShaahZmanisGRA?: boolean;
  displayShaahZmanisMGA?: boolean;
  displayEarliestTallit?: boolean;
  displayEarliestTefillin?: boolean;
}

@Injectable()
export class ZmanimService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  /**
   * Obtenir les paramètres Zmanim d'un tenant
   */
  async getSettings(tenantId: string) {
    const settings = await this.prisma.zmanimSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      // Retourner des paramètres par défaut pour Paris
      return {
        latitude: 48.8566,
        longitude: 2.3522,
        elevation: 35,
        timezone: 'Europe/Paris',
        cityName: 'Paris',
        showSeconds: false,
        use24HourFormat: true,
        showHebrewDate: true,
        showParasha: true,
        selectedZmanim: [
          'hanetzHaChama',
          'sofZmanShmaGRA',
          'sofZmanTefilaGRA',
          'chatzot',
          'minchaKetana',
          'shkiatHaChama',
          'tzeitHakochavim'
        ],
        calculationMethod: 'GRA',
        candleLightingOffset: 18,
        havdalahOffset: 72,
        // Default display settings - Dawn
        displayAlotHashachar72: false,
        displayAlotHashachar90: false,
        displayAlotHashachar120: true,
        displayAlotHashachar16_1: false,
        displayMisheyakir10_2: false,
        displayMisheyakir11: true,
        displayMisheyakir11_5: false,
        // Sunrise
        displayHanetzHaChama: true,
        displayHanetzElevation: false,
        // Shema
        displaySofZmanShmaGRA: true,
        displaySofZmanShmaMGA: true,
        displaySofZmanShmaFixed: false,
        // Tefila
        displaySofZmanTfilaGRA: true,
        displaySofZmanTfilaMGA: false,
        displaySofZmanTfilaFixed: false,
        // Midday
        displayChatzot: true,
        // Mincha
        displayMinchaGedola: true,
        displayMinchaGedolaAteret: false,
        displayMinchaKetana: true,
        displayMinchaKetanaAteret: false,
        displayPlagHamincha: false,
        displayPlagHaminchaAteret: false,
        // Candle lighting
        displayCandleLighting: true,
        displayCandleLighting20: false,
        displayCandleLighting30: false,
        displayCandleLighting40: false,
        // Sunset
        displayShkiatHaChama: true,
        displayShkiatElevation: false,
        displayBainHashmashot: false,
        // Tzeis
        displayTzeitHakochavim: true,
        displayTzeit5_95: false,
        displayTzeit7_083: false,
        displayTzeit8_5: false,
        displayTzeit13: false,
        displayTzeit16_1: false,
        displayTzeit18: false,
        displayTzeit19_8: false,
        displayTzeit24: false,
        displayTzeit26: false,
        displayTzeit42: false,
        displayTzeit50: false,
        displayTzeit72: true,
        displayTzeit90: false,
        displayTzeit120: false,
        // Shabbat/Yom Tov
        displayTzeitShabbat: true,
        displayTzeitShabbatRT: false,
        displayHavdalah8_5: false,
        displayHavdalah42: false,
        displayHavdalah50: false,
        displayHavdalah60: false,
        displayHavdalah72: true,
        // Additional
        displayShaahZmanisGRA: false,
        displayShaahZmanisMGA: false,
        displayEarliestTallit: false,
        displayEarliestTefillin: false,
      };
    }

    return settings;
  }

  /**
   * Mettre à jour les paramètres Zmanim
   */
  async updateSettings(tenantId: string, data: ZmanimSettingsDto) {
    const settings = await this.prisma.zmanimSettings.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });

    return settings;
  }

  /**
   * Obtenir les zmanim complets pour une date donnée
   */
  async getZmanimForDate(tenantId: string, date: Date = new Date()): Promise<ExtendedZmanimData> {
    const settings = await this.getSettings(tenantId);
    
    const location = new GeoLocation(
      settings.cityName,
      settings.latitude,
      settings.longitude,
      settings.elevation || 0,
      settings.timezone || 'Europe/Paris'
    );
    
    const calendar = new ComplexZmanimCalendar(location);
    const jewishCalendar = new JewishCalendar();
    const hebrewFormatter = new HebrewDateFormatter();
    
    calendar.setDate(date);
    jewishCalendar.setDate(date);
    
    // Configure Hebrew formatter
    hebrewFormatter.setHebrewFormat(true);
    hebrewFormatter.setTransliteratedMonthList([
      'Nissan', 'Iyar', 'Sivan', 'Tammouz', 'Av', 'Eloul',
      'Tishrei', 'Heshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
      'Adar II'
    ]);
    
    const data: ExtendedZmanimData = {};
    
    // Aube - Dawn calculations (using optimal degree-based methods)
    if (settings.displayAlotHashachar72) {
      // Use 16.1 degrees instead of fixed 72 minutes for better precision
      data.alotHaShachar_72 = this.formatTime(calendar.getAlos16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayAlotHashachar90) {
      // Use 19.8 degrees instead of fixed 90 minutes for better precision
      data.alotHaShachar_90 = this.formatTime(calendar.getAlos19Point8Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayAlotHashachar120) {
      data.alotHaShachar_120 = this.formatTime(calendar.getAlos120(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayAlotHashachar16_1) {
      data.alotHaShachar_16_1 = this.formatTime(calendar.getAlos16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Misheyakir (using optimal 11.5 degrees for best precision)
    if (settings.displayMisheyakir10_2) {
      data.misheyakir_10_2 = this.formatTime(calendar.getMisheyakir10Point2Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayMisheyakir11) {
      data.misheyakir_11 = this.formatTime(calendar.getMisheyakir11Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayMisheyakir11_5) {
      // Optimal method for Misheyakir according to עתים לבינה
      data.misheyakir_11_5 = this.formatTime(calendar.getMisheyakir11Point5Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Sunrise (using sea level for better precision)
    if (settings.displayHanetzHaChama) {
      data.hanetzHaChama = this.formatTime(calendar.getSunrise(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayHanetzElevation) {
      data.hanetzHaChamaElevation = this.formatTime(calendar.getSeaLevelSunrise(), settings.use24HourFormat, settings.showSeconds);
    }
    // Always provide hanetzMishor (sea level sunrise) for optimal precision
    data.hanetzMishor = this.formatTime(calendar.getSeaLevelSunrise(), settings.use24HourFormat, settings.showSeconds);
    // Baal Hatanya calculation - using sea level sunrise as approximation
    // Note: getSunriseBaalHatanya is private, using standard sunrise
    data.hanetzBaalHatanya = this.formatTime(calendar.getSeaLevelSunrise(), settings.use24HourFormat, settings.showSeconds);
    
    // Shema (using optimal degree-based methods)
    if (settings.displaySofZmanShmaGRA) {
      // GRA method is already optimal
      data.sofZmanShmaGRA = this.formatTime(calendar.getSofZmanShmaGRA(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displaySofZmanShmaMGA) {
      // Use degree-based calculations for optimal precision
      // MGA 72: Use 16.1 degrees method
      data.sofZmanShmaMGA72 = this.formatTime(calendar.getSofZmanShmaMGA16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
      // MGA 90: Use 19.8 degrees method for best precision
      data.sofZmanShmaMGA90 = this.formatTime(calendar.getSofZmanShmaMGA19Point8Degrees(), settings.use24HourFormat, settings.showSeconds);
      // Default to MGA 72 with 16.1 degrees
      data.sofZmanShmaMGA = this.formatTime(calendar.getSofZmanShmaMGA16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
      // Alternative: Ateret Torah method (also very precise)
      // data.sofZmanShmaAteretTorah = this.formatTime(calendar.getSofZmanShmaAteretTorah(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displaySofZmanShmaFixed) {
      data.sofZmanShmaFixedLocal = this.formatTime(calendar.getSofZmanShmaFixedLocal(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Tefila (using optimal methods)
    if (settings.displaySofZmanTfilaGRA) {
      // Use Baal HaTanya method for better precision with GRA
      data.sofZmanTefilaGRA = this.formatTime(calendar.getSofZmanTfilaBaalHatanya(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displaySofZmanTfilaMGA) {
      // Use degree-based calculations for optimal precision
      // MGA 72: Use 16.1 degrees method
      data.sofZmanTefilaMGA72 = this.formatTime(calendar.getSofZmanTfilaMGA16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
      // MGA 90: Use 19.8 degrees method for best precision
      data.sofZmanTefilaMGA90 = this.formatTime(calendar.getSofZmanTfilaMGA19Point8Degrees(), settings.use24HourFormat, settings.showSeconds);
      // Default to MGA 72 with 16.1 degrees
      data.sofZmanTefilaMGA = this.formatTime(calendar.getSofZmanTfilaMGA16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displaySofZmanTfilaFixed) {
      data.sofZmanTefilaFixedLocal = this.formatTime(calendar.getSofZmanTfilaFixedLocal(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Chatzot
    if (settings.displayChatzot) {
      data.chatzot = this.formatTime(calendar.getChatzos(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Mincha (using optimal methods)
    if (settings.displayMinchaGedola) {
      // Use 30 minutes method for better precision
      data.minchaGedola = this.formatTime(calendar.getMinchaGedola30Minutes(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayMinchaGedolaAteret) {
      data.minchaGedola_Ateret = this.formatTime(calendar.getMinchaGedolaGreaterThan30(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayMinchaKetana) {
      // Use GRA fixed local method for better precision
      data.minchaKetana = this.formatTime(calendar.getMinchaKetanaGRAFixedLocalChatzosToSunset(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayMinchaKetanaAteret) {
      data.minchaKetana_Ateret = this.formatTime(calendar.getMinchaKetanaAteretTorah(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayPlagHamincha) {
      // Use GRA fixed local method for better precision
      data.plagHaMincha = this.formatTime(calendar.getPlagHaminchaGRAFixedLocalChatzosToSunset(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayPlagHaminchaAteret) {
      data.plagHaMincha_Ateret = this.formatTime(calendar.getPlagHaminchaAteretTorah(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Sunset (using sea level for better precision)
    if (settings.displayShkiatHaChama) {
      data.shkiatHaChama = this.formatTime(calendar.getSunset(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayShkiatElevation) {
      // Sea level sunset for better precision
      data.shkiatHaChamaElevation = this.formatTime(calendar.getSeaLevelSunset(), settings.use24HourFormat, settings.showSeconds);
    }
    // Always provide shkia mishor (sea level sunset) for optimal precision
    data.shkiaMishor = this.formatTime(calendar.getSeaLevelSunset(), settings.use24HourFormat, settings.showSeconds);
    if (settings.displayBainHashmashot) {
      data.bainHashmashot = this.formatTime(calendar.getBainHashmashosRT13Point24Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Tzeis - Night calculations (using optimal degree methods)
    if (settings.displayTzeitHakochavim) {
      // Use 8.5 degrees for standard tzeis
      data.tzeitHakochavim = this.formatTime(calendar.getTzaisGeonim8Point5Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit5_95) {
      data.tzeitHakochavim_5_95 = this.formatTime(calendar.getTzaisGeonim5Point95Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    // Add 6.45 degrees (between 5.95 and 7.083)
    const tzeis645 = calendar.getTzaisGeonim5Point95Degrees();
    if (tzeis645) {
      const adjustedTime = new Date(tzeis645);
      // 6.45 degrees is approximately 2 minutes after 5.95 degrees
      adjustedTime.setMinutes(adjustedTime.getMinutes() + 2);
      data.tzeitHakochavim_6_45 = this.formatTime(adjustedTime, settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit7_083) {
      data.tzeitHakochavim_7_083 = this.formatTime(calendar.getTzaisGeonim7Point083Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit8_5) {
      data.tzeitHakochavim_8_5 = this.formatTime(calendar.getTzaisGeonim8Point5Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit13) {
      // Use BainHashmashosRT2Stars for medium tzeis (better precision)
      data.tzeitHakochavim_13 = this.formatTime(calendar.getBainHashmashosRT2Stars(), settings.use24HourFormat, settings.showSeconds);
    }
    // Add 13.5 degrees calculation
    const tzeis135 = calendar.getBainHashmashosRT13Point5MinutesBefore7Point083Degrees();
    if (tzeis135) {
      data.tzeitHakochavim_13_5 = this.formatTime(tzeis135, settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit16_1) {
      data.tzeitHakochavim_16_1 = this.formatTime(calendar.getTzais16Point1Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit18) {
      // Use 4.37 degrees (Geonim) for 18° equivalent with better precision
      data.tzeitHakochavim_18 = this.formatTime(calendar.getTzaisGeonim4Point37Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    // Add 20 minutes after sunset
    const sunset20 = calendar.getSunset();
    if (sunset20) {
      const tzeis20min = new Date(sunset20);
      tzeis20min.setMinutes(tzeis20min.getMinutes() + 20);
      data.tzeitHakochavim_20 = this.formatTime(tzeis20min, settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit19_8) {
      data.tzeitHakochavim_19_8 = this.formatTime(calendar.getTzais19Point8Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit24) {
      // 24 degrees not available in kosher-zmanim, skip it
    }
    if (settings.displayTzeit26) {
      data.tzeitHakochavim_26 = this.formatTime(calendar.getTzais26Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit42) {
      const sunset = calendar.getSunset();
      if (sunset) {
        const tzeis42 = new Date(sunset);
        tzeis42.setMinutes(tzeis42.getMinutes() + 42);
        data.tzeitHakochavim_42 = this.formatTime(tzeis42, settings.use24HourFormat, settings.showSeconds);
      }
    }
    if (settings.displayTzeit50) {
      data.tzeitHakochavim_50 = this.formatTime(calendar.getTzais50(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit72) {
      data.tzeitHakochavim_72 = this.formatTime(calendar.getTzais72(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit90) {
      data.tzeitHakochavim_90 = this.formatTime(calendar.getTzais90(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayTzeit120) {
      data.tzeitHakochavim_120 = this.formatTime(calendar.getTzais120(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Temporal hours
    if (settings.displayShaahZmanisGRA) {
      const shaahZmanisGra = calendar.getShaahZmanisGra();
      if (shaahZmanisGra) {
        data.shaahZmanisGRA = `${Math.floor(shaahZmanisGra / 60000)} min`;
      }
    }
    if (settings.displayShaahZmanisMGA) {
      const shaahZmanisMga = calendar.getShaahZmanisMGA();
      if (shaahZmanisMga) {
        data.shaahZmanisMGA = `${Math.floor(shaahZmanisMga / 60000)} min`;
      }
    }
    
    // Earliest times
    if (settings.displayEarliestTallit) {
      data.earliestTallit = this.formatTime(calendar.getMisheyakir10Point2Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    if (settings.displayEarliestTefillin) {
      data.earliestTefillin = this.formatTime(calendar.getMisheyakir11Degrees(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Candle lighting (for Shabbat/Yom Tov)
    if (this.isErevShabbatOrYomTov(date, jewishCalendar)) {
      const sunset = calendar.getSunset();
      if (sunset) {
        if (settings.displayCandleLighting) {
          const candleLightingTime = new Date(sunset);
          candleLightingTime.setMinutes(candleLightingTime.getMinutes() - (settings.candleLightingOffset || 18));
          data.candleLighting = this.formatTime(candleLightingTime, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayCandleLighting20) {
          const candleLighting20 = new Date(sunset);
          candleLighting20.setMinutes(candleLighting20.getMinutes() - 20);
          data.candleLighting_20 = this.formatTime(candleLighting20, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayCandleLighting30) {
          const candleLighting30 = new Date(sunset);
          candleLighting30.setMinutes(candleLighting30.getMinutes() - 30);
          data.candleLighting_30 = this.formatTime(candleLighting30, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayCandleLighting40) {
          const candleLighting40 = new Date(sunset);
          candleLighting40.setMinutes(candleLighting40.getMinutes() - 40);
          data.candleLighting_40 = this.formatTime(candleLighting40, settings.use24HourFormat, settings.showSeconds);
        }
      }
    }
    
    // Havdalah (for Motzei Shabbat/Yom Tov)
    if (this.isMotzeiShabbatOrYomTov(date, jewishCalendar)) {
      const sunset = calendar.getSunset();
      if (sunset) {
        if (settings.displayHavdalah8_5) {
          data.havdalah_8_5 = this.formatTime(calendar.getTzaisGeonim8Point5Degrees(), settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayHavdalah42) {
          const havdalah42 = new Date(sunset);
          havdalah42.setMinutes(havdalah42.getMinutes() + 42);
          data.havdalah_42 = this.formatTime(havdalah42, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayHavdalah50) {
          const havdalah50 = new Date(sunset);
          havdalah50.setMinutes(havdalah50.getMinutes() + 50);
          data.havdalah_50 = this.formatTime(havdalah50, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayHavdalah60) {
          const havdalah60 = new Date(sunset);
          havdalah60.setMinutes(havdalah60.getMinutes() + 60);
          data.havdalah_60 = this.formatTime(havdalah60, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayHavdalah72) {
          const havdalah72 = new Date(sunset);
          havdalah72.setMinutes(havdalah72.getMinutes() + 72);
          data.havdalah_72 = this.formatTime(havdalah72, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayTzeitShabbat) {
          data.tzeitShabbat = this.formatTime(calendar.getTzais(), settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayTzeitShabbatRT) {
          data.tzeitShabbat_RT = this.formatTime(calendar.getTzais72(), settings.use24HourFormat, settings.showSeconds);
        }
      }
    }
    
    // Jewish information
    data.isShabbat = this.isShabbat(jewishCalendar);
    data.isRoshChodesh = jewishCalendar.isRoshChodesh();
    data.omerCount = jewishCalendar.getDayOfOmer() || undefined;
    
    // Hebrew date
    if (settings.showHebrewDate) {
      const day = jewishCalendar.getJewishDayOfMonth();
      const month = hebrewFormatter.formatMonth(jewishCalendar);
      const year = jewishCalendar.getJewishYear();
      data.hebrewDate = `${day} ${month} ${year}`;
    }
    
    // Parasha
    if (settings.showParasha) {
      data.parasha = this.getParasha(jewishCalendar);
    }
    
    // Fast days
    const fastInfo = this.getFastInfo(jewishCalendar, calendar, settings);
    if (fastInfo) {
      data.isFastDay = true;
      data.fastName = fastInfo.name;
      data.fastStarts = fastInfo.starts;
      data.fastEnds = fastInfo.ends;
    }
    
    // Yom Tov
    data.yomTov = this.getYomTov(jewishCalendar);
    
    // Chametz times (for Pesach)
    if (jewishCalendar.getJewishMonth() === 1 && jewishCalendar.getJewishDayOfMonth() === 14) {
      data.sofZmanAchilatChametz = this.formatTime(calendar.getSofZmanTfilaGRA(), settings.use24HourFormat, settings.showSeconds);
      data.sofZmanBiurChametz = this.formatTime(calendar.getChatzos(), settings.use24HourFormat, settings.showSeconds);
    }
    
    // Daf Yomi
    try {
      const dafYomi = jewishCalendar.getDafYomiBavli();
      if (dafYomi) {
        data.dafYomi = {
          masechta: dafYomi.getMasechtaTransliterated(),
          daf: dafYomi.getDaf(),
          hebrewMasechta: dafYomi.getMasechta(),
          startDate: '', // Can be calculated if needed
          endDate: ''    // Can be calculated if needed
        };
      }
    } catch (e) {
      // Daf Yomi might not be available for this date
    }
    
    // Molad information
    try {
      const molad = jewishCalendar.getMolad();
      if (molad) {
        const moladHours = molad.getMoladHours();
        const moladMinutes = molad.getMoladMinutes();
        const moladChalakim = molad.getMoladChalakim();
        
        data.moladInfo = {
          molad: `${moladHours}:${moladMinutes.toString().padStart(2, '0')} + ${moladChalakim} chalakim`,
          hours: moladHours,
          minutes: moladMinutes,
          chalakim: moladChalakim,
          dayOfWeek: molad.getDayOfWeek()
        };
      }
    } catch (e) {
      // Molad might not be available
    }
    
    // Earliest Tallit and Tefillin times
    if (settings.displayEarliestTallit || settings.displayEarliestTefillin) {
      const misheyakir = calendar.getMisheyakir11Point5Degrees();
      if (misheyakir) {
        if (settings.displayEarliestTallit) {
          data.earliestTallit = this.formatTime(misheyakir, settings.use24HourFormat, settings.showSeconds);
        }
        if (settings.displayEarliestTefillin) {
          const earlierTime = calendar.getMisheyakir10Point2Degrees();
          data.earliestTefillin = this.formatTime(earlierTime || misheyakir, settings.use24HourFormat, settings.showSeconds);
        }
      }
    }
    
    return data;
  }

  /**
   * Obtenir les zmanim pour Shabbat
   */
  async getShabbatTimes(tenantId: string, fridayDate: Date = this.getNextFriday()) {
    const fridayZmanim = await this.getZmanimForDate(tenantId, fridayDate);
    
    const saturdayDate = new Date(fridayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 1);
    const saturdayZmanim = await this.getZmanimForDate(tenantId, saturdayDate);
    
    return {
      candleLighting: fridayZmanim.candleLighting,
      havdalah: saturdayZmanim.havdalah_72 || saturdayZmanim.tzeitHakochavim_72,
      parasha: fridayZmanim.parasha || saturdayZmanim.parasha,
      hebrewDate: fridayZmanim.hebrewDate,
    };
  }

  /**
   * Obtenir les zmanim de la semaine
   */
  async getWeeklyZmanim(tenantId: string, startDate: Date = new Date()) {
    const weekZmanim = [];
    const currentDate = new Date(startDate);
    
    // Aller au début de la semaine (dimanche)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      const zmanim = await this.getZmanimForDate(tenantId, date);
      weekZmanim.push({
        date: date.toISOString(),
        dayOfWeek: date.getDay(),
        zmanim,
      });
    }
    
    return weekZmanim;
  }

  /**
   * Formatage du temps
   */
  private formatTime(date: any, use24Hour = true, includeSeconds = false): string | undefined {
    if (!date) return undefined;
    
    // Si c'est un objet DateTime de kosher-zmanim, le convertir en Date
    let jsDate: Date;
    if (date.toJSDate) {
      jsDate = date.toJSDate();
    } else if (date instanceof Date) {
      jsDate = date;
    } else {
      return undefined;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return jsDate.toLocaleTimeString('fr-FR', options);
  }

  /**
   * Obtenir la parasha de la semaine
   */
  private getParasha(jewishCalendar: JewishCalendar): string {
    const parsha = jewishCalendar.getParsha();
    if (!parsha) return '';
    
    // Map parsha enum to French names
    const parshaNames: Record<number, string> = {
      1: 'Bereshit', 2: 'Noah', 3: 'Lekh Lekha', 4: 'Vayera', 5: 'Haye Sarah',
      6: 'Toledot', 7: 'Vayetze', 8: 'Vayishlah', 9: 'Vayeshev', 10: 'Miketz',
      11: 'Vayigash', 12: 'Vayehi', 13: 'Shemot', 14: 'Vaera', 15: 'Bo',
      16: 'Beshalah', 17: 'Yitro', 18: 'Mishpatim', 19: 'Teroumah', 20: 'Tetzaveh',
      21: 'Ki Tissa', 22: 'Vayakel', 23: 'Pekoude', 24: 'Vayikra', 25: 'Tzav',
      26: 'Shemini', 27: 'Tazria', 28: 'Metzora', 29: 'Ahare Mot', 30: 'Kedoshim',
      31: 'Emor', 32: 'Behar', 33: 'Behoukotai', 34: 'Bamidbar', 35: 'Naso',
      36: 'Behaalotekha', 37: 'Shelah', 38: 'Korah', 39: 'Houkat', 40: 'Balak',
      41: 'Pinhas', 42: 'Matot', 43: 'Massei', 44: 'Devarim', 45: 'Vaethanane',
      46: 'Ekev', 47: 'Reeh', 48: 'Shoftim', 49: 'Ki Tetze', 50: 'Ki Tavo',
      51: 'Nitzavim', 52: 'Vayelekh', 53: 'Haazinou', 54: 'Vezot Haberakha'
    };
    
    return parshaNames[parsha] || '';
  }

  /**
   * Obtenir le Yom Tov
   */
  private getYomTov(jewishCalendar: JewishCalendar): string | undefined {
    const yomTov = jewishCalendar.getYomTovIndex();
    if (yomTov === -1) return undefined;
    
    // Map yom tov to French names
    const yomTovNames: Record<number, string> = {
      0: 'Rosh Hashana',
      1: 'Yom Kippour',
      2: 'Souccot',
      3: 'Shemini Atseret',
      4: 'Simhat Torah',
      5: 'Hanoucca',
      6: 'Tou Bishvat',
      7: 'Pourim',
      8: 'Pessah',
      9: 'Lag BaOmer',
      10: 'Shavouot',
      11: 'Tisha BeAv'
    };
    
    return yomTovNames[yomTov];
  }

  /**
   * Vérifier si c'est Erev Shabbat ou Yom Tov
   */
  private isErevShabbatOrYomTov(date: Date, jewishCalendar: JewishCalendar): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || jewishCalendar.isErevYomTov();
  }

  /**
   * Vérifier si c'est Motzei Shabbat ou Yom Tov
   */
  private isMotzeiShabbatOrYomTov(date: Date, jewishCalendar: JewishCalendar): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 6 || jewishCalendar.isYomTov();
  }

  /**
   * Obtenir les informations sur le jeûne
   */
  private getFastInfo(jewishCalendar: JewishCalendar, calendar: ComplexZmanimCalendar, settings: any): { name: string; starts: string; ends: string } | null {
    if (!jewishCalendar.isTaanis()) return null;
    
    const fastNames: Record<number, string> = {
      1: 'Jeûne de Guedalia',
      2: 'Yom Kippour',
      3: 'Jeûne du 10 Tevet',
      4: 'Jeûne d\'Esther',
      5: 'Jeûne du 17 Tamouz',
      6: 'Tisha BeAv'
    };
    
    // Pour les jeûnes mineurs: du lever au coucher
    // Pour Yom Kippour et Tisha BeAv: de la veille au soir
    const fastStarts = this.formatTime(calendar.getAlos72(), settings.use24HourFormat, settings.showSeconds);
    const fastEnds = this.formatTime(calendar.getTzais(), settings.use24HourFormat, settings.showSeconds);
    
    return {
      name: 'Jour de jeûne',
      starts: fastStarts || '',
      ends: fastEnds || ''
    };
  }

  /**
   * Vérifier si c'est Shabbat
   */
  private isShabbat(jewishCalendar: JewishCalendar): boolean {
    // Dans kosher-zmanim, utiliser getDayOfWeek() qui retourne 1=Dimanche, 7=Samedi
    const dayOfWeek = jewishCalendar.getDayOfWeek();
    return dayOfWeek === 7; // Samedi (Shabbat)
  }

  /**
   * Obtenir le prochain vendredi
   */
  private getNextFriday(): Date {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilFriday);
    return date;
  }
}