import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZmanimService } from './zmanim.service';

export interface PrayerSettingsDto {
  calculationMode?: string;
  roundingMode?: string;
  
  // Shaharit
  shaharitMode?: string;
  shaharitTime?: string;
  shaharitOffset?: number;
  shaharitWeekday?: string;
  shaharitShabbat?: string;
  shaharitYomTov?: string;
  
  // Minha
  minhaMode?: string;
  minhaTime?: string;
  minhaOffset?: number;
  minhaWeekday?: string;
  minhaShabbat?: string;
  minhaYomTov?: string;
  
  // Arvit
  arvitMode?: string;
  arvitTime?: string;
  arvitOffset?: number;
  arvitWeekday?: string;
  arvitShabbat?: string;
  
  // Selichot
  selichotEnabled?: boolean;
  selichotTime?: string;
  
  // Kriat Shema
  shemaMode?: string;
  shemaOffset?: number;
  
  // Notifications
  enableNotifications?: boolean;
  notificationMinutes?: number;
}

export interface PrayerTimes {
  shaharit?: string;
  minha?: string;
  arvit?: string;
  selichot?: string;
  musaf?: string;
  neilah?: string;
  kriatShema?: string;
  
  // Informations contextuelles
  dayType: string;
  date: Date;
  specialName?: string;
  notes?: string;
}

@Injectable()
export class PrayersService {
  constructor(
    private prisma: PrismaService,
    private zmanimService: ZmanimService,
  ) {}

  /**
   * Obtenir les paramètres de prières d'un tenant
   */
  async getSettings(tenantId: string) {
    const settings = await this.prisma.prayerSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      // Retourner des paramètres par défaut
      return {
        calculationMode: 'ZMANIM',
        roundingMode: 'NONE',
        shaharitMode: 'FIXED',
        shaharitTime: '07:00',
        shaharitWeekday: '06:30',
        shaharitShabbat: '08:30',
        minhaMode: 'BEFORE_SHKIA',
        minhaOffset: 20,
        arvitMode: 'AFTER_SHKIA',
        arvitOffset: 0,
        selichotEnabled: false,
        shemaMode: 'BEFORE_CHATZOT',
        shemaOffset: 45,
        enableNotifications: true,
        notificationMinutes: 10,
      };
    }

