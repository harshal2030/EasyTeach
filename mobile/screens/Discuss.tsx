import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Header, Icon} from 'react-native-elements';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';

import {HeaderBadge, DiscussCard} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {DrawerParamList, RootStackParamList} from '../navigators/types';
import {discussUrl} from '../../shared/utils/urls';
import {ContainerStyles} from '../../shared/styles/styles';
import {commonBlue} from '../../shared/styles/colors';
import {socket} from '../../shared/socket';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'People'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: NavigationProp;
  currentClass: Class;
  token: string;
  unread: number;
};

type DiscussRes = {
  id: string;
  title: string;
  createdAt: string;
  author: string;
  comments: string;
};

const Discuss: React.FC<Props> = (props) => {
  const [discuss, setDiscuss] = useState<DiscussRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${discussUrl}/${props.currentClass.id}`, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        setDiscuss(res.data);
      })
      .catch(() => {
        setLoading(false);
        setErrored(true);
      });

    socket.on('discuss', (data: {type: string; payload: DiscussRes}) =>
      setDiscuss((prev) => [data.payload, ...prev]),
    );

    return () => {
      socket.off('discuss');
    };
  }, [props.currentClass.id, props.token]);

  const renderItem = ({item}: {item: DiscussRes}) => {
    return (
      <DiscussCard
        title={item.title}
        id={item.id}
        comments={item.comments}
        author={item.author}
        createdAt={item.createdAt}
        onPress={(id) => console.log(id)}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={ContainerStyles.centerElements}>
          <ActivityIndicator animating size="large" color={commonBlue} />
        </View>
      );
    }

    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>
            We're having trouble in fetching modules. Please try again later
          </Text>
        </View>
      );
    }

    if (discuss.length === 0) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Nothing to show here right now.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={discuss}
        keyExtractor={(item) => item.id}
        removeClippedSubviews
        renderItem={renderItem}
      />
    );
  };

  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: 'Discuss',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={
          <>
            <Icon
              name="menu"
              size={26}
              onPress={props.navigation.openDrawer}
              color="#ffff"
            />
            {props.unread !== 0 ? <HeaderBadge /> : null}
          </>
        }
      />
      {renderContent()}
    </View>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
    unread: state.unreads.totalUnread,
  };
};

export default connect(mapStateToProps)(Discuss);
