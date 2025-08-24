
-- Seed business hours only if table is empty
do language plpgsql $$
begin
  if (select count(*) from public.business_hours) = 0 then
    insert into public.business_hours (day_of_week, is_open, open_time_hour, close_time_hour, special_date, note)
    values
      (0, true, 18, 24, null, 'Sunday'),
      (1, true, 18, 24, null, 'Monday'),
      (2, true, 18, 24, null, 'Tuesday'),
      (3, true, 18, 24, null, 'Wednesday'),
      (4, true, 18, 24, null, 'Thursday'),
      (5, true, 10, 15, null, 'Friday'),
      (6, false, 0, 0, null, 'Saturday');
  end if;
end
$$;

-- Seed rooms only if table is empty
do language plpgsql $$
begin
  if (select count(*) from public.rooms) = 0 then
    insert into public.rooms (name, capacity, price_per_hour, is_active, description)
    values
      ('חדר A', 6, 120, true, 'חדר סטנדרטי'),
      ('חדר B', 10, 180, true, 'חדר גדול');
  end if;
end
$$;
