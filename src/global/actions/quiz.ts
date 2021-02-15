/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {quizUrl} from '../../utils/urls';

enum ActionTypes {
  quizLiveErrored = 'quiz_live_errored',
  quizLiveLoading = 'quiz_live_loading',
  quizExpiredErrored = 'quiz_expired_errored',
  quizExpiredLoading = 'quiz_expired_loading',
  quizScoredErrored = 'quiz_scored_errored',
  quizScoredLoading = 'quiz_scored_loading',
  quizFetchedLive = 'live',
  quizFetchedExpired = 'expired',
  quizFetchedScored = 'scored',
  alterQuiz = 'alter_quiz',
  removeQuiz = 'remove_quiz',
  addQuiz = 'add_quiz',
}

interface QuizRes {
  classId: string;
  quizId: string;
  questions: number;
  createdAt: Date;
  releaseScore: boolean;
  timePeriod: [
    {value: string; inclusive: boolean},
    {value: string; inclusive: boolean},
  ];
  title: string;
  description: string;
  randomOp: boolean;
  randomQue: boolean;
}

interface Result {
  correct: number;
  incorrect: number;
  totalQues: number;
  totalScore: number;
  userScored: number;
  notAnswered: number;
}

interface quizErroredAction {
  type:
    | ActionTypes.quizLiveErrored
    | ActionTypes.quizExpiredErrored
    | ActionTypes.quizScoredErrored;
  payload: boolean;
}

interface quizLoadingAction {
  type:
    | ActionTypes.quizLiveLoading
    | ActionTypes.quizExpiredLoading
    | ActionTypes.quizScoredLoading;
  payload: boolean;
}

interface quizFetchedAction {
  type:
    | ActionTypes.quizFetchedLive
    | ActionTypes.quizFetchedExpired
    | ActionTypes.quizFetchedScored;
  payload: QuizRes[];
}

interface quizAddedAction {
  type: ActionTypes.addQuiz;
  payload: QuizRes;
}

interface quizAlterAction {
  type: ActionTypes.alterQuiz;
  payload: QuizRes;
  screen: 'live' | 'expired' | 'scored';
}

interface quizRemoveAction {
  type: ActionTypes.removeQuiz;
  payload: string;
}

const quizHasErrored = (
  errored: boolean,
  type:
    | ActionTypes.quizLiveErrored
    | ActionTypes.quizExpiredErrored
    | ActionTypes.quizScoredErrored,
): quizErroredAction => {
  return {
    type,
    payload: errored,
  };
};

const quizIsLoading = (
  loading: boolean,
  type:
    | ActionTypes.quizLiveLoading
    | ActionTypes.quizExpiredLoading
    | ActionTypes.quizScoredLoading,
): quizLoadingAction => {
  return {
    type,
    payload: loading,
  };
};

const quizFetched = (
  quiz: QuizRes[],
  type:
    | ActionTypes.quizFetchedLive
    | ActionTypes.quizFetchedExpired
    | ActionTypes.quizFetchedScored,
): quizFetchedAction => {
  return {
    type,
    payload: quiz,
  };
};

const fetchQuiz = (
  token: string,
  classId: string,
  quizType:
    | ActionTypes.quizFetchedLive
    | ActionTypes.quizFetchedExpired
    | ActionTypes.quizFetchedScored = ActionTypes.quizFetchedLive,
) => {
  return async (dispatch: Dispatch) => {
    try {
      // @ts-ignore
      dispatch(quizIsLoading(true, `quiz_${quizType}_loading`));
      const res = await axios.get<{[fieldName: string]: QuizRes[]}>(
        `${quizUrl}/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            return: quizType,
          },
        },
      );

      // @ts-ignore
      dispatch(quizIsLoading(false, `quiz_${quizType}_loading`));
      dispatch(quizFetched(res.data[quizType], quizType));
    } catch (e) {
      // @ts-ignore
      dispatch(quizHasErrored(true, `quiz_${quizType}_errored`));
    }
  };
};

const addQuiz = (quiz: QuizRes): quizAddedAction => {
  return {
    type: ActionTypes.addQuiz,
    payload: quiz,
  };
};

const updateQuiz = (
  quiz: QuizRes,
  screen: 'live' | 'expired' | 'scored',
): quizAlterAction => {
  return {
    type: ActionTypes.alterQuiz,
    payload: quiz,
    screen,
  };
};

const removeQuiz = (quizId: string): quizRemoveAction => {
  return {
    type: ActionTypes.removeQuiz,
    payload: quizId,
  };
};

export {
  QuizRes,
  ActionTypes,
  fetchQuiz,
  addQuiz,
  updateQuiz,
  removeQuiz,
  quizRemoveAction,
  quizAlterAction,
  quizAddedAction,
  quizErroredAction,
  quizFetchedAction,
  quizLoadingAction,
  Result,
};
