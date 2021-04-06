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
  headingStyle: {
    fontSize: 24,
    fontWeight: '800',
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
  centerElements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const BottomSheetStyle = StyleSheet.create({
  RBOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  RBTextStyle: {
    fontSize: 20,
    fontWeight: '400',
  },
  container: {
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor: 'transparent',
  },
});

export {FormStyles, TextStyles, ContainerStyles, BottomSheetStyle};
