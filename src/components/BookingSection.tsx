import { useState, useEffect, useMemo, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CalendarIcon, Check, Phone, MessageSquare, Search, AlertCircle, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessHoursForDate } from "@/hooks/useBusinessHoursForDate";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { logInfo, logWarn, logError } from "@/lib/logging";

type DbRoom = {
  id: string;
  name: string;
  capacity: number;
  price_per_hour: number;
  is_active: boolean;
};

export const BookingSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const durations = useMemo(() => [
    { value: "1", label: t('bookingSection.durations.oneHour'), price: 1 },
    { value: "2", label: t('bookingSection.durations.twoHours'), price: 1.8 },
    { value: "3", label: t('bookingSection.durations.threeHours'), price: 2.5 },
    { value: "4", label: t('bookingSection.durations.fourHours'), price: 3 },
  ], [t]);

  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [guests, setGuests] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearestSuggestion, setNearestSuggestion] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<DbRoom | null>(null);

  const { hours: bizHours, isLoading: hoursLoading } = useBusinessHoursForDate(date);

  const hoursLabel = useMemo(() => {
    if (!date) return null;
    if (!bizHours) return null;
    if (!bizHours.is_open) return "סגור";
    const pad = (n: number) => String(n).padStart(2, '0');
    const open = `${pad(bizHours.open_time_hour)}:00`;
    const close = bizHours.close_time_hour === 24 ? "00:00" : `${pad(bizHours.close_time_hour)}:00`;
    return `${open} - ${close}`;
  }, [date, bizHours]);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    date?: string;
    time?: string;
    duration?: string;
    guests?: string;
    name?: string;
    phone?: string;
  }>({});

  // Refs for focusing invalid fields
  const dateRef = useRef<HTMLButtonElement>(null);
  const timeRef = useRef<HTMLButtonElement>(null);
  const durationRef = useRef<HTMLButtonElement>(null);
  const guestsRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Load active rooms from DB
  const roomsQuery = useQuery({
    queryKey: ['rooms-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, capacity, price_per_hour, is_active')
        .eq('is_active', true);
      if (error) throw error;
      return (data || []) as DbRoom[];
    },
  });

  // Update available time slots when date or business hours change
  useEffect(() => {
    if (!date || !bizHours || !bizHours.is_open) {
      setAvailableTimeSlots([]);
      return;
    }
    const open = bizHours.open_time_hour;
    const close = bizHours.close_time_hour;
    const slots: string[] = [];
    for (let h = open; h < close; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
    }
    setAvailableTimeSlots(slots);

    // Reset time selection if current time is not available
    if (selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime("");
    }

    // Reset availability check
    setIsAvailable(null);
    setValidationError("");
    setBookingResult(null);
  }, [date, selectedTime, bizHours]);

  // Validate booking when time or duration changes
  useEffect(() => {
    if (!(date && selectedTime && selectedDuration)) {
      setValidationError("");
      return;
    }
    if (!bizHours || !bizHours.is_open) {
      setValidationError("אנחנו סגורים ביום זה. אנא בחרו יום אחר.");
      setIsAvailable(null);
      return;
    }
    const durationHours = parseInt(selectedDuration, 10);
    const startHour = parseInt(selectedTime.split(':')[0], 10);
    const endHour = startHour + durationHours;

    if (startHour < bizHours.open_time_hour || endHour > bizHours.close_time_hour) {
      const closing = bizHours.close_time_hour === 24 ? '00:00' : `${String(bizHours.close_time_hour).padStart(2,'0')}:00`;
      setValidationError(`הזמן שבחרתם חורג משעות הפתיחה. אנחנו סוגרים ב-${closing}.`);
      setIsAvailable(null);
    } else {
      setValidationError("");
    }
  }, [date, selectedTime, selectedDuration, bizHours]);

  // Find the best available room based on guest count
  const findBestRoomByCapacity = () => {
    if (!guests) return null;
    const guestCount = parseInt(guests);
    const rooms = roomsQuery.data || [];
    const suitable = rooms.filter(r => r.capacity >= guestCount);
    if (suitable.length === 0) return null;
    return suitable.sort((a, b) => a.capacity - b.capacity)[0];
  };

  const calculatePrice = () => {
    if (!selectedDuration) return 0;
    const bestRoom = findBestRoomByCapacity();
    if (!bestRoom) return 0;
    const durationMultiplier = durations.find(d => d.value === selectedDuration)?.price || 1;
    return Math.round(Number(bestRoom.price_per_hour) * durationMultiplier);
  };

  const resetSearch = () => {
    setIsAvailable(null);
    setShowContactForm(false);
    setBookingResult(null);
    setNearestSuggestion(null);
  };

  const computeNearestAvailable = (
    openTime: number,
    closeTime: number,
    duration: number,
    booked: Array<{ start: number; end: number }>,
    requestedStart: number
  ): string | null => {
    const candidates: number[] = [];
    for (let h = openTime; h <= closeTime - duration; h++) {
      const end = h + duration;
      const overlaps = booked.some(({ start, end: bEnd }) => h < bEnd && end > start);
      if (!overlaps) candidates.push(h);
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      const da = Math.abs(a - requestedStart);
      const db = Math.abs(b - requestedStart);
      if (da === db) return a - b; // prefer earlier on tie
      return da - db;
    });
    const best = candidates[0];
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(best)}:00–${pad(best + duration)}:00`;
  };

  const focusFirstInvalid = (errs: Record<string, string>) => {
    if (errs.date) return dateRef.current?.focus();
    if (errs.time) return timeRef.current?.focus();
    if (errs.duration) return durationRef.current?.focus();
    if (errs.guests) return guestsRef.current?.focus();
    if (errs.name) return nameRef.current?.focus();
    if (errs.phone) return phoneRef.current?.focus();
  };

  const validateBeforeCheck = () => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'נא לבחור תאריך';
    if (!selectedTime) errs.time = 'נא לבחור שעה';
    if (!selectedDuration) errs.duration = 'נא לבחור משך';
    if (!guests) errs.guests = 'נא לבחור כמות אורחים';

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ title: 'שדות חסרים', description: 'אנא מלא/י את השדות המסומנים.' });
      focusFirstInvalid(errs);
      return false;
    }
    return true;
  };

  const validateBeforeConfirm = () => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'נא לבחור תאריך';
    if (!selectedTime) errs.time = 'נא לבחור שעה';
    if (!selectedDuration) errs.duration = 'נא לבחור משך';
    if (!guests) errs.guests = 'נא לבחור כמות אורחים';
    if (!name) errs.name = 'נא למלא שם מלא';
    if (!phone) errs.phone = 'נא למלא מספר טלפון';

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ title: 'שדות חסרים', description: 'אנא מלא/י את השדות המסומנים.' });
      focusFirstInvalid(errs);
      return false;
    }
    return true;
  };

  const handleBookingCheck = async () => {
    // Prevent click during rooms loading
    if (roomsQuery.isLoading) {
      toast({
        title: "טוען חדרים",
        description: "אנא נסה/י שוב בעוד רגע.",
      });
      return;
    }
    // Validate required fields and highlight missing ones
    if (!validateBeforeCheck()) {
      return;
    }
    const bestRoom = findBestRoomByCapacity();
    if (!bestRoom) {
      toast({
        title: "אין חדר מתאים",
        description: "לא נמצא חדר שמתאים לכמות האורחים.",
      });
      setNearestSuggestion(null);
      return;
    }

    const durationHours = parseInt(selectedDuration);
    const bookingDate = format(date, "yyyy-MM-dd");
    const startTime = `${selectedTime}:00`;

    try {
      // Use secure RPC to check availability and get nearest suggestion
      const { data, error } = await supabase.rpc('check_availability_and_suggest', {
        p_room_id: bestRoom.id,
        p_booking_date: bookingDate,
        p_start_time: startTime,
        p_duration_hours: durationHours,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data?.[0] : data;
      if (!row) {
        setIsAvailable(false);
        setNearestSuggestion(null);
        return;
      }

      if (row.available) {
        setIsAvailable(true);
        setNearestSuggestion(null);
      } else {
        const formatRange = (s?: string, e?: string) => {
          if (!s || !e) return null;
          const pad = (n: number) => String(n).padStart(2, '0');
          const [sh] = s.split(':').map((v: string) => parseInt(v, 10));
          const [eh] = e.split(':').map((v: string) => parseInt(v, 10));
          return `${pad(sh)}:00–${pad(eh)}:00`;
        };
        const suggestion = formatRange(row.suggested_start_time, row.suggested_end_time);
        setIsAvailable(false);
        setNearestSuggestion(suggestion);
        setShowContactForm(false);
      }
    } catch (e) {
      console.warn('Availability check failed', e);
      setIsAvailable(false);
      setNearestSuggestion(null);
    }
  };
  const handleConfirmReservation = async () => {
    if (!validateBeforeConfirm()) return;

    const bestRoom = findBestRoomByCapacity();
    if (!bestRoom) {
      setIsAvailable(false);
      toast({
        title: "אין חדר מתאים",
        description: "לא נמצא חדר פנוי שמתאים לכמות האורחים.",
      });
      return;
    }

    const bookingDate = format(date, "yyyy-MM-dd");
    const startTime = `${selectedTime}:00`;
    const durationHours = parseInt(selectedDuration);

    setIsSubmitting(true);
    setBookingResult(null);

    await logInfo('Reserve booking attempt', {
      component: 'BookingSection',
      context: {
        booking_date: bookingDate,
        start_time: startTime,
        duration_hours: durationHours,
        room_id: bestRoom.id,
        has_email: !!email,
      },
    });

    const { data, error } = await supabase.rpc('reserve_booking', {
      p_room_id: bestRoom.id,
      p_booking_date: bookingDate,
      p_start_time: startTime,
      p_duration_hours: durationHours,
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email || null,
      p_notes: null,
      p_guest_count: Number(guests || 0),
    });

    if (error) {
      console.error("reserve_booking error:", error);
      setIsSubmitting(false);
      setIsAvailable(false);
      toast({
        title: "אין פניות",
        description: "המועד שבחרת אינו פנוי כרגע. נסה/י מועד אחר.",
      });
      await logWarn('Reserve booking failed', {
        component: 'BookingSection',
        context: { message: error.message, code: (error as any)?.code, booking_date: bookingDate, start_time: startTime, duration_hours: durationHours }
      });
      return;
    }

    // Success - show booking code and send email
    setBookingResult(data);
    setIsSubmitting(false);

     await logInfo('Reserve booking success', {
      component: 'BookingSection',
      context: { id: data?.id, booking_code: data?.booking_code, room_id: data?.room_id }
    });

    toast({
      title: "הזמנה שוריינה!",
      description: `מספר הזמנה: ${data?.booking_code || ''}`,
    });

    // Fire-and-forget: send confirmation email
    try {
      const payload = {
        to: email || "info@kbox.co.il",
        booking: {
          booking_code: data?.booking_code,
          booking_date: data?.booking_date,
          start_time: data?.start_time,
          duration_hours: data?.duration_hours,
          room_id: data?.room_id,
          customer_name: data?.customer_name,
          customer_phone: data?.customer_phone,
          price_total: data?.price_total,
          guest_count: Number(guests || 0),
        }
      };
      await logInfo('Send booking confirmation invoked', {
        component: 'BookingSection',
        context: { booking_id: data?.id, to: email ? 'customer' : 'fallback' }
      });
      const { error: fnError } = await supabase.functions.invoke('send-booking-confirmation', {
        body: payload,
      });
      if (fnError) {
        console.warn("send-booking-confirmation error", fnError);
        await logWarn('Send booking confirmation error', { component: 'BookingSection', context: { message: (fnError as any)?.message } });
      }
    } catch (e: any) {
      console.warn("send-booking-confirmation invoke failed:", e);
      await logWarn('Send booking confirmation invoke failed', { component: 'BookingSection', context: { message: e?.message } });
    }
  };

  
  return (
    <section id="booking" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            {t('bookingSection.badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-hebrew-display text-foreground mb-6">
            {t('booking.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('booking.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-hebrew-display text-2xl text-foreground">
                    {t('bookingSection.formTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">{t('booking.dateLabel')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          ref={dateRef}
                          aria-invalid={!!fieldErrors.date}
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal border-border/50",
                            !date && "text-muted-foreground",
                            fieldErrors.date && "border-destructive focus-visible:ring-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: he }) : <span>{t('bookingSection.placeholders.selectDate')}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => { setDate(d); setFieldErrors((p) => ({ ...p, date: undefined })); }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(date);
                            selectedDate.setHours(0, 0, 0, 0);
                            
                            // Disable past dates and Saturdays
                            return selectedDate < today || date.getDay() === 6;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldErrors.date && (
                      <p className="text-sm font-medium text-destructive">{fieldErrors.date}</p>
                    )}
                  </div>

                  {/* Time and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">{t('booking.timeLabel')}</Label>
                      <Select value={selectedTime} onValueChange={(v) => { setSelectedTime(v); setFieldErrors((p) => ({ ...p, time: undefined })); }}>
                        <SelectTrigger ref={timeRef} aria-invalid={!!fieldErrors.time} className={cn("border-border/50", fieldErrors.time && "border-destructive focus-visible:ring-destructive")}>
                          <SelectValue placeholder={
                            date ? 
                              (availableTimeSlots.length > 0 ? t('bookingSection.placeholders.selectTime') : t('bookingSection.placeholders.noTimes')) 
                              : t('bookingSection.placeholders.selectDateFirst')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((time) => (
                            <SelectItem key={time} value={time} className="ltr-numbers">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {date && (
                        <p className="text-xs text-muted-foreground">
                          {hoursLabel && (
                            <>{t('bookingSection.businessHours')} {hoursLabel}</>
                          )}
                        </p>
                      )}
                      {fieldErrors.time && (
                        <p className="text-sm font-medium text-destructive">{fieldErrors.time}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">{t('booking.durationLabel')}</Label>
                      <Select value={selectedDuration} onValueChange={(v) => { setSelectedDuration(v); setFieldErrors((p) => ({ ...p, duration: undefined })); }}>
                        <SelectTrigger ref={durationRef} aria-invalid={!!fieldErrors.duration} className={cn("border-border/50", fieldErrors.duration && "border-destructive focus-visible:ring-destructive")}>
                          <SelectValue placeholder={t('bookingSection.placeholders.selectDuration')} />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.duration && (
                        <p className="text-sm font-medium text-destructive">{fieldErrors.duration}</p>
                      )}
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">{t('booking.guestsLabel')}</Label>
                    <Select value={guests} onValueChange={(v) => { setGuests(v); setFieldErrors((p) => ({ ...p, guests: undefined })); }}>
                      <SelectTrigger ref={guestsRef} aria-invalid={!!fieldErrors.guests} className={cn("border-border/50", fieldErrors.guests && "border-destructive focus-visible:ring-destructive")}>
                        <SelectValue placeholder={t('bookingSection.placeholders.howMany')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="ltr-numbers">
                            {num} {t('bookingSection.summary.people')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.guests && (
                      <p className="text-sm font-medium text-destructive">{fieldErrors.guests}</p>
                    )}
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive font-medium">{validationError}</p>
                      </div>
                    </div>
                  )}

                  {guests && !validationError && (
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                      <p className="text-sm text-muted-foreground text-center">
                        <Check className="w-4 h-4 inline-block ml-1 text-primary" />
                        {t('bookingSection.roomRecommendation')}
                      </p>
                    </div>
                  )}

                  {/* Contact Info */}
                  {isAvailable !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">{t('booking.contact.name')}</Label>
                        <Input 
                          ref={nameRef}
                          aria-invalid={!!fieldErrors.name}
                          value={name}
                          onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                          placeholder={t('bookingSection.placeholders.fullName')} 
                          className={cn("border-border/50", fieldErrors.name && "border-destructive focus-visible:ring-destructive")}
                        />
                        {fieldErrors.name && (
                          <p className="text-sm font-medium text-destructive">{fieldErrors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">{t('booking.contact.phone')}</Label>
                        <Input 
                          ref={phoneRef}
                          aria-invalid={!!fieldErrors.phone}
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: undefined })); }}
                          placeholder={t('bookingSection.placeholders.phone')} 
                          className={cn("border-border/50 ltr-numbers", fieldErrors.phone && "border-destructive focus-visible:ring-destructive")}
                          dir="ltr"
                        />
                        {fieldErrors.phone && (
                          <p className="text-sm font-medium text-destructive">{fieldErrors.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">אימייל (לא חובה)</Label>
                        <Input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com" 
                          className="border-border/50 ltr-numbers"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}

                  {/* No Availability Message */}
                  {isAvailable === false && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center animate-fade-in">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {t('bookingSection.notAvailable.title')}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('bookingSection.notAvailable.description')}
                        </p>
                        {nearestSuggestion && (
                          <p className="text-foreground font-medium ltr-numbers">
                            החדר אינו פנוי בטווח שבחרת. הטווח הקרוב ביותר הפנוי הוא {nearestSuggestion}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          צרו איתנו קשר וננסה למצוא עבורכם פתרון מותאם — <a href="tel:0522666652" className="text-primary ltr-numbers">0522666652</a>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowContactForm(!showContactForm)}
                            className="border-primary/30 hover:bg-primary/10"
                          >
                            <MessageSquare className="w-4 h-4 ml-2" />
                            {t('bookingSection.notAvailable.leaveMessage')}
                          </Button>
                          
                          <Button 
                            variant="outline"
                            className="border-primary/30 hover:bg-primary/10"
                            onClick={() => window.open('tel:0522666652')}
                          >
                            <Phone className="w-4 h-4 ml-2" />
                            {t('bookingSection.notAvailable.callUs')}
                          </Button>
                          
                          <Button 
                            variant="outline"
                            onClick={resetSearch}
                            className="border-primary/30 hover:bg-primary/10"
                          >
                            <Search className="w-4 h-4 ml-2" />
                            {t('bookingSection.notAvailable.searchOther')}
                          </Button>
                        </div>

                        {/* Contact Form */}
                        {showContactForm && (
                          <div className="mt-6 p-4 bg-background border border-border/50 rounded-lg animate-fade-in">
                            <h4 className="font-medium mb-4 text-foreground">{t('bookingSection.notAvailable.contactForm.title')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('booking.contact.name')} 
                                className="border-border/50"
                              />
                              <Input 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('bookingSection.placeholders.phone')} 
                                className="border-border/50 ltr-numbers"
                                dir="ltr"
                              />
                            </div>
                            <Button className="w-full mt-3 bg-primary hover:bg-primary/90">
                              {t('bookingSection.notAvailable.contactForm.send')}
                            </Button>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground mt-4">
                          {t('bookingSection.notAvailable.hours')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              {/* Price Summary */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-hebrew-display text-xl text-foreground">
                    {t('bookingSection.summary.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(date || selectedTime || selectedDuration || guests) && (
                    <div className="space-y-3">
                      {date && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('bookingSection.summary.date')}</span>
                          <span className="text-foreground">{format(date, "PPP", { locale: he })}</span>
                        </div>
                      )}
                      
                      {selectedTime && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('bookingSection.summary.time')}</span>
                          <span className="text-foreground ltr-numbers">{selectedTime}</span>
                        </div>
                      )}
                      
                      {selectedDuration && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('bookingSection.summary.duration')}</span>
                          <span className="text-foreground">
                            {durations.find(d => d.value === selectedDuration)?.label}
                          </span>
                        </div>
                      )}

                      {guests && (
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('bookingSection.summary.guests')}</span>
                          <span className="text-foreground">{guests} {t('bookingSection.summary.people')}</span>
                        </div>
                      )}
                      

                      {bookingResult?.booking_code && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                          <div className="text-sm text-foreground">
                            {`מספר הזמנה: `}
                            <span className="font-bold ltr-numbers">{bookingResult.booking_code}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Check Availability Button */}
                  {isAvailable === null && (
                    <Button 
                      onClick={handleBookingCheck}
                      className="w-full bg-gradient-primary hover:scale-105 transition-bounce shadow-button text-lg py-6"
                        disabled={roomsQuery.isLoading}
                    >
                      <Search className="w-5 h-5 ml-2" />
                      {t('booking.checkAvailability')}
                    </Button>
                  )}

                  {/* Booking Confirmed (Ready to place reservation) */}
                  {isAvailable === true && (
                    <div className="space-y-4">
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center animate-fade-in">
                        <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold text-foreground mb-1">{t('bookingSection.available.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('bookingSection.available.subtitle')}</p>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-primary hover:scale-105 transition-bounce shadow-button text-lg py-6"
                        disabled={isSubmitting}
                        onClick={handleConfirmReservation}
                      >
                        <CreditCard className="w-5 h-5 ml-2" />
                        {isSubmitting ? t('bookingSection.confirmBooking') + '…' : t('bookingSection.confirmBooking')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="shadow-card border-border/50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{t('bookingSection.features.instant')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{t('bookingSection.features.freeCancellation')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{t('bookingSection.features.securePayment')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{t('bookingSection.features.support')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
