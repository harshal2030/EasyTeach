/* eslint-disable no-undef */
import {QuizRes} from '../utils/API';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Drawer: undefined;
  JoinClass: undefined;
  Quiz: undefined;
  CreateTest: {
    file?: {
      name: string;
      uri: string;
      type: string;
    };
    quizId?: string;
  };
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
  Manage: undefined;
  Settings: undefined;
};

export {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
  BottomTabTestParamList,
};
