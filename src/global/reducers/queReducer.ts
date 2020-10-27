export const queReducer = (
  state: {
    queId: string;
    options: string[];
    question: string;
    selected: null | number;
  }[] = [
    {
      queId: '1',
      question: 'This is question one.',
      options: ['op1', 'op2', 'op3', 'op4'],
      selected: null,
    },
    {
      queId: '2',
      question: 'This is question two.',
      options: ['tw1', 'tw2', 'tw3', 'tw4'],
      selected: null,
    },
    {
      queId: '3',
      question: 'This is question three.',
      options: ['th1', 'th2', 'th3', 'th4'],
      selected: null,
    },
    {
      queId: '4',
      question: 'This is question four.',
      options: ['fo1', 'fo2', 'fo3', 'fo4'],
      selected: null,
    },
    {
      queId: '5',
      question: 'This is question five.',
      options: ['fi1', 'fi2', 'fi3', 'fi4'],
      selected: null,
    },
    {
      queId: '6',
      question: 'This is question six.',
      options: ['si1', 'si2', 'si3', 'si4'],
      selected: null,
    },
  ],
) => {
  return state;
};
