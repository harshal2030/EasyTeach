const formatDate = (date: Date) => {
  const dateNum = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth()}` : date.getMonth();
  const y = date.getFullYear();

  const hr = date.getHours() + 1 < 10 ? `0${date.getHours()}` : date.getHours();
  const min =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  return `${dateNum}-${month}-${y} ${hr}:${min}:00`;
};

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

const getDateAndMonth = (date: Date) => {
  const dateNum = date.getDate();
  const month = monthNames[date.getMonth()];

  return `${month} ${dateNum}`;
};

export {formatDate, getDateAndMonth};
