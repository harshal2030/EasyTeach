/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RouteComponentProps, Switch, Route} from 'react-router-dom';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';

import Announcement from '../../screens/Announcements.web';
import People from '../../screens/People.web';

import {StoreState} from '../../global';
import {Class} from '../../global/actions/classes';

import {commonBackground, commonBlue} from '../../styles/colors';

type Props = RouteComponentProps<{}> & {
  currentClass: Class | null;
};

const Test1 = () => {
  return (
    <View>
      <Text>test1 werwerew</Text>
    </View>
  );
};

interface State {
  selected: 'announce' | 'people';
}

class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: 'announce',
    };
  }

  render() {
    const {path} = this.props.match;
    const id = this.props.currentClass ? this.props.currentClass.id : 'id';

    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.buttonContainer,
              {
                borderBottomColor:
                  this.state.selected === 'announce'
                    ? commonBlue
                    : 'transparent',
              },
            ]}
            onPress={() => {
              this.props.history.push(`${path}/${id}`);
              this.setState({selected: 'announce'});
            }}>
            <FontAwesome5
              name="bullhorn"
              size={18}
              color={this.state.selected === 'announce' ? commonBlue : 'black'}
            />
            <Text
              style={{
                color:
                  this.state.selected === 'announce' ? commonBlue : 'black',
              }}>
              {' '}
              Announcements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buttonContainer,
              {
                borderBottomColor:
                  this.state.selected === 'people' ? commonBlue : 'transparent',
              },
            ]}
            onPress={() => {
              this.props.history.push(`${path}/people/${id}`);
              this.setState({selected: 'people'});
            }}>
            <FontAwesome
              name="group"
              size={18}
              color={this.state.selected === 'people' ? commonBlue : 'black'}
            />
            <Text
              style={{
                color: this.state.selected === 'people' ? commonBlue : 'black',
              }}>
              {' '}
              People
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Switch>
            <Route exact path={`${path}`} component={Test1} />
            <Route exact path={`${path}/:classId`} component={Announcement} />
            <Route path={`${path}/people/:classId`} component={People} />
          </Switch>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  main: {
    flex: 1,
    marginTop: 55,
    padding: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 50,
    backgroundColor: '#ffff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowColor: commonBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderBottomWidth: 3,
    padding: 10,
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass,
  };
};

export default connect(mapStateToProps)(Home);
