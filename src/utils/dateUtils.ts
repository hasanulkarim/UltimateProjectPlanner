import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type TimeRange = 'week' | 'month' | 'year';

interface DateRange {
  start: Date;
  end: Date;
  formatString: string;
}

export const getDateRange = (timeRange: TimeRange, selectedDate: Date): DateRange => {
  switch (timeRange) {
    case 'week':
      return {
        start: startOfWeek(selectedDate),
        end: endOfWeek(selectedDate),
        formatString: 'EEE',
      };
    case 'month':
      return {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
        formatString: 'd MMM',
      };
    case 'year':
      return {
        start: startOfYear(selectedDate),
        end: endOfYear(selectedDate),
        formatString: 'MMM',
      };
  }
};

export const formatDateForDisplay = (date: Date, timeRange: TimeRange): string => {
  return format(date, timeRange === 'year' ? 'yyyy' : 'MMMM yyyy');
};

export const formatChartDate = (date: Date, formatString: string): string => {
  return format(date, formatString);
};