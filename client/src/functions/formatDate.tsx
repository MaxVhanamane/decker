const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };

  return new Date(dateString).toLocaleDateString("en-US", options);
};

export { formatDate };
