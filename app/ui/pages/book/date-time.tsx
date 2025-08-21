import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useFetcher } from 'react-router';
import ProgressIndicator from '../../components/progress-indicator';

// Generate available dates for the next 30 days (excluding weekends)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  let currentDate = new Date(today);

  // Start from tomorrow
  currentDate.setDate(currentDate.getDate() + 1);

  while (dates.length < 20) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Get appointment duration from appointment type
const getAppointmentDuration = (appointmentType: string): number => {
  switch (appointmentType) {
    case 'phone-consultation':
      return 10; // 10 minutes
    case 'refraction-exam':
      return 30; // 30 minutes
    case 'visual-efficiency-eval':
    case 'child-exam':
    case 'contact-lens':
    case 'sports-vision':
      return 60; // 60 minutes
    default:
      return 30; // default to 30 minutes
  }
};

// Generate time slots based on appointment duration (9 AM - 12 PM only)
const generateTimeSlots = (durationMinutes: number): string[] => {
  const slots: string[] = [];
  const startHour = 9; // 9 AM
  const endHour = 12; // 12 PM (noon)
  
  let currentTime = startHour * 60; // Convert to minutes (9:00 = 540 minutes)
  const endTime = endHour * 60; // Convert to minutes (12:00 = 720 minutes)
  
  while (currentTime + durationMinutes <= endTime) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    slots.push(timeString);
    currentTime += durationMinutes;
  }
  
  return slots;
};

const appointmentTypes = {
  'phone-consultation': 'Cita telefónica',
  'refraction-exam': 'Cita refracción',
  'visual-efficiency-eval': 'Cita Evaluación de eficacia visual',
  'child-exam': 'Cita Examen Infantil',
  'contact-lens': 'Cita Contactología',
  'sports-vision': 'Cita Visión Deportiva',
};

export default function DateTimeSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const appointmentType = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  const availableDates = generateAvailableDates();
  
  // Generate time slots based on appointment type duration
  const appointmentDuration = getAppointmentDuration(appointmentType);
  const timeSlots = generateTimeSlots(appointmentDuration);

  // Fetch existing appointments on component mount
  useEffect(() => {
    fetcher.load('/api/appointments');
  }, [fetcher]);

  // Update booked slots when data is fetched
  useEffect(() => {
    if (fetcher.data && fetcher.data.appointments) {
      const booked = new Set<string>();
      fetcher.data.appointments.forEach((apt: { date: string; time: string; location: string }) => {
        const aptDate = new Date(apt.date);
        const dateKey = `${aptDate.toISOString().split('T')[0]}-${apt.time}-${apt.location}`;
        booked.add(dateKey);
      });
      setBookedSlots(booked);
    }
  }, [fetcher.data]);

  // Check if a time slot is available
  const isTimeSlotAvailable = (date: Date, time: string): boolean => {
    const dateKey = `${date.toISOString().split('T')[0]}-${time}-${location}`;
    return !bookedSlots.has(dateKey);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const params = new URLSearchParams();
      params.set('type', appointmentType);
      params.set('location', location);
      params.set('date', selectedDate.toISOString());
      params.set('time', selectedTime);
      navigate(`/cita/contacto?${params.toString()}`);
    }
  };

  const canContinue = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/cita/centro?type=${appointmentType}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
            >
              ← Volver
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">
                Óptica Suárez
              </h1>
              <p className="text-sm text-gray-600">Reservar cita</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator currentStep={3} totalSteps={5} />
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Selecciona fecha y hora
            </h2>
            <p className="text-gray-600 mt-2">
              Tipo de cita:{' '}
              <span className="font-medium">
                {
                  appointmentTypes[
                    appointmentType as keyof typeof appointmentTypes
                  ]
                }
              </span>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fechas disponibles
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {availableDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedDate &&
                    selectedDate.toDateString() === date.toDateString()
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="font-medium">{formatDateShort(date)}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {formatDate(date)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horarios disponibles
              {selectedDate && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {formatDate(selectedDate)}
                </span>
              )}
            </h3>

            {!selectedDate ? (
              <div className="text-gray-500 italic">
                Selecciona una fecha para ver los horarios disponibles
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {timeSlots.map((time) => {
                  const isAvailable = isTimeSlotAvailable(selectedDate, time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      onClick={() => isAvailable ? setSelectedTime(time) : null}
                      disabled={!isAvailable}
                      className={`p-3 text-center rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : isAvailable
                          ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{time}</div>
                      {!isAvailable && (
                        <div className="text-xs text-gray-400 mt-1">No disponible</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Link
            to="/cita"
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Volver
          </Link>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </main>
    </div>
  );
}
