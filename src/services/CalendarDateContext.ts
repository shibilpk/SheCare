import React from 'react';

export type CalendarDateContextType = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const CalendarDateContext = React.createContext<CalendarDateContextType>({
  selectedDate: new Date(),
  setSelectedDate: () => {},
});

export default CalendarDateContext;
