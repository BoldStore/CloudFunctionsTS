export const addMinutes: (date: Date, minutes: number) => Date = (
  date,
  minutes
) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const subMinutes: (date: Date, minutes: number) => Date = (
  date,
  minutes
) => {
  return new Date(date.getTime() - minutes * 60000);
};
