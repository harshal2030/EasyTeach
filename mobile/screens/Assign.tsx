import React, {useState} from 'react';
import axios from 'axios';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {Header, Input, Text, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import DateTimePicker, {Event} from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import AndroidPicker from 'react-native-android-dialog-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Snackbar from 'react-native-snackbar';

import {CheckBox} from '../../shared/components/common';

import {StoreState} from '../../shared/global';
import {Class} from '../../shared/global/actions/classes';

import {RootStackParamList} from '../navigators/types';
import {ContainerStyles, TextStyles} from '../../shared/styles/styles';
import {commonBlue, commonGrey, flatRed} from '../../shared/styles/colors';
import {assignUrl} from '../../shared/utils/urls';

type Navigation = StackNavigationProp<RootStackParamList, 'Assign'>;

type Props = {
  navigation: Navigation;
  currentClass: Class;
  token: string;
};

const CreateAssign: React.FC<Props> = (props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<'date' | 'time' | null>(null);
  const [allowLate, setAllowLate] = useState(true);
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    mime: string;
    type: 'image' | 'pdf';
  } | null>(null);

  const handleDate = (_e: Event, date?: Date) => {
    if (!date) {
      setPickerType(null);
      return;
    }

    if (pickerType === 'date') {
      setDueDate(date);
      setPickerType('time');
    }

    if (pickerType === 'time') {
      const temp = dueDate;
      temp.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setDueDate(temp);
      setPickerType(null);
    }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.openPicker({cropping: true});

      if (res.size && res.size > 40 * 1000000) {
        Alert.alert('File too big', 'You can upload only file upto 40mb size.');
        return;
      }

      setFile({
        uri: res.path,
        name: res.filename || 'test.jpeg',
        mime: res.mime || 'image/jpeg',
        type: 'image',
      });
    } catch (e) {
      Snackbar.show({
        text: 'No image picked',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (res.size && res.size > 40 * 1000000) {
        Alert.alert('File too big', 'You can upload only file upto 40mb size.');
        return;
      }

      setFile({
        uri: res.uri,
        name: res.name,
        mime: res.type || 'application/pdf',
        type: 'pdf',
      });
    } catch (e) {
      if (DocumentPicker.isCancel(e)) {
        return;
      }

      Snackbar.show({
        text: 'No pdf picked',
        backgroundColor: flatRed,
        textColor: '#fff',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const onAttachPress = () => {
    if (Platform.OS === 'android') {
      AndroidPicker.show(
        {
          title: '',
          items: ['Image', 'PDF'],
          cancelText: 'Cancel',
        },
        (index) => {
          if (index === 0) {
            pickImage();
            return;
          }

          if (index === 1) {
            pickFile();
            return;
          }
        },
      );
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose Option',
          options: ['Image', 'PDF', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) {
            pickImage();
            return;
          }

          if (index === 1) {
            pickFile();
            return;
          }
        },
      );
    }
  };

  const createWork = async () => {
    try {
      const form = new FormData();

      form.append(
        'info',
        JSON.stringify({
          title,
          description,
          allowLate,
          dueDate,
        }),
      );

      console.log(file?.name, file?.mime, file?.uri);

      if (file) {
        form.append(file.type, {
          // @ts-ignore
          name: file.name,
          type: file.mime,
          uri:
            Platform.OS === 'android'
              ? file.uri
              : file.uri.replace('file://', ''),
        });
      }

      console.log(form);

      await axios.post(`${assignUrl}/${props.currentClass.id}`, form, {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      });
    } catch (e) {
      console.log(e);
      Alert.alert('Oops!', 'Something went wrong! please try again later');
    }
  };

  return (
    <View style={ContainerStyles.parent}>
      <Header
        centerComponent={{
          text: 'Create Classwork',
          style: {fontSize: 24, color: '#fff', fontWeight: '600'},
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: '#ffff',
          size: 26,
          onPress: props.navigation.goBack,
        }}
      />
      <ScrollView style={{marginTop: 30}}>
        <Input label="Title" onChangeText={setTitle} defaultValue={title} />
        <Input
          label="Description"
          numberOfLines={2}
          defaultValue={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={{padding: 20}}
          onPress={() => setPickerType('date')}>
          <Text h4 h4Style={TextStyles.h4Style}>
            Due Date:{' '}
          </Text>
          <Text style={styles.timeRangeText}>{dueDate.toString()}</Text>
        </TouchableOpacity>

        {pickerType ? (
          <DateTimePicker
            value={dueDate}
            mode={pickerType}
            onChange={handleDate}
          />
        ) : null}

        <View style={{paddingHorizontal: 20}}>
          <CheckBox
            checked={allowLate}
            onPress={() => setAllowLate(!allowLate)}
            title="Allow late submission"
          />
        </View>

        <Button
          title="Add Attachment"
          titleStyle={{color: commonBlue}}
          icon={{name: 'add', color: commonBlue}}
          onPress={onAttachPress}
          type="outline"
          containerStyle={{paddingHorizontal: 20, marginVertical: 10}}
        />

        <Button
          title="Create Classwork"
          containerStyle={{paddingHorizontal: 20}}
          onPress={createWork}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  timeRangeText: {
    fontSize: 16,
    textDecorationColor: commonGrey,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
  },
});

const mapStateToProps = (state: StoreState) => {
  return {
    currentClass: state.currentClass!,
    token: state.token!,
  };
};

export default connect(mapStateToProps)(CreateAssign);
