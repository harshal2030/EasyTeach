import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
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

const quizzes = (
  state: QuizRes[] = [],
  action: quizFetchedAction | quizAddedAction,
) => {
  switch (action.type) {
    case ActionTypes.quizFetched:
      return action.payload;
    case ActionTypes.addQuiz:
      return [action.payload, ...state];
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
