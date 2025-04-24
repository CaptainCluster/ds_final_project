export const createMockReservations = (contractor) => {
  // Times in UTC + 3 (Finland)
  const reservations = [];
  const workDayStart = 11; // 8:00
  const workDayStop = 19; // 16:00
  const maxDays = 5;
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 4);
  currentDate.setMinutes(0, 0, 0);

  // Create 5 day arrays
  for (let day = 0; day < maxDays; day++) {
    const daySlots = [];

    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
      day--;
      continue;
    }

    // Create 8 hour slots
    for (let hour = 0; hour < 8; hour++) {
      if (currentDate.getHours() + 1 > workDayStop) {
        break;
      }

      daySlots.push({
        reserved: false,
        startDate: new Date(currentDate),
      });

      currentDate.setHours(currentDate.getHours() + 1);
    }

    // Add complete day to reservations
    reservations.push(daySlots);

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(workDayStart, 0, 0, 0);
  }

  return {
    ...contractor,
    reservations,
  };
};
