/* eslint-disable no-undef */

interface QuizRes {
  classId: string;
  quizId: string;
  createdAt: Date;
  releaseScore: boolean;
  timePeriod: [
    {value: Date; inclusive: boolean},
    {value: Date; inclusive: boolean},
  ];
  title: string;
  description: string;
  randomOp: boolean;
  randomQue: boolean;
}

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Drawer: undefined;
  JoinClass: undefined;
  Quiz: undefined;
  CreateTest: undefined;
};

type BottomTabHomeParamList = {
  Announcements: undefined;
  People: undefined;
};

type BottomTabTestParamList = {
  TestHome: undefined | QuizRes;
  TestScored: undefined | QuizRes;
};

type DrawerParamList = {
  Home: undefined;
  Test: undefined;
};

export {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
  BottomTabTestParamList,
  QuizRes,
};
