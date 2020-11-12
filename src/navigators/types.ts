/* eslint-disable no-undef */
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
  TestHome: undefined;
  TestScored: undefined;
  TestExpired: undefined;
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
