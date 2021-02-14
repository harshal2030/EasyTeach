import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
  quizAlterAction,
  QuizRes,
} from '../actions/quiz';

type quizErroredState = {
  live: boolean;
  expired: boolean;
  scored: boolean;
};

const quizErrored = (
  state: quizErroredState = {
    live: false,
    expired: false,
    scored: false,
  },
  action: quizErroredAction,
): quizErroredState => {
  const {live, expired, scored} = state;
  switch (action.type) {
    case ActionTypes.quizExpiredErrored:
      return {
        live,
        expired: action.payload,
        scored,
      };
    case ActionTypes.quizLiveErrored:
      return {
        live: action.payload,
        expired,
        scored,
      };
    case ActionTypes.quizScoredErrored:
      return {
        live,
        expired,
        scored: action.payload,
      };
    default:
      return state;
  }
};

type quizLoadingState = {
  live: boolean;
  expired: boolean;
  scored: boolean;
};

const quizLoading = (
  state: quizLoadingState = {live: true, expired: true, scored: true},
  action: quizLoadingAction,
): quizLoadingState => {
  const {live, expired, scored} = state;

  switch (action.type) {
    case ActionTypes.quizLiveLoading:
      return {
        live: action.payload,
        expired,
        scored,
      };
    case ActionTypes.quizExpiredLoading:
      return {
        live,
        expired: action.payload,
        scored,
      };
    case ActionTypes.quizScoredLoading:
      return {
        live,
        expired,
        scored: action.payload,
      };
    default:
      return state;
  }
};

type quizAction = quizFetchedAction | quizAddedAction | quizAlterAction;

type quizState = {
  live: QuizRes[];
  expired: QuizRes[];
  scored: QuizRes[];
};

const quizzes = (
  state: quizState = {live: [], expired: [], scored: []},
  action: quizAction,
): quizState => {
  const {live, expired, scored} = state;

  switch (action.type) {
    case ActionTypes.quizFetchedLive:
      return {
        live: action.payload,
        expired,
        scored,
      };
    case ActionTypes.quizFetchedExpired:
      return {
        live,
        expired: action.payload,
        scored,
      };
    case ActionTypes.quizFetchedScored:
      return {
        live,
        expired,
        scored: action.payload,
      };
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
        scored,
      };
    case ActionTypes.alterQuiz:
      return {
        live,
        expired,
        scored,
      };
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
