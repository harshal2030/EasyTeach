import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, FlatList} from 'react-native';
import {Header, Icon, Text, Button, Input} from 'react-native-elements';
import Modal from 'react-native-modal';
import {connect} from 'react-redux';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import Octicons from 'react-native-vector-icons/Octicons';

import {
  HeaderBadge,
  CheckBox,
  DiscussCard,
} from '../../shared/components/common';

import {DrawerParamList, RootStackParamList} from '../navigators/types';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';
import {
  DiscussPayload,
  fetchDiscuss,
  DiscussRes,
} from '../../shared/global/actions/discuss';

import {ContainerStyles} from '../../shared/styles/styles';
import {
  commonBackground,
  commonBlue,
  commonGrey,
} from '../../shared/styles/colors';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  currentClass: Class;
  navigation: NavigationProp;
  discussions: DiscussPayload;
  fetchDiscuss: (token: string, classId: string) => void;
  unread: number;
  token: string;
};

const Discuss: React.FC<Props> = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [topic, setTopic] = useState('');
  const [privateChat, setPrivateChat] = useState(false);

  const {loading, errored, discussions} = props.discussions;

  useEffect(() => {
    props.fetchDiscuss(props.token, props.currentClass.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentClass.id]);

  const removeModal = () => {
    setModalVisible(false);
  };

  const renderItem = ({item}: {item: DiscussRes}) => {
    return (
      <DiscussCard
        title={item.title}
        onPress={() => props.navigation.navigate('Chat')}
        comments={item.comments}
        author={item.author}
        createdAt={item.createdAt}
      />
    );
  };

  const renderContent = () => {
    if (errored) {
      return (
        <View style={ContainerStyles.centerElements}>
          <Text>Something went wrong. Please try again later</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View>
          <ActivityIndicator color={commonBlue} animating size="large" />
        </View>
      );
    }

    return (
      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    );
  };

  return (
    <View style={[ContainerStyles.parent, {backgroundColor: '#fff'}]}>
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

      <Modal
        isVisible={modalVisible}
        onBackButtonPress={removeModal}
        style={styles.modalStyle}
        onBackdropPress={removeModal}>
        <Text h3>Create Discussion</Text>
        <View>
          <Input
            label="Topic to discuss"
            value={topic}
            onChangeText={setTopic}
            placeholder="Start something awesome.."
          />

          <CheckBox
            title="Private"
            desc="Only you and class owner will be able to chat"
            checked={privateChat}
            onPress={() => setPrivateChat(!privateChat)}
          />
        </View>

        <Button title="Start Discussion" />
      </Modal>

      <Button
        icon={<Octicons name="plus" size={26} color={commonBlue} />}
        containerStyle={styles.FABContainer}
        // eslint-disable-next-line react-native/no-inline-styles
        buttonStyle={{backgroundColor: '#ffff'}}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalStyle: {
    backgroundColor: commonBackground,
    padding: 20,
    justifyContent: 'space-between',
    flex: 0,
    height: 400,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    unread: state.unreads.totalUnread,
    token: state.token!,
    discussions: state.discussions[state.currentClass!.id] || {
      loading: true,
      errored: false,
      discussions: [],
    },
  };
};

export default connect(mapStateToProps, {fetchDiscuss})(Discuss);
