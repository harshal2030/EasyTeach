/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {quizUrl} from '../../utils/urls';

enum ActionTypes {
  quizFetched = 'quiz_fetched',
  quizErrored = 'quiz_errored',
  quizLoading = 'quiz_loading',
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

interface ObQuizRes {
  live: QuizRes[];
  expired: QuizRes[];
  scored: QuizRes[];
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
  type: ActionTypes.quizErrored;
  payload: boolean;
}

interface quizLoadingAction {
  type: ActionTypes.quizLoading;
  payload: boolean;
}

interface quizFetchedAction {
  type: ActionTypes.quizFetched;
  payload: ObQuizRes;
}

interface quizAddedAction {
  type: ActionTypes.addQuiz;
  payload: QuizRes;
}

interface quizRemoveAction {
  type: ActionTypes.removeQuiz;
  payload: string;
}

const quizHasErrored = (errored: boolean): quizErroredAction => {
  return {
    type: ActionTypes.quizErrored,
    payload: errored,
  };
};

const quizIsLoading = (loading: boolean): quizLoadingAction => {
  return {
    type: ActionTypes.quizLoading,
    payload: loading,
  };
};

const quizFetched = (quiz: ObQuizRes): quizFetchedAction => {
  return {
    type: ActionTypes.quizFetched,
    payload: quiz,
  };
};

const fetchQuiz = (token: string, classId: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(quizIsLoading(true));
      const res = await axios.get<ObQuizRes>(`${quizUrl}/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          return: 'live,expired,scored',
        },
      });

      dispatch(quizIsLoading(false));
      dispatch(quizFetched(res.data));
    } catch (e) {
      dispatch(quizHasErrored(true));
    }
  };
};

const addQuiz = (quiz: QuizRes) => {
  return {
    type: ActionTypes.addQuiz,
    payload: quiz,
  };
};

const removeQuiz = (quizId: string): quizRemoveAction => {
  return {
    type: ActionTypes.removeQuiz,
    payload: quizId,
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
};
