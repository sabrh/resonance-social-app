export const formatMessageTime = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    // show hours:minutes
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  // else show short date
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};