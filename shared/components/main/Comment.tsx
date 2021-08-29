import React, {memo, useState} from 'react';
import {View, TouchableNativeFeedback, StyleSheet} from 'react-native';
import {Button, Text, Input} from 'react-native-elements';

import {Avatar} from '../common';

import {commonBlue, greyWithAlpha} from '../../styles/colors';

type Props = {
  authorAvatar: string;
  authorName: string;
};

const _Comment: React.FC<Props> = (props) => {
  const [screen, setScreen] = useState<'default' | 'comment'>('default');

  if (screen === 'comment') {
    return (
      <View style={styles.root}>
        <Input />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Button
        title="COMMENT"
        type="outline"
        onPress={() => setScreen('comment')}
        titleStyle={styles.buttonTitle}
        background={TouchableNativeFeedback.Ripple(commonBlue, false)}
        buttonStyle={styles.button}
      />

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Initiator</Text>
        <Avatar source={{uri: props.authorAvatar}} style={styles.avatar} />
        <Text style={{marginLeft: 12}}>{props.authorName}</Text>
      </View>
    </View>
  );
};

export const Comment = memo(_Comment, () => false);

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#ffffff',
    padding: 16,
    height: '100%',
  },
  buttonTitle: {
    fontSize: 20,
  },
  button: {
    borderWidth: 1.3,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  section: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: greyWithAlpha(0.3),
    borderBottomWidth: 1,
    borderTopColor: greyWithAlpha(0.3),
    borderTopWidth: 1,
  },
  sectionHeading: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});
