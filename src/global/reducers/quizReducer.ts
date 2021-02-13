import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
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

type quizAction = quizFetchedAction;

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
    case ActionTypes.quizFetchedLive:
      return {
        live: action.payload,
        expired: state.expired,
        scored: state.scored,
      };
    case ActionTypes.quizFetchedExpired:
      return {
        live: state.live,
        expired: action.payload,
        scored: state.scored,
      };
    case ActionTypes.quizFetchedScored:
      return {
        live: state.live,
        expired: state.expired,
        scored: action.payload,
      };
    default:
      return state;
  }
};

export {quizErrored, quizLoading, quizzes};
