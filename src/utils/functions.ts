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

export {formatDate};
