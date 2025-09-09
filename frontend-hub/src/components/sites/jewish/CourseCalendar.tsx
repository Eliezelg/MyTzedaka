'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Book, Video, Globe, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModule } from '@/providers/tenant-provider';

interface Course {
  id: string;
  title: string;
  description?: string;
  rabbi?: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  roomId?: string;
  location?: string;
  type: 'TALMUD' | 'TORAH' | 'HALAKHA' | 'MOUSSAR' | 'HASSIDOUT' | 'KABBALAH' | 'HEBREW' | 'YOUTH' | 'WOMEN' | 'OTHER';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  language: string;
  isOnline: boolean;
  zoomLink?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isActive: boolean;
  materials?: string[];
  nextSession?: Date;
}

interface CourseCalendarProps {
  tenantId: string;
  view?: 'week' | 'list' | 'compact';
  filterByType?: string;
  filterByLevel?: string;
}

const courseTypeLabels = {
  TALMUD: 'Talmud',
  TORAH: 'Torah',
  HALAKHA: 'Halakha',
  MOUSSAR: 'Moussar',
  HASSIDOUT: 'Hassidout',
  KABBALAH: 'Kabbale',
  HEBREW: 'Hébreu',
  YOUTH: 'Jeunesse',
  WOMEN: 'Femmes',
  OTHER: 'Autre'
};

const courseLevelLabels = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  ALL_LEVELS: 'Tous niveaux'
};

const courseTypeColors = {
  TALMUD: 'bg-purple-100 text-purple-800',
  TORAH: 'bg-blue-100 text-blue-800',
  HALAKHA: 'bg-green-100 text-green-800',
  MOUSSAR: 'bg-yellow-100 text-yellow-800',
  HASSIDOUT: 'bg-indigo-100 text-indigo-800',
  KABBALAH: 'bg-pink-100 text-pink-800',
  HEBREW: 'bg-orange-100 text-orange-800',
  YOUTH: 'bg-teal-100 text-teal-800',
  WOMEN: 'bg-rose-100 text-rose-800',
  OTHER: 'bg-gray-100 text-gray-800'
};

