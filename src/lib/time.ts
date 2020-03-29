export const msToDays = (ms: number) => ms / (1000 * 60 * 60 * 24);
export const daysToMs = (days: number) => days * (1000 * 60 * 60 * 24);

export const dateToText = (date: Date) =>
  date
    .toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(/, /g, " ");
