/* eslint-disable no-undef */
import {Dispatch} from 'redux';
import axios from 'axios';

import {classUrl} from '../../utils/urls';

enum classActionTypes {
  fetchClass,
}

interface Class {
  name: string;
  about: string;
  owner: string;
  id: string;
  photo: string;
  collaborators: string[];
}

interface fetchClassAction {
  type: classActionTypes.fetchClass;
  payload: Class[];
}

const fetchClass = (token: string) => {
  return async (dispatch: Dispatch) => {
    const res = await axios.get<Class[]>(classUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res.data);

    return dispatch<fetchClassAction>({
      type: classActionTypes.fetchClass,
      payload: res.data,
    });
  };
};

export {fetchClass, classActionTypes, fetchClassAction, Class};