const courseLevelColors = {
  BEGINNER: 'border-green-500',
  INTERMEDIATE: 'border-yellow-500',
  ADVANCED: 'border-red-500',
  ALL_LEVELS: 'border-blue-500'
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function CourseCalendar({ 
  tenantId, 
  view = 'list',
  filterByType,
  filterByLevel
}: CourseCalendarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(filterByType || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>(filterByLevel || 'all');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [currentView, setCurrentView] = useState(view);
  const isModuleEnabled = useModule('courses');

  useEffect(() => {
    if (!isModuleEnabled) return;
    
    const loadCourses = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}/courses`
        );
        
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          // Use mock data for demo
          setCourses(getMockCourses());
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses(getMockCourses());
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [tenantId, isModuleEnabled]);

  useEffect(() => {
    let filtered = [...courses];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter(course => course.dayOfWeek === selectedDay);
    }

    // Sort by day and time
    filtered.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    setFilteredCourses(filtered);
  }, [courses, selectedType, selectedLevel, selectedDay]);

  const getMockCourses = (): Course[] => {
    return [
      {
        id: '1',
        title: 'Guemara Berakhot',
        description: 'Étude approfondie du traité Berakhot',
        rabbi: 'Rav Cohen',
        dayOfWeek: 1,
        startTime: '20:00',
        endTime: '21:30',
        location: 'Beit Midrash',
        type: 'TALMUD',
        level: 'INTERMEDIATE',
        language: 'fr',
        isOnline: false,
        maxParticipants: 30,
        currentParticipants: 18,
        isActive: true
      },
      {
        id: '2',
        title: 'Parashat Hashavoua',
        description: 'Étude de la portion hebdomadaire',
        rabbi: 'Rav Levy',
        dayOfWeek: 3,
        startTime: '19:30',
        endTime: '20:30',
        location: 'Salle principale',
        type: 'TORAH',
        level: 'ALL_LEVELS',
        language: 'fr',
        isOnline: true,
        zoomLink: 'https://zoom.us/j/123456789',
        isActive: true
      },
      {
        id: '3',
        title: 'Halakha Yomit',
        description: 'Lois quotidiennes',
        rabbi: 'Rav Goldstein',
        dayOfWeek: 0,
        startTime: '07:30',
        endTime: '08:00',
        location: 'Salle 2',
        type: 'HALAKHA',
        level: 'BEGINNER',
        language: 'fr',
        isOnline: false,
        isActive: true
      },
      {
        id: '4',
        title: 'Cours de Hébreu',
        description: 'Apprentissage de l\'hébreu moderne',
        rabbi: 'Morah Sarah',
        dayOfWeek: 2,
        startTime: '18:00',
        endTime: '19:00',
        location: 'Salle 3',
        type: 'HEBREW',
        level: 'BEGINNER',
        language: 'fr',
        isOnline: false,
        maxParticipants: 15,
        currentParticipants: 12,
        isActive: true
      },
      {
        id: '5',
        title: 'Tanya',
        description: 'Étude du Tanya',
        rabbi: 'Rav Schneerson',
        dayOfWeek: 4,
        startTime: '20:30',
        endTime: '21:30',
        location: 'Beit Midrash',
        type: 'HASSIDOUT',
        level: 'ADVANCED',
        language: 'fr',
        isOnline: true,
        zoomLink: 'https://zoom.us/j/987654321',
        isActive: true
      },
      {
        id: '6',
        title: 'Cours pour Femmes',
        description: 'Pensée juive et actualité',
        rabbi: 'Rabbanit Miriam',
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '11:30',
        location: 'Salle des femmes',
        type: 'WOMEN',
        level: 'ALL_LEVELS',
        language: 'fr',
        isOnline: false,
        isActive: true
      }
    ];
  };

  if (!isModuleEnabled) return null;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  const getNextOccurrence = (course: Course): Date => {
    const now = new Date();
    const currentDay = now.getDay();
    let daysUntilNext = course.dayOfWeek - currentDay;
    
    if (daysUntilNext < 0 || (daysUntilNext === 0 && course.startTime <= now.toTimeString().slice(0, 5))) {
      daysUntilNext += 7;
    }
    
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysUntilNext);
    const [hours, minutes] = course.startTime.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
    
    return nextDate;
  };

  if (currentView === 'compact') {
    // Version compacte pour la homepage
    const upcomingCourses = filteredCourses
      .map(course => ({ ...course, nextSession: getNextOccurrence(course) }))
      .sort((a, b) => a.nextSession.getTime() - b.nextSession.getTime())
      .slice(0, 3);

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Book className="h-4 w-4" />
            Prochains Cours
          </h3>
        </div>
        
        <div className="space-y-3">
          {upcomingCourses.map(course => (
            <div key={course.id} className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0">
                <Badge variant="secondary" className={`text-xs ${courseTypeColors[course.type]}`}>
                  {courseTypeLabels[course.type]}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{course.title}</div>
                <div className="text-gray-500">
                  {daysOfWeek[course.dayOfWeek]} {course.startTime}
                  {course.rabbi && ` • ${course.rabbi}`}
                </div>
              </div>
              {course.isOnline && (
                <Video className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-3 text-xs"
          onClick={() => window.location.href = '/courses'}
        >
          Voir tous les cours →
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Planning des Cours
          </h2>
          <div className="flex gap-2">
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('list')}
            >
              Liste
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('week')}
            >
              Semaine
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les types</option>
            {Object.entries(courseTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les niveaux</option>
            {Object.entries(courseLevelLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les jours</option>
            {daysOfWeek.map((day, index) => (
              <option key={index} value={index}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Display */}
      {currentView === 'list' ? (
        // List View
        <div className="space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun cours ne correspond aux critères</p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div key={course.id} className={`border-l-4 ${courseLevelColors[course.level]} bg-white rounded-lg p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={courseTypeColors[course.type]}>
                        {courseTypeLabels[course.type]}
                      </Badge>
                      <Badge variant="outline">
                        {courseLevelLabels[course.level]}
                      </Badge>
                      {course.isOnline && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Video className="h-3 w-3 mr-1" />
                          En ligne
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {course.rabbi && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.rabbi}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{daysOfWeek[course.dayOfWeek]}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.startTime} - {course.endTime}</span>
                      </div>
                      
                      {course.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{course.location}</span>
                        </div>
                      )}
                      
                      {course.maxParticipants && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {course.currentParticipants || 0}/{course.maxParticipants} participants
                          </span>
                        </div>
                      )}
                    </div>

                    {course.isOnline && course.zoomLink && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline" asChild>
                          <a href={course.zoomLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Rejoindre en ligne
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Week View
        <WeekView courses={filteredCourses} />
      )}
    </Card>
  );
}

// Week View Component
function WeekView({ courses }: { courses: Course[] }) {
  const timeSlots = [];
  for (let hour = 7; hour <= 22; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
  }

  const getCoursePosition = (course: Course) => {
    const [hours, minutes] = course.startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const baseMinutes = 7 * 60; // 7:00 AM
    const top = ((startMinutes - baseMinutes) / 60) * 60; // 60px per hour
    
    const [endHours, endMinutes] = course.endTime.split(':').map(Number);
    const duration = (endHours * 60 + endMinutes) - startMinutes;
    const height = (duration / 60) * 60;
    
    return { top, height };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-sm font-medium text-gray-500">Heure</div>
          {daysOfWeek.map((day, index) => (
            <div key={index} className="p-2 text-sm font-medium text-center border-l">
              {day}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative">
          {timeSlots.map((time, index) => (
            <div key={time} className="grid grid-cols-8 h-[60px] border-b">
              <div className="p-2 text-xs text-gray-500">{time}</div>
              {daysOfWeek.map((_, dayIndex) => (
                <div key={dayIndex} className="border-l relative">
                  {index === 0 && (
                    <div className="absolute inset-0">
                      {courses
                        .filter(course => course.dayOfWeek === dayIndex)
                        .map(course => {
                          const { top, height } = getCoursePosition(course);
                          return (
                            <div
                              key={course.id}
                              className={`absolute left-1 right-1 p-1 rounded text-xs ${courseTypeColors[course.type]} border ${courseLevelColors[course.level]}`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                            >
                              <div className="font-semibold truncate">{course.title}</div>
                              <div className="truncate">{course.startTime}</div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}