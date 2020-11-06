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

export {QuizRes};
