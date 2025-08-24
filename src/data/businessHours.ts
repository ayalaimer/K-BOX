export interface BusinessHours {
  day: string;
  hours: string;
  openTime: number; // 24-hour format (18 = 6 PM)
  closeTime: number; // 24-hour format (24 = midnight)
  isOpen: boolean;
}

export const businessHours: BusinessHours[] = [
  { day: "א-ה", hours: "18:00 - 00:00", openTime: 18, closeTime: 24, isOpen: true },
  { day: "ו", hours: "10:00 - 15:00", openTime: 10, closeTime: 15, isOpen: true },
  { day: "ש", hours: "סגור", openTime: 0, closeTime: 0, isOpen: false }
];

// Get day of week (0 = Sunday, 6 = Saturday) 
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// Get business hours for a specific date
export const getBusinessHoursForDate = (date: Date): BusinessHours | null => {
  const dayOfWeek = getDayOfWeek(date);
  
  if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Sunday to Thursday
    return businessHours[0]; // א-ה
  } else if (dayOfWeek === 5) { // Friday
    return businessHours[1]; // ו
  } else { // Saturday
    return businessHours[2]; // ש
  }
};

// Generate available time slots for a specific date
export const getAvailableTimeSlots = (date: Date): string[] => {
  const dayHours = getBusinessHoursForDate(date);
  
  if (!dayHours || !dayHours.isOpen) {
    return [];
  }
  
  const slots: string[] = [];
  for (let hour = dayHours.openTime; hour < dayHours.closeTime; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
};

// Check if a booking time and duration is valid
export const isValidBookingTime = (date: Date, startTime: string, durationHours: number): boolean => {
  const dayHours = getBusinessHoursForDate(date);
  
  if (!dayHours || !dayHours.isOpen) {
    return false;
  }
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = startHour + durationHours;
  
  return startHour >= dayHours.openTime && endHour <= dayHours.closeTime;
};

// Get validation message for invalid booking
export const getValidationMessage = (date: Date, startTime: string, durationHours: number): string => {
  const dayHours = getBusinessHoursForDate(date);
  const dayOfWeek = getDayOfWeek(date);
  
  if (dayOfWeek === 6) { // Saturday
    return "אנחנו סגורים בימי שבת. אנא בחרו יום אחר.";
  }
  
  if (!dayHours || !dayHours.isOpen) {
    return "אנחנו סגורים ביום זה. אנא בחרו יום אחר.";
  }
  
  if (!startTime || !durationHours) {
    return "";
  }
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = startHour + durationHours;
  
  if (endHour > dayHours.closeTime) {
    return `הזמן שבחרתם חורג משעות הפתיחה. אנחנו סוגרים ב-${dayHours.closeTime === 24 ? '00:00' : dayHours.closeTime.toString().padStart(2, '0') + ':00'}.`;
  }
  
  return "";
};