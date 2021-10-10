import {
  ActionTypes,
  quizErroredAction,
  quizLoadingAction,
  quizFetchedAction,
  quizAddedAction,
  quizRemoveAction,
  QuizState,
} from '../actions/quiz';

type quizAction =
  | quizFetchedAction
  | quizAddedAction
  | quizRemoveAction
  | quizErroredAction
  | quizLoadingAction;

const initialState: QuizState = {};

const quizzesReducer = (
  state: QuizState = initialState,
  action: quizAction,
): QuizState => {
  const quiz = state[action.payload?.classId] || {
    loading: true,
    errored: false,
    quizzes: {live: [], expired: [], scored: []},
  };
  const {loading, errored, quizzes} = quiz;

  const tempState = {...state};

  switch (action.type) {
    case ActionTypes.quizLoading:
      tempState[action.payload.classId] = {
        loading: action.payload.loading,
        errored,
        quizzes,
      };

      return tempState;
    case ActionTypes.quizErrored:
      tempState[action.payload.classId] = {
        loading,
        errored: action.payload.errored,
        quizzes,
      };

      return tempState;
    case ActionTypes.quizFetched:
      tempState[action.payload.classId] = {
        loading: action.payload.loading,
        errored,
        quizzes: action.payload.quizzes,
      };

      return tempState;
    case ActionTypes.addQuiz:
      const stop = new Date(action.payload.quiz.timePeriod[1].value).getTime();
      const now = Date.now();

      let liveQuiz = [...quizzes.live];
      let expiredQuiz = [...quizzes.expired];

      if (now < stop) {
        liveQuiz = [action.payload.quiz, ...liveQuiz];
      }

      if (now > stop) {
        expiredQuiz = [action.payload.quiz, ...expiredQuiz];
      }

      tempState[action.payload.classId] = {
        loading,
        errored,
        quizzes: {
          live: liveQuiz,
          expired: expiredQuiz,
          scored: quizzes.scored,
        },
      };

      return tempState;
    case ActionTypes.removeQuiz:
      const liveQ = quizzes.live.filter(
        (qz) => qz.quizId !== action.payload.quizId,
      );
      const expiredQ = quizzes.expired.filter(
        (qz) => qz.quizId !== action.payload.quizId,
      );
      const scoredQ = quizzes.scored.filter(
        (qz) => qz.quizId !== action.payload.quizId,
      );

      tempState[action.payload.classId] = {
        loading,
        errored,
        quizzes: {
          live: liveQ,
          expired: expiredQ,
          scored: scoredQ,
        },
      };

      return tempState;
    default:
      return state;
  }
};

export {quizzesReducer};
