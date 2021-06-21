/* eslint-disable no-undef */
enum ActionTypes {
  addQuestion = 'add_question',
  emptyQuestions = 'empty_questions',
}

type Question = {
  question: string;
  options: string[];
  correct: string;
  image: File | null;
};

interface addQuestionAction {
  type: ActionTypes.addQuestion;
  payload: Question;
}

interface emptyQuestionAction {
  type: ActionTypes.emptyQuestions;
  payload: null;
}

const addQuestion = (question: Question): addQuestionAction => {
  return {
    type: ActionTypes.addQuestion,
    payload: question,
  };
};

const emptyQuestions = (): emptyQuestionAction => {
  return {
    type: ActionTypes.emptyQuestions,
    payload: null,
  };
};

export {addQuestion, emptyQuestions, ActionTypes};
export type {Question, addQuestionAction, emptyQuestionAction};
