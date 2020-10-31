import {StyleSheet} from 'react-native';
import {commonBackground, commonGrey} from './colors';

const FormStyles = StyleSheet.create({
  formContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  containerStyle: {
    flex: 1,
    backgroundColor: commonBackground,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
});

const TextStyles = StyleSheet.create({
  h4Style: {
    color: commonGrey,
    fontSize: 16,
  },
});

const ContainerStyles = StyleSheet.create({
  padder: {
    padding: 20,
  },
  parent: {
    flex: 1,
    backgroundColor: commonBackground,
  },
});

export {FormStyles, TextStyles, ContainerStyles};
