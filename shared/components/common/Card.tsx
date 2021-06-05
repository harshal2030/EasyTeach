import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import {Text} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {formatDate} from '../../utils/functions';

type Props = {
  title: string;
  onPress?(): any;
  containerStyle?: ViewStyle;
  expiresOn: Date;
  onGearPress?(): void;
  isOwner: boolean;
};

const Card = (props: Props) => {
  return (
    <View style={[styles.main, props.containerStyle]}>
      <TouchableWithoutFeedback onPress={props.onPress}>
        <View style={styles.contentContainer}>
          <View>
            <View style={styles.iconTextContainer}>
              <MaterialIcons name="assignment" size={26} />
              <Text style={styles.titleStyle} numberOfLines={1}>
                {props.title}
              </Text>
            </View>

            <Text style={styles.timeText} numberOfLines={1}>
              Expires On: {formatDate(props.expiresOn)}
            </Text>
          </View>

          {props.isOwner && (
            <Octicons name="gear" size={23} onPress={props.onGearPress} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.5),
    borderRadius: 5,
    padding: 10,
    backgroundColor: commonBackground,
    marginVertical: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleStyle: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '100',
  },
  timeText: {
    marginLeft: 36,
    color: commonGrey,
  },
});

export {Card};
