import React, {useState, useRef} from 'react';
import {View, StyleSheet, Text, Image, ImageBackground} from 'react-native';
import {Input, Button} from 'react-native-elements';
import {Picker} from '@react-native-picker/picker';
import {toast} from 'react-toastify';
import LightBox from 'react-native-lightbox-v2';
import Dialog from 'react-native-dialog';
import crossIcon from '@iconify-icons/entypo/cross';
import plusIcon from '@iconify-icons/entypo/plus';
import CameraAlt from '@iconify-icons/ic/round-camera-alt';
import dotIcon from '@iconify-icons/entypo/dots-three-vertical';

import {TouchableIcon} from '../components';

import {commonBlue, flatRed, greyWithAlpha} from '../../shared/styles/colors';
import {staticImageExtPattern} from '../../shared/utils/regexPatterns';

type Props = {
  onAddQuestionPress: (data: {
    question: string;
    options: string[];
    image: File | null;
    correct: string;
  }) => void;
};

const CreateQuestionCard: React.FC<Props> = (props) => {
  const [data, setData] = useState<string[]>(['', '', '']);
  const [question, setQuestion] = useState<string>('');
  const [correct, setCorrect] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(data[0]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const onChangeText = (text: string, i: number) => {
    const list = [...data];
    list[i] = text;
    setData(list);
  };

  const onRemoveOption = (index: number) => {
    const list = [...data];
    list.splice(index, 1);
    setData(list);
  };

  const addOption = () => {
    const list = [...data];
    list.push('');
    setData(list);
  };

  const onAddQuestion = () => {
    if (question.trim().length === 0) {
      toast.error('Question is required');
      return;
    }

    const options = data.filter((val) => val.trim().length !== 0);
    if (options.length < 1) {
      toast.error('At least 1 option is required');
      return;
    }

    let correctAns = correct;

    if (correct === '') {
      correctAns = data[0];
    }

    console.log({question, options, image, correct: correctAns});
    props.onAddQuestionPress({question, options, image, correct: correctAns});

    setQuestion('');
    setData(['', '', '']);
    setCorrect('');
    setImage(null);
    setPreview('');
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!staticImageExtPattern.test(file.name)) {
        toast.error('Please upload valid image file');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const renderFullScreenImage = () => {
    return (
      <Image
        source={{uri: preview}}
        style={{width: '100%', height: '100%'}}
        resizeMode="contain"
      />
    );
  };

  return (
    <View style={styles.root}>
      <Input
        label="Question"
        value={question}
        numberOfLines={2}
        multiline
        onChangeText={setQuestion}
      />
      <input
        type="file"
        accept="image/*"
        onChange={onImage}
        style={{display: 'none'}}
        ref={uploadRef}
      />

      {preview && (
        <ImageBackground
          source={{uri: preview}}
          resizeMode="contain"
          style={styles.imageStyle}>
          <View style={styles.overlay}>
            <TouchableIcon
              icon={dotIcon}
              size={28}
              color="#fff"
              containerStyle={{
                backgroundColor: greyWithAlpha(0.4),
                padding: 2,
                margin: 5,
              }}
              onPress={() => setDialogVisible(true)}
            />
          </View>
        </ImageBackground>
      )}

      <View style={styles.optionContainer}>
        {data.map((text, i) => {
          return (
            <Input
              value={text}
              key={i}
              label={`Option ${i + 1}`}
              onChangeText={(str) => onChangeText(str, i)}
              rightIcon={
                data.length > 1 && (
                  <TouchableIcon
                    icon={crossIcon}
                    size={24}
                    color={flatRed}
                    onPress={() => onRemoveOption(i)}
                  />
                )
              }
            />
          );
        })}

        <View style={styles.answerContainer}>
          <Text style={{fontWeight: '700', fontSize: 15}}>
            Correct Answer:{' '}
          </Text>
          <Picker
            selectedValue={correct}
            style={{minWidth: 150, height: 30}}
            onValueChange={(value) => setCorrect(value)}>
            {data.map((text, i) => {
              if (data[i].trim().length !== 0) {
                return <Picker.Item value={text} label={text} key={i} />;
              }
            })}
          </Picker>
        </View>
      </View>

      <Dialog.Container
        visible={dialogVisible}
        onBackdropPress={() => setDialogVisible(false)}>
        <Dialog.Title>Choose Option</Dialog.Title>
        <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
          <Dialog.Button
            label="Change Image"
            onPress={() => {
              setDialogVisible(false);
              uploadRef.current?.click();
            }}
          />
          <LightBox renderContent={renderFullScreenImage}>
            <Text style={{marginLeft: 10, color: '#169689'}}>
              SHOW IMAGE ON FULL SCREEN
            </Text>
          </LightBox>
          <Dialog.Button
            label="Remove Image"
            color={flatRed}
            onPress={() => {
              setImage(null);
              setPreview('');
              setDialogVisible(false);
            }}
          />
        </View>
      </Dialog.Container>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Option"
          type="outline"
          icon={<TouchableIcon icon={plusIcon} color={commonBlue} size={24} />}
          containerStyle={styles.buttons}
          onPress={addOption}
        />
        {!preview && (
          <Button
            title="Add Image"
            type="outline"
            icon={
              <TouchableIcon icon={CameraAlt} color={commonBlue} size={24} />
            }
            containerStyle={styles.buttons}
            onPress={() => uploadRef.current!.click()}
          />
        )}
        <Button
          title="Add Question"
          containerStyle={styles.buttons}
          onPress={onAddQuestion}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 20,
    flex: 1,
    width: '100%',
    maxWidth: 950,
  },
  optionContainer: {
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  buttons: {
    marginHorizontal: 20,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStyle: {
    height: 100,
    width: '100%',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#000',
  },
  imageOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: greyWithAlpha(0.4),
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: greyWithAlpha(0.1),
  },
});

export {CreateQuestionCard};
