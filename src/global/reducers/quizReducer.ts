import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
  quizAlterAction,
  quizRemoveAction,
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

type quizAction =
  | quizFetchedAction
  | quizAddedAction
  | quizAlterAction
  | quizRemoveAction;

const quizzes = (state: QuizRes[] = [], action: quizAction) => {
  switch (action.type) {
    case ActionTypes.quizFetched:
      return action.payload;
    case ActionTypes.addQuiz:
      return [action.payload, ...state];
    case ActionTypes.alterQuiz:
      const index = state.findIndex(
        (val) => val.quizId === action.payload.quizId,
      );
      let temp = [...state];
      if (index !== -1) {
        temp[index] = action.payload;
      }
      return temp;
    case ActionTypes.removeQuiz:
      return state.filter((val) => val.quizId !== action.payload);
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
