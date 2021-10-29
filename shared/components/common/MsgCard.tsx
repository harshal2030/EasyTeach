import React, {memo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  Linking,
} from 'react-native';
import {Button} from 'react-native-elements';
import ParsedText from 'react-native-parsed-text';

import {TextStyles} from '../../styles/styles';
import {commonGrey, greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../utils/functions';

import {Avatar} from './Avatar';

interface Props {
  message: string;
  avatarUrl: string;
  name: string;
  username: string;
  createdAt: Date;
  msgId: string;
  onOptionPress: (msgId: string, username: string) => void;
}

const _MsgCard: React.FC<Props> = (props) => {
  const onUrlPress = (url: string) => {
    Linking.openURL(url)
      .then(() => null)
      .catch(() => null);
  };

  return (
    <View style={styles.parent}>
      <View style={styles.topContainer}>
        <View style={styles.userContainer}>
          <Avatar source={{uri: props.avatarUrl}} />

          <View style={styles.nameTextContainer}>
            <Text style={styles.name}>{props.name}</Text>
            <Text style={{color: commonGrey}}>
              {getDateAndMonth(props.createdAt)}
            </Text>
          </View>
        </View>

        <Button
          icon={{name: 'dots-vertical', type: 'material-community'}}
          type="clear"
          onPress={() => props.onOptionPress(props.msgId, props.username)}
          containerStyle={{padding: 2}}
          buttonStyle={{padding: 2}}
          background={TouchableNativeFeedback.Ripple(greyWithAlpha(0.3), true)}
        />
      </View>

      <ParsedText
        parse={[
          {
            type: 'url',
            style: [TextStyles.link, {padding: 0}],
            onPress: onUrlPress,
          },
        ]}
        style={styles.msgContainer}>
        {props.message}
      </ParsedText>
    </View>
  );
};

const MsgCard = memo(_MsgCard, () => false);

const styles = StyleSheet.create({
  parent: {
    borderWidth: 1,
    borderColor: greyWithAlpha(0.4),
    padding: 4,
    borderRadius: 5,
    margin: 5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameTextContainer: {
    marginLeft: 8,
  },
  msgContainer: {
    padding: 10,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
  },
});

export {MsgCard};
