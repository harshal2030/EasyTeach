/* eslint-disable no-undef */
type RootStackParamList = {
  Auth: undefined;
  Drawer: undefined;
  JoinClass: undefined;
  Forgot: undefined;
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
  Video: {
    url: string;
    id: string;
    moduleId: string;
    title?: string;
  };
  Info: {
    moduleId: string;
    videoId: string;
    title: string;
  };
  Checkout: undefined;
};

type DrawerParamList = {
  Home: undefined;
  Test: undefined;
  Manage: undefined;
  People: undefined;
  Settings: undefined;
  Modules: undefined;
};

export {RootStackParamList, DrawerParamList};
