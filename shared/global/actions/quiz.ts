/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {quizUrl} from '../../utils/urls';
import {StoreState} from '../index';

enum ActionTypes {
  quizFetched = 'quiz_fetched',
  quizErrored = 'quiz_errored',
  quizLoading = 'quiz_loading',
  removeQuiz = 'remove_quiz',
  addQuiz = 'add_quiz',
}

type QuizRes = {
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
};

type ObQuizRes = {
  live: QuizRes[];
  expired: QuizRes[];
  scored: QuizRes[];
};

type Result = {
  correct: number;
  incorrect: number;
  totalQues: number;
  totalScore: number;
  userScored: number;
  notAnswered: number;
};

type QuizPayload = {
  loading: boolean;
  errored: boolean;
  quizzes: ObQuizRes;
};

type QuizState = {
  [classId: string]: QuizPayload | undefined;
};

interface quizErroredAction {
  type: ActionTypes.quizErrored;
  payload: {
    classId: string;
    errored: boolean;
  };
}

interface quizLoadingAction {
  type: ActionTypes.quizLoading;
  payload: {
    classId: string;
    loading: boolean;
  };
}

interface quizFetchedAction {
  type: ActionTypes.quizFetched;
  payload: {
    classId: string;
    loading: boolean;
    quizzes: ObQuizRes;
  };
}

interface quizAddedAction {
  type: ActionTypes.addQuiz;
  payload: {
    classId: string;
    quiz: QuizRes;
  };
}

interface quizRemoveAction {
  type: ActionTypes.removeQuiz;
  payload: {
    classId: string;
    quizId: string;
  };
}

const quizHasErrored = (
  errored: boolean,
  classId: string,
): quizErroredAction => {
  return {
    type: ActionTypes.quizErrored,
    payload: {
      classId,
      errored,
    },
  };
};

const quizIsLoading = (
  loading: boolean,
  classId: string,
): quizLoadingAction => {
  return {
    type: ActionTypes.quizLoading,
    payload: {
      classId,
      loading,
    },
  };
};

const quizFetched = (quiz: ObQuizRes, classId: string): quizFetchedAction => {
  return {
    type: ActionTypes.quizFetched,
    payload: {
      classId,
      loading: false,
      quizzes: quiz,
    },
  };
};

const fetchQuiz = (token: string, classId: string) => {
  return async (dispatch: Dispatch, getState: () => StoreState) => {
    const state = getState();
    if (state.quizzes[classId]) {
      return;
    }
    try {
      dispatch(quizIsLoading(true, classId));
      const res = await axios.get<ObQuizRes>(`${quizUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          return: 'live,expired,scored',
        },
      });

      dispatch(quizFetched(res.data, classId));
    } catch (e) {
      dispatch(quizIsLoading(false, classId));
      dispatch(quizHasErrored(true, classId));
    }
  };
};

const addQuiz = (quiz: QuizRes, classId: string): quizAddedAction => {
  return {
    type: ActionTypes.addQuiz,
    payload: {
      quiz,
      classId,
    },
  };
};

const removeQuiz = (quizId: string, classId: string): quizRemoveAction => {
  return {
    type: ActionTypes.removeQuiz,
    payload: {
      quizId,
      classId,
    },
  };
};

export {fetchQuiz, addQuiz, removeQuiz, ActionTypes};

export type {
  quizRemoveAction,
  quizAddedAction,
  quizErroredAction,
  quizFetchedAction,
  quizLoadingAction,
  Result,
  QuizRes,
  ObQuizRes,
  QuizState,
  QuizPayload,
};
