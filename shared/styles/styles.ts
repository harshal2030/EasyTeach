import {StyleSheet, Platform} from 'react-native';
import {commonBackground, commonGrey, greyWithAlpha} from './colors';

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
  link: {
    color: '#0000EE',
    textDecorationLine: 'underline',
    textDecorationColor: '#0000EE',
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
  FABContainer: {
    position: 'absolute',
    height: 60,
    width: 60,
    bottom: 50,
    right: 20,
    padding: 10,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: commonGrey,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
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

const ImageStyles = StyleSheet.create({
  classImage: {
    height: 100,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: greyWithAlpha(0.4),
  },
  imageOverlay: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.3),
  },
  classAvatarImage: {
    height: Platform.OS === 'web' ? 70 : 60,
    width: Platform.OS === 'web' ? 70 : 60,
    marginTop: 10,
    backgroundColor: commonGrey,
  },
});

export {FormStyles, TextStyles, ContainerStyles, BottomSheetStyle, ImageStyles};
