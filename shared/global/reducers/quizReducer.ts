import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
  quizRemoveAction,
  QuizRes,
} from '../actions/quiz';

const quizErrored = (
  state: boolean = false,
  action: quizErroredAction,
): boolean => {
  switch (action.type) {
    case ActionTypes.quizErrored:
      return action.payload;
    default:
      return state;
  }
};

const quizLoading = (
  state: boolean = true,
  action: quizLoadingAction,
): boolean => {
  switch (action.type) {
    case ActionTypes.quizLoading:
      return action.payload;
    default:
      return state;
  }
};

type quizAction = quizFetchedAction | quizAddedAction | quizRemoveAction;

type quizState = {
  live: QuizRes[];
  expired: QuizRes[];
  scored: QuizRes[];
};

const quizzes = (
  state: quizState = {live: [], expired: [], scored: []},
  action: quizAction,
): quizState => {
  switch (action.type) {
    case ActionTypes.quizFetched:
      return action.payload;
    case ActionTypes.addQuiz:
      const stop = new Date(action.payload.timePeriod[1].value).getTime();
      const now = Date.now();

      let liveQuiz = [...state.live];
      let expiredQuiz = [...state.expired];

      if (now < stop) {
        liveQuiz = [action.payload, ...liveQuiz];
      }

      if (now > stop) {
        expiredQuiz = [action.payload, ...expiredQuiz];
      }

      return {
        live: liveQuiz,
        expired: expiredQuiz,
        scored: state.scored,
      };
    case ActionTypes.removeQuiz:
      const liveQ = state.live.filter((quiz) => quiz.quizId !== action.payload);
      const expiredQ = state.expired.filter(
        (quiz) => quiz.quizId !== action.payload,
      );
      const scoredQ = state.scored.filter(
        (quiz) => quiz.quizId !== action.payload,
      );

      return {
        live: liveQ,
        expired: expiredQ,
        scored: scoredQ,
      };
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
