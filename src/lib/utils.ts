export function formatMessageTime(date: Date | string): string {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

export const classNames = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};