/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';
import {quizUrl} from '../../utils/urls';

enum ActionTypes {
  quizFetchErrored = 'quiz_fetch_errored',
  quizFetchLoading = 'quiz_fetch_loading',
  quizFetched = 'quiz_fetched',
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
  multipleSubmit: boolean;
}

interface Result {
  correct: number;
  incorrect: number;
  totalQues: number;
  totalScore: number;
  userScored: number;
}

interface quizErroredAction {
  type: ActionTypes.quizFetchErrored;
  payload: boolean;
}

interface quizLoadingAction {
  type: ActionTypes.quizFetchLoading;
  payload: boolean;
}

interface quizFetchedAction {
  type: ActionTypes.quizFetched;
  payload: QuizRes[];
}

interface quizAddedAction {
  type: ActionTypes.addQuiz;
  payload: QuizRes;
}

interface quizAlterAction {
  type: ActionTypes.alterQuiz;
  payload: QuizRes;
}

interface quizRemoveAction {
  type: ActionTypes.removeQuiz;
  payload: string;
}

const quizHasErrored = (errored: boolean): quizErroredAction => {
  return {
    type: ActionTypes.quizFetchErrored,
    payload: errored,
  };
};

const quizIsLoading = (loading: boolean): quizLoadingAction => {
  return {
    type: ActionTypes.quizFetchLoading,
    payload: loading,
  };
};

const quizFetched = (quiz: QuizRes[]): quizFetchedAction => {
  return {
    type: ActionTypes.quizFetched,
    payload: quiz,
  };
};

const fetchQuiz = (
  token: string,
  classId: string,
  quizType: string = 'live',
) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(quizIsLoading(true));
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

      dispatch(quizIsLoading(false));
      dispatch(quizFetched(res.data.live));
    } catch (e) {
      dispatch(quizHasErrored(true));
    }
  };
};

const addQuiz = (quiz: QuizRes): quizAddedAction => {
  return {
    type: ActionTypes.addQuiz,
    payload: quiz,
  };
};

const updateQuiz = (quiz: QuizRes): quizAlterAction => {
  return {
    type: ActionTypes.alterQuiz,
    payload: quiz,
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
