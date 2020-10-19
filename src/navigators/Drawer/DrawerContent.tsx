import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Button, Avatar} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import axios from 'axios';

import {JoinClass} from '../../components/modals';

import {StoreState} from '../../global';
import {removeToken} from '../../global/actions/token';
import {Class, fetchClasses} from '../../global/actions/classes';

import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {mediaUrl, logOutUrl} from '../../utils/urls';

interface Props extends DrawerContentComponentProps {
  token: string | null;
  removeToken: typeof removeToken;
  fetchClasses: Function;
  classes: Class[];
  classIsLoading: boolean;
  classErrored: boolean;
}

const DrawerContent = (props: Props): JSX.Element => {
  const [modalVisible, alterModal] = React.useState(false);

  React.useEffect(() => {
    props.fetchClasses(props.token!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logOut = async () => {
    try {
      await axios.post(
        logOutUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      );
      await AsyncStorage.removeItem('token');
      props.removeToken();
    } catch (e) {
      Alert.alert('Error', 'Unable to logout please try again later');
    }
  };

  const renderSMClass = ({item}: {item: Class}) => {
    return (
      <View>
        <Image
          source={{
            uri: `${mediaUrl}/class/avatar/${item.photo}`,
          }}
          style={avatarImageStyle}
        />
        <Text numberOfLines={1} style={{fontSize: 16, fontWeight: '900'}}>
          {item.name}
        </Text>
      </View>
    );
  };

  const renderClasses = () => {
    if (props.classErrored) {
      return <Text>Errored</Text>;
    }

    if (props.classIsLoading) {
      return <Text>Loading..</Text>;
    }

    return (
      <FlatList
        data={props.classes}
        keyExtractor={(_item, i) => i.toString()}
        renderItem={renderSMClass}
        ListFooterComponent={
          <TouchableOpacity onPress={() => alterModal(true)}>
            <Feather name="plus" size={36} color={commonGrey} />
          </TouchableOpacity>
        }
      />
    );
  };

  const {
    actionButtonContainer,
    classText,
    mainImage,
    avatarContainer,
    avatarText,
    optionText,
    optionContainer,
    avatarImageStyle,
  } = styles;
  return (
    <View style={styles.mainContainer}>
      <View style={styles.leftContainer}>
        <View style={{alignItems: 'center'}}>{renderClasses()}</View>

        <View style={actionButtonContainer}>
          <Button
            icon={<Ionicons name="settings" size={36} color={commonGrey} />}
            type="clear"
            TouchableComponent={TouchableOpacity}
          />

          <Button
            icon={<Feather name="log-out" size={36} color={commonGrey} />}
            type="clear"
            TouchableComponent={TouchableOpacity}
            onPress={logOut}
          />
        </View>
      </View>
      <View style={styles.rightContainer}>
        <ScrollView>
          <ImageBackground
            source={{uri: 'https://picsum.photos/200'}}
            style={mainImage}>
            <Text style={classText}>The Class</Text>
          </ImageBackground>

          <View style={avatarContainer}>
            <Avatar
              size={40}
              rounded
              source={{
                uri: 'https://picsum.photos/200',
              }}
            />
            <Text style={avatarText}>The Teacher</Text>
          </View>

          <View style={optionContainer}>
            <TouchableOpacity>
              <Text style={optionText}>Resources</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={optionText}>Questions</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
        isVisible={modalVisible}
        onBackButtonPress={() => alterModal(false)}>
        <JoinClass />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  actionButtonContainer: {
    alignItems: 'center',
    height: 110,
    justifyContent: 'space-between',
    padding: 5,
    marginBottom: 5,
  },
  avatarImageStyle: {
    height: 50,
    width: 50,
    backgroundColor: 'red',
    marginTop: 10,
  },
  leftContainer: {
    width: 95,
    backgroundColor: commonBackground,
    justifyContent: 'space-between',
    padding: 10,
  },
  rightContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  classText: {
    color: '#fff',
    fontSize: 30,
    padding: 5,
    backgroundColor: 'rgba(237, 240, 242, 0.5)',
  },
  mainImage: {
    height: 200,
    width: '100%',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 15,
    borderBottomColor: greyWithAlpha(0.6),
    borderBottomWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    marginLeft: 8,
  },
  optionText: {
    fontSize: 20,
    color: '#757D75',
    marginTop: 10,
    marginBottom: 10,
  },
  optionContainer: {
    padding: 20,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    token: state.token,
    classes: state.classes,
    classIsLoading: state.classIsLoading,
    classErrored: state.classHasErrored,
  };
};

export default connect(mapStateToProps, {removeToken, fetchClasses})(
  DrawerContent,
);
