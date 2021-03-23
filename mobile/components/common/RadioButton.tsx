/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {commonBlue} from '../../styles/colors';

interface Props {
  data: {
    key: string;
    text: string;
  }[];
  onPress?(key: string): void;
  horizontal?: boolean;
  initialValue?: string;
}

export class RadioButton extends Component<Props> {
  state = {
    value: this.props.initialValue || null,
  };

  render() {
    const {data, horizontal} = this.props;
    const {value} = this.state;

    return (
      <View style={{flexDirection: horizontal ? 'row' : 'column'}}>
        {data.map((res) => {
          return (
            <View
              key={res.key}
              style={[
                styles.container,
                {
                  marginBottom: horizontal ? 0 : 10,
                  marginLeft: horizontal ? 10 : 0,
                },
              ]}>
              <TouchableOpacity
                style={styles.radioCircle}
                onPress={() => {
                  this.setState({
                    value: res.key,
                  });
                  this.props.onPress!(res.key);
                }}>
                {value === res.key && <View style={styles.selectedRb} />}
              </TouchableOpacity>
              <Text style={styles.radioText}>{res.text}</Text>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioText: {
    marginLeft: 15,
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
  },
  radioCircle: {
    height: 30,
    width: 30,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: commonBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: commonBlue,
  },
});
