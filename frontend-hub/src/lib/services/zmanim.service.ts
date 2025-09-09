import { 
  ComplexZmanimCalendar, 
  GeoLocation,
  JewishCalendar,
  HebrewDateFormatter,
  ZmanimFormatter,
  AstronomicalCalendar
} from 'kosher-zmanim';

export interface ZmanimData {
  // Aube
  alotHaShachar_72?: string;
  alotHaShachar_90?: string;
  alotHaShachar_120?: string;
  alotHaShachar_16_1?: string;
  
  // Misheyakir
  misheyakir_10_2?: string;
  misheyakir_11?: string;
  misheyakir_11_5?: string;
  
  // Lever
  hanetzHaChama?: string;
  hanetzHaChamaElevation?: string;
  
  // Shema
  sofZmanShmaGRA?: string;
  sofZmanShmaMGA?: string;
  sofZmanShmaFixedLocal?: string;
  
  // Tefila
  sofZmanTefilaGRA?: string;
  sofZmanTefilaMGA?: string;
  
  // Chatzot
  chatzot?: string;
  
  // Minha
  minchaGedola?: string;
  minchaKetana?: string;
  plagHaMincha?: string;
  
  // Coucher
  shkiatHaChama?: string;
  candleLighting?: string;
  
  // Sortie des étoiles
  tzeitHakochavim?: string;
  tzeitHakochavim_72?: string;
  tzeitHakochavim_RT?: string;
  
  // Informations juives
  hebrewDate?: string;
  parasha?: string;
  yomTov?: string;
  isShabbat?: boolean;
  havdalah?: string;
  
  // Compte du Omer
  omerCount?: number;
  
  // Rosh Hodesh
  isRoshChodesh?: boolean;
  
  // Jeûnes
  isFastDay?: boolean;
  fastName?: string;
  fastStarts?: string;
  fastEnds?: string;
}

export interface SynagogueLocation {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface ZmanimDisplaySettings {
  showSeconds?: boolean;
  use24HourFormat?: boolean;
  showHebrewDate?: boolean;
  showParasha?: boolean;
  selectedZmanim?: string[];
}

export class ZmanimService {
  private location: GeoLocation;
  private calendar: ComplexZmanimCalendar;
  private jewishCalendar: JewishCalendar;
  private hebrewFormatter: HebrewDateFormatter;
  private zmanimFormatter: ZmanimFormatter;
  
  constructor(location: SynagogueLocation) {
    this.location = new GeoLocation(
      location.name,
      location.latitude,
      location.longitude,
      location.elevation || 0,
      location.timezone || 'Europe/Paris'
    );
    
    this.calendar = new ComplexZmanimCalendar(this.location);
    this.jewishCalendar = new JewishCalendar();
    this.hebrewFormatter = new HebrewDateFormatter();
    this.zmanimFormatter = new ZmanimFormatter();
    
    // Configure Hebrew formatter
    this.hebrewFormatter.setHebrewFormat(true);
    this.hebrewFormatter.setTransliteratedMonthList([
      'Nissan', 'Iyar', 'Sivan', 'Tammouz', 'Av', 'Eloul',
      'Tishrei', 'Heshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
      'Adar II'
    ]);
  }
  
  /**
   * Obtenir tous les zmanim pour une date donnée
   */
  getZmanimForDate(date: Date = new Date()): ZmanimData {
    this.calendar.setDate(date);
    this.jewishCalendar.setDate(date);
    
    const data: ZmanimData = {
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
      
      // Informations juives
      hebrewDate: this.getHebrewDate(),
      parasha: this.getParasha(),
      yomTov: this.getYomTov(),
      isShabbat: this.jewishCalendar.isShabbos(),
      isRoshChodesh: this.jewishCalendar.isRoshChodesh(),
      omerCount: this.jewishCalendar.getDayOfOmer() || undefined,
    };
    
    // Allumage des bougies et Havdala pour Shabbat/Yom Tov
    if (this.isErevShabbatOrYomTov(date)) {
      const candleLightingTime = new Date(this.calendar.getSunset()!);
      candleLightingTime.setMinutes(candleLightingTime.getMinutes() - 18);
      data.candleLighting = this.formatTime(candleLightingTime);
    }
    
    if (this.isMotzeiShabbatOrYomTov(date)) {
      data.havdalah = this.formatTime(this.calendar.getTzais72());
    }
    
    // Jeûnes
    const fastInfo = this.getFastInfo();
    if (fastInfo) {
      data.isFastDay = true;
      data.fastName = fastInfo.name;
      data.fastStarts = fastInfo.starts;
      data.fastEnds = fastInfo.ends;
    }
    
    return data;
  }
  
