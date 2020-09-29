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
} from 'react-native';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Button, Avatar} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import axios from 'axios';

import {StoreState} from '../../global';
import {removeToken} from '../../global/actions/token';

import {commonBackground, commonGrey, greyWithAlpha} from '../../styles/colors';
import {classUrl, mediaUrl} from '../../utils/urls';

interface Props extends DrawerContentComponentProps {
  token: string | null;
  removeToken: typeof removeToken;
}

interface Class {
  name: string;
  about: string;
  owner: string;
  id: string;
  photo: string;
  collaborators: string[];
}

const DrawerContent = (props: Props): JSX.Element => {
  const [classes, setClasses] = React.useState<Class[]>([]);

  React.useEffect(() => {
    console.log(props.token);
    axios
      .get<Class[]>(classUrl, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then((res) => {
        setClasses(res.data);
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logOut = async () => {
    await AsyncStorage.removeItem('token');
    props.removeToken();
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
        <View style={{alignItems: 'center'}}>
          {classes === [] ? (
            <Text>loading...</Text>
          ) : (
            <FlatList
              data={classes}
              keyExtractor={(_item, i) => i.toString()}
              renderItem={({item}) => {
                return (
                  <Image
                    source={{
                      uri: `${mediaUrl}/class/avatar/${item.photo}`,
                    }}
                    style={avatarImageStyle}
                    onError={(e) => console.log(e.type)}
                  />
                );
              }}
              ListFooterComponent={
                <TouchableOpacity>
                  <Feather name="plus" size={36} color={commonGrey} />
                </TouchableOpacity>
              }
            />
          )}
        </View>

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
    width: 80,
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
  };
};

export default connect(mapStateToProps, {removeToken})(DrawerContent);
