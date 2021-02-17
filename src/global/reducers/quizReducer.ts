import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
  quizRemoveAction,
  quizUpdateAction,
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

type quizAction =
  | quizFetchedAction
  | quizAddedAction
  | quizRemoveAction
  | quizUpdateAction;

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
    case ActionTypes.updateQuiz:
      const liveIndex = state.live.findIndex(
        (quiz) => quiz.quizId === action.payload.quizId,
      );
      const expiredIndex = state.expired.findIndex(
        (quiz) => quiz.quizId === action.payload.quizId,
      );
      const scoredIndex = state.live.findIndex(
        (quiz) => quiz.quizId === action.payload.quizId,
      );

      const stopTime = new Date(action.payload.timePeriod[1].value).getTime();
      const nowTime = Date.now();

      let liveTemp = [...state.live];
      let expiredTemp = [...state.expired];
      let scoredTemp = [...state.scored];

      if (nowTime < stopTime) {
        if (expiredIndex > -1) {
          expiredTemp.splice(expiredIndex, 1);
        }

        if (liveIndex > -1) {
          liveTemp[liveIndex] = action.payload;
        } else {
          liveTemp = [action.payload, ...liveTemp];
        }
      }

      if (nowTime > stopTime) {
        if (liveIndex > -1) {
          liveTemp.splice(liveIndex, 1);
        }

        if (expiredIndex > -1) {
          expiredTemp[expiredIndex] = action.payload;
        } else {
          expiredTemp = [action.payload, ...expiredTemp];
        }
      }

      if (scoredIndex > -1) {
        scoredTemp[scoredIndex] = action.payload;

        if (!action.payload.releaseScore) {
          scoredTemp.splice(scoredIndex, 1);
        }
      }

      return {
        live: liveTemp,
        expired: expiredTemp,
        scored: scoredTemp,
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