  /**
   * Obtenir les zmanim essentiels (version simplifiée)
   */
  getEssentialZmanim(date: Date = new Date()): Partial<ZmanimData> {
    this.calendar.setDate(date);
    this.jewishCalendar.setDate(date);
    
    const data: Partial<ZmanimData> = {
      hanetzHaChama: this.formatTime(this.calendar.getSunrise()),
      sofZmanShmaGRA: this.formatTime(this.calendar.getSofZmanShmaGRA()),
      sofZmanTefilaGRA: this.formatTime(this.calendar.getSofZmanTfilaGRA()),
      chatzot: this.formatTime(this.calendar.getChatzos()),
      minchaGedola: this.formatTime(this.calendar.getMinchaGedola()),
      minchaKetana: this.formatTime(this.calendar.getMinchaKetana()),
      shkiatHaChama: this.formatTime(this.calendar.getSunset()),
      tzeitHakochavim: this.formatTime(this.calendar.getTzais()),
      hebrewDate: this.getHebrewDate(),
      parasha: this.getParasha(),
      isShabbat: this.jewishCalendar.isShabbos(),
    };
    
    if (this.isErevShabbatOrYomTov(date)) {
      const candleLightingTime = new Date(this.calendar.getSunset()!);
      candleLightingTime.setMinutes(candleLightingTime.getMinutes() - 18);
      data.candleLighting = this.formatTime(candleLightingTime);
    }
    
    return data;
  }
  
  /**
   * Obtenir les zmanim pour Shabbat
   */
  getShabbatTimes(fridayDate: Date): {
    candleLighting: string;
    havdalah: string;
    parasha: string;
  } {
    // Vendredi
    this.calendar.setDate(fridayDate);
    this.jewishCalendar.setDate(fridayDate);
    const candleLightingTime = new Date(this.calendar.getSunset()!);
    candleLightingTime.setMinutes(candleLightingTime.getMinutes() - 18);
    
    // Samedi
    const saturdayDate = new Date(fridayDate);
    saturdayDate.setDate(saturdayDate.getDate() + 1);
    this.calendar.setDate(saturdayDate);
    
    return {
      candleLighting: this.formatTime(candleLightingTime),
      havdalah: this.formatTime(this.calendar.getTzais72()),
      parasha: this.getParasha(),
    };
  }
  
  /**
   * Formatage du temps
   */
  private formatTime(date: Date | null, includeSeconds = false): string | undefined {
    if (!date) return undefined;
    
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return date.toLocaleTimeString('fr-FR', options);
  }
  
  /**
   * Obtenir la date hébraïque
   */
  private getHebrewDate(): string {
    const day = this.jewishCalendar.getJewishDayOfMonth();
    const month = this.hebrewFormatter.formatMonth(this.jewishCalendar);
    const year = this.jewishCalendar.getJewishYear();
    
    return `${day} ${month} ${year}`;
  }
  
  /**
   * Obtenir la parasha de la semaine
   */
  private getParasha(): string {
    const parsha = this.jewishCalendar.getParshah();
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
  private getYomTov(): string | undefined {
    const yomTov = this.jewishCalendar.getYomTovIndex();
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
  private isErevShabbatOrYomTov(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || this.jewishCalendar.isErevYomTov();
  }
  
  /**
   * Vérifier si c'est Motzei Shabbat ou Yom Tov
   */
  private isMotzeiShabbatOrYomTov(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 6 || this.jewishCalendar.isYomTov();
  }
  
  /**
   * Obtenir les informations sur le jeûne
   */
  private getFastInfo(): { name: string; starts: string; ends: string } | null {
    if (!this.jewishCalendar.isTaanis()) return null;
    
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
    const fastStarts = this.formatTime(this.calendar.getAlos72());
    const fastEnds = this.formatTime(this.calendar.getTzais());
    
    return {
      name: 'Jour de jeûne',
      starts: fastStarts || '',
      ends: fastEnds || ''
    };
  }
}