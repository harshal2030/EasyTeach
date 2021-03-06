import {Platform, Alert, AlertButton} from 'react-native';

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

const alertPolyfill = (
  title: string,
  description: string,
  options?: AlertButton[],
) => {
  if (options === undefined || options.length === 0) {
    // eslint-disable-next-line no-alert
    window.alert([title, description].filter(Boolean).join('\n'));
    return;
  }

  // eslint-disable-next-line no-alert
  const result = window.confirm(
    [title, description].filter(Boolean).join('\n'),
  );

  if (result) {
    const confirmOption = options!.find(({style}) => style !== 'cancel');
    confirmOption && confirmOption.onPress!();
  } else {
    const cancelOption = options!.find(({style}) => style === 'cancel');
    cancelOption && cancelOption.onPress!();
  }
};

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;

export {formatDate, getDateAndMonth, alert};
