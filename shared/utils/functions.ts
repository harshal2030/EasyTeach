const formatDate = (date: Date) => {
  const dateNum = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
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

const bytesToGB = (size: number): number => {
  const GB = size / (1024 * 1024 * 1024);

  return Math.round((GB + Number.EPSILON) * 100) / 100;
};

const humanizeVideoDuration = (seconds: number) => {
  const [begin, end] = seconds >= 3600 ? [11, 8] : [14, 5];
  const date = new Date(0);

  date.setSeconds(seconds);
  return date.toISOString().substr(begin, end);
};

export {formatDate, getDateAndMonth, bytesToGB, humanizeVideoDuration};
