/* eslint-disable no-undef */
interface QuizRes {
  classId: string;
  quizId: string;
  createdAt: Date;
  releaseScore: boolean;
  timePeriod: [
    {value: string; inclusive: boolean},
    {value: string; inclusive: boolean},
  ];
  title: string;
  description: string;
  randomOp: boolean;
  randomQue: boolean;
}

export {QuizRes};