    return settings;
  }

  /**
   * Mettre à jour les paramètres de prières
   */
  async updateSettings(tenantId: string, data: PrayerSettingsDto) {
    const settings = await this.prisma.prayerSettings.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });

    // Recalculer les horaires pour les 30 prochains jours
    await this.generateSchedule(tenantId, new Date(), 30);

    return settings;
  }

  /**
   * Obtenir les horaires de prières pour une date donnée
   */
  async getPrayerTimes(tenantId: string, date: Date = new Date()): Promise<PrayerTimes> {
    // Vérifier d'abord s'il y a un horaire planifié
    const scheduled = await this.prisma.prayerSchedule.findUnique({
      where: {
        tenantId_date: {
          tenantId,
          date: this.dateOnly(date),
        },
      },
    });

    if (scheduled) {
      return {
        shaharit: scheduled.shaharit || undefined,
        minha: scheduled.minha || undefined,
        arvit: scheduled.arvit || undefined,
        selichot: scheduled.selichot || undefined,
        musaf: scheduled.musaf || undefined,
        neilah: scheduled.neilah || undefined,
        dayType: scheduled.dayType,
        date: scheduled.date,
        specialName: scheduled.specialName || undefined,
        notes: scheduled.notes || undefined,
      };
    }

    // Sinon, calculer les horaires
    return await this.calculatePrayerTimes(tenantId, date);
  }

  /**
   * Calculer les horaires de prières basés sur les Zmanim
   */
  async calculatePrayerTimes(tenantId: string, date: Date): Promise<PrayerTimes> {
    const settings = await this.getSettings(tenantId);
    const zmanim = await this.zmanimService.getZmanimForDate(tenantId, date);
    
    const dayType = this.getDayType(date, zmanim);
    const times: PrayerTimes = {
      dayType,
      date,
    };

    // Shaharit
    times.shaharit = await this.calculateShaharit(settings, zmanim, dayType);
    
    // Minha
    times.minha = await this.calculateMinha(settings, zmanim, dayType);
    
    // Arvit
    times.arvit = await this.calculateArvit(settings, zmanim, dayType);
    
    // Selichot (période avant Rosh Hashana)
    if (settings.selichotEnabled && this.isSelichotPeriod(date)) {
      times.selichot = (settings as any).selichotTime || '05:30';
    }
    
    // Musaf (Shabbat et Yom Tov)
    if (dayType === 'SHABBAT' || dayType === 'YOM_TOV') {
      times.musaf = this.addMinutesToTime(times.shaharit || '09:00', 120); // 2h après Shaharit
    }
    
    // Kriat Shema al HaMita
    if (settings.shemaMode === 'BEFORE_CHATZOT') {
      const chatzotLayla = this.calculateChatzotLayla(zmanim);
      if (chatzotLayla) {
        times.kriatShema = this.subtractMinutesFromTime(chatzotLayla, settings.shemaOffset || 45);
      }
    }

    // Appliquer l'arrondi si nécessaire
    if (settings.roundingMode !== 'NONE') {
      times.shaharit = this.roundTime(times.shaharit, settings.roundingMode);
      times.minha = this.roundTime(times.minha, settings.roundingMode);
      times.arvit = this.roundTime(times.arvit, settings.roundingMode);
      times.selichot = this.roundTime(times.selichot, settings.roundingMode);
      times.musaf = this.roundTime(times.musaf, settings.roundingMode);
    }

    return times;
  }

  /**
   * Calculer l'heure de Shaharit
   */
  private async calculateShaharit(settings: any, zmanim: any, dayType: string): Promise<string | undefined> {
    // Heure spécifique selon le jour
    if (dayType === 'SHABBAT' && settings.shaharitShabbat) {
      return settings.shaharitShabbat;
    }
    if (dayType === 'YOM_TOV' && settings.shaharitYomTov) {
      return settings.shaharitYomTov;
    }
    if (dayType === 'WEEKDAY' && settings.shaharitWeekday) {
      return settings.shaharitWeekday;
    }

    // Mode de calcul
    switch (settings.shaharitMode) {
      case 'BEFORE_NETZ':
        // X minutes avant le lever du soleil (Vatikin)
        if (zmanim.hanetzHaChama) {
          return this.subtractMinutesFromTime(zmanim.hanetzHaChama, settings.shaharitOffset || 30);
        }
        break;
      
      case 'AFTER_NETZ':
        // X minutes après le lever du soleil
        if (zmanim.hanetzHaChama) {
          return this.addMinutesToTime(zmanim.hanetzHaChama, settings.shaharitOffset || 0);
        }
        break;
      
      case 'BEFORE_SHEMA_GRA':
        // X minutes avant la fin du Shema selon le GRA
        if (zmanim.sofZmanShmaGRA) {
          return this.subtractMinutesFromTime(zmanim.sofZmanShmaGRA, settings.shaharitOffset || 45);
        }
        break;
      
      case 'BEFORE_SHEMA_MGA':
        // X minutes avant la fin du Shema selon le Magen Avraham
        if (zmanim.sofZmanShmaMGA) {
          return this.subtractMinutesFromTime(zmanim.sofZmanShmaMGA, settings.shaharitOffset || 45);
        }
        break;
      
      case 'FIXED':
      default:
        return settings.shaharitTime || '07:00';
    }

    // Fallback si le calcul échoue
    return settings.shaharitTime || '07:00';
  }

  /**
   * Calculer l'heure de Minha
   */
  private async calculateMinha(settings: any, zmanim: any, dayType: string): Promise<string | undefined> {
    // Heure spécifique selon le jour
    if (dayType === 'SHABBAT' && settings.minhaShabbat) {
      return settings.minhaShabbat;
    }
    if (dayType === 'YOM_TOV' && settings.minhaYomTov) {
      return settings.minhaYomTov;
    }
    if (dayType === 'WEEKDAY' && settings.minhaWeekday) {
      return settings.minhaWeekday;
    }

    // Mode de calcul
    switch (settings.minhaMode) {
      case 'BEFORE_SHKIA':
        if (zmanim.shkiatHaChama) {
          return this.subtractMinutesFromTime(zmanim.shkiatHaChama, settings.minhaOffset || 20);
        }
        break;
      
      case 'ZMANIM_BASED':
        return zmanim.minchaKetana || zmanim.minchaGedola;
      
      case 'FIXED':
      default:
        return settings.minhaTime || '18:30';
    }
  }

  /**
   * Calculer l'heure d'Arvit
   */
  private async calculateArvit(settings: any, zmanim: any, dayType: string): Promise<string | undefined> {
    // Motzei Shabbat
    if (dayType === 'MOTZEI_SHABBAT' && settings.arvitShabbat) {
      return settings.arvitShabbat;
    }
    if (dayType === 'WEEKDAY' && settings.arvitWeekday) {
      return settings.arvitWeekday;
    }

    // Mode de calcul
    switch (settings.arvitMode) {
      case 'AFTER_SHKIA':
        if (zmanim.shkiatHaChama) {
          return this.addMinutesToTime(zmanim.shkiatHaChama, settings.arvitOffset || 0);
        }
        break;
      
      case 'AFTER_TZET':
        if (zmanim.tzeitHakochavim) {
          return this.addMinutesToTime(zmanim.tzeitHakochavim, settings.arvitOffset || 0);
        }
        break;
      
      case 'FIXED':
      default:
        return settings.arvitTime || '20:00';
    }
  }

  /**
   * Générer le planning de prières pour plusieurs jours
   */
  async generateSchedule(tenantId: string, startDate: Date, days: number) {
    const schedules = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const times = await this.calculatePrayerTimes(tenantId, date);
      
      const settingsData = await this.getSettings(tenantId);
      schedules.push({
        tenantId,
        settingsId: (settingsData as any).id || tenantId,
        date: this.dateOnly(date),
        dayType: times.dayType,
        shaharit: times.shaharit,
        minha: times.minha,
        arvit: times.arvit,
        selichot: times.selichot,
        musaf: times.musaf,
        neilah: times.neilah,
        notes: times.notes,
        isSpecial: !!times.specialName,
        specialName: times.specialName,
      });
    }

    // Sauvegarder en base
    for (const schedule of schedules) {
      await this.prisma.prayerSchedule.upsert({
        where: {
          tenantId_date: {
            tenantId: schedule.tenantId,
            date: schedule.date,
          },
        },
        update: schedule,
        create: schedule,
      });
    }

    return schedules;
  }

  /**
   * Obtenir les horaires de la semaine
   */
  async getWeeklySchedule(tenantId: string, startDate: Date = new Date()) {
    const schedules = [];
    const start = this.getStartOfWeek(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      const times = await this.getPrayerTimes(tenantId, date);
      schedules.push({
        ...times,
        dayOfWeek: date.getDay(),
        dayName: this.getDayName(date),
      });
    }
    
    return schedules;
  }

  /**
   * Obtenir les horaires du mois
   */
  async getMonthlySchedule(tenantId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const schedules = await this.prisma.prayerSchedule.findMany({
      where: {
        tenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
    
    // Si pas assez de données, générer
    if (schedules.length < endDate.getDate()) {
      await this.generateSchedule(tenantId, startDate, endDate.getDate());
      return this.getMonthlySchedule(tenantId, year, month);
    }
    
    return schedules;
  }

  // Méthodes utilitaires

  private getDayType(date: Date, zmanim: any): string {
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 6) return 'SHABBAT';
    if (dayOfWeek === 0 && zmanim.havdalah) return 'MOTZEI_SHABBAT';
    if (zmanim.yomTov) return 'YOM_TOV';
    if (zmanim.isFastDay) return 'FAST_DAY';
    
    return 'WEEKDAY';
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  private subtractMinutesFromTime(time: string, minutes: number): string {
    return this.addMinutesToTime(time, -minutes);
  }

  private roundTime(time: string | undefined, mode: string): string | undefined {
    if (!time) return undefined;
    
    const [hours, mins] = time.split(':').map(Number);
    let roundedMins = mins;
    
    if (mode === 'FIVE_MIN') {
      roundedMins = Math.round(mins / 5) * 5;
    } else if (mode === 'TEN_MIN') {
      roundedMins = Math.round(mins / 10) * 10;
    }
    
    if (roundedMins === 60) {
      return `${String((hours + 1) % 24).padStart(2, '0')}:00`;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(roundedMins).padStart(2, '0')}`;
  }

  private calculateChatzotLayla(zmanim: any): string | undefined {
    // Chatzot Layla est minuit solaire (12h après Chatzot du jour)
    if (zmanim.chatzot) {
      return this.addMinutesToTime(zmanim.chatzot, 12 * 60);
    }
    return undefined;
  }

  private isSelichotPeriod(date: Date): boolean {
    // Période de Selichot : du samedi soir avant Rosh Hashana jusqu'à Yom Kippour
    // Simplifié ici - devrait utiliser le calendrier hébraïque
    const month = date.getMonth();
    const day = date.getDate();
    
    // Approximativement en septembre
    return month === 8 && day >= 1 && day <= 20;
  }

  private dateOnly(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private getDayName(date: Date): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Shabbat'];
    return days[date.getDay()];
  }
}