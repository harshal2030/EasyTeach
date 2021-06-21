import {
  ActionTypes,
  addQuestionAction,
  Question,
  emptyQuestionAction,
} from '../actions/questions';

type Action = addQuestionAction | emptyQuestionAction;

const questions = (state: Question[] = [], action: Action) => {
  switch (action.type) {
    case ActionTypes.addQuestion:
      return [...state, action.payload];
    case ActionTypes.emptyQuestions:
      return [];
    default:
      return state;
  }
};

export {questions};
