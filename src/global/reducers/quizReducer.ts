import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  QuizRes,
} from '../actions/quiz';

const quizErrored = (state: boolean = false, action: quizErroredAction) => {
  switch (action.type) {
    case ActionTypes.quizFetchErrored:
      return action.payload;
    default:
      return state;
  }
};

const quizLoading = (state: boolean = true, action: quizLoadingAction) => {
  switch (action.type) {
    case ActionTypes.quizFetchLoading:
      return action.payload;
    default:
      return state;
  }
};

const quizzes = (state: QuizRes[] = [], action: quizFetchedAction) => {
  switch (action.type) {
    case ActionTypes.quizFetched:
      return action.payload;
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
