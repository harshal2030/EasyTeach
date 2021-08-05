import React, {memo, useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button, Tooltip} from 'react-native-elements';
import dotIcon from '@iconify-icons/mdi/dots-vertical';
import deleteIcon from '@iconify-icons/ic/delete';

import {TouchableIcon} from '../../../web/components';
import {Avatar} from './Avatar';

import {commonGrey, flatRed, greyWithAlpha} from '../../styles/colors';
import {getDateAndMonth} from '../../utils/functions';

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
  const tooltipRef = useRef(null);

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

        <Tooltip
          // @ts-ignore
          ref={tooltipRef}
          popover={
            <Button
              title="Delete"
              titleStyle={{color: flatRed}}
              icon={<TouchableIcon icon={deleteIcon} color={flatRed} />}
              type="clear"
              onPress={() => {
                // @ts-ignore
                tooltipRef.current.toggleTooltip();
                props.onOptionPress(props.msgId, props.username);
              }}
            />
          }
          backgroundColor={greyWithAlpha(0.5)}
          withOverlay={false}>
          <TouchableIcon icon={dotIcon} color="#000" size={24} />
        </Tooltip>
      </View>

      <Text style={styles.msgContainer}>{props.message}</Text>
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
