/* eslint-disable no-undef */
type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Drawer: undefined;
  JoinClass: undefined;
  Quiz: {
    quizId: string;
    title: string;
  };
  CreateTest: {
    file?: {
      name: string;
      uri: string;
      type: string;
    };
    quizId?: string;
  };
  ShowScore: {
    quizId: string;
    title: string;
    questions: number;
  };
  EditProfile: {
    username: string;
  };
  Files: {
    moduleId: string;
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
  Resource: undefined;
};

export {
  RootStackParamList,
  DrawerParamList,
  BottomTabHomeParamList,
  BottomTabTestParamList,
};
