export const linking = {
  prefixes: ['https://easyteach.inddex.co', 'easyteach://inddex'],
  config: {
    screens: {
      JoinClass: 'joinclass',
      Quiz: {
        path: 'quiz/:classId/:quizId',
      },
    },
  },
};
