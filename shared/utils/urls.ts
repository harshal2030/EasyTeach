import Config from 'react-native-config';

let root: string;

if (Config.env === 'production') {
  root = 'https://easyteach.harshall.codes';
} else {
  root = 'http://localhost:3000';
}
const signUpUrl = `${root}/users/create`;
const loginUrl = `${root}/users/login`;
const logOutUrl = `${root}/users/logout`;
const checkTokenUrl = `${root}/users/token`;
const classUrl = `${root}/class`;
const mediaUrl = `${root}/media`;
const studentUrl = `${root}/student`;
const quizUrl = `${root}/quiz`;
const resultUrl = `${root}/result`;
const msgUrl = `${root}/msg`;
const questionUrl = `${root}/que`;
const recoveryUrl = `${root}/users/recover`;
const moduleUrl = `${root}/module`;
const fileUrl = `${root}/file`;
const vidTrackerUrl = `${root}/vidtracker`;
const paymentUrl = `${root}/pay`;

export {
  root,
  signUpUrl,
  loginUrl,
  checkTokenUrl,
  classUrl,
  mediaUrl,
  logOutUrl,
  studentUrl,
  quizUrl,
  resultUrl,
  msgUrl,
  questionUrl,
  recoveryUrl,
  moduleUrl,
  fileUrl,
  vidTrackerUrl,
  paymentUrl,
};
