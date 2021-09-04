import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import {Button, Text} from 'react-native-elements';
import {useHistory} from 'react-router-dom';

import Group171 from '../../shared/images/Group171.svg';
import Group12 from '../../shared/images/Group12.svg';
import Group5 from '../../shared/images/Group5.svg';
import Group126 from '../../shared/images/Group126.svg';
import Group115 from '../../shared/images/Group115.svg';
import Group108 from '../../shared/images/Group108.svg';
import Group95 from '../../shared/images/Group95.svg';

import {root, websiteRoot} from '../../shared/utils/urls';

const Home = () => {
  const width = useWindowDimensions().width;
  const history = useHistory();

  return (
    <ScrollView>
      <View style={styles.hero}>
        <View
          style={[styles.header, {paddingHorizontal: width < 768 ? 20 : 200}]}>
          <Image
            source={require('../../shared/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          <Button title="Open App" onPress={() => history.push('/auth')} />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.headingText}>Complete classroom toolkit</Text>
          <Text style={styles.subText}>
            Handle your classes and tests hassle free with ease of the app
          </Text>

          <Button
            title="Open App"
            type="outline"
            onPress={() => history.push('/auth')}
            buttonStyle={{padding: 5, borderRadius: 1}}
            containerStyle={{marginTop: 10}}
          />
          <Group171 />
        </View>
      </View>

      <View style={styles.midContent}>
        <View style={styles.midTextContainer}>
          <Text style={styles.midTextHeading}>How does it works</Text>
          <Text style={[styles.midTextSub, {marginTop: 10}]}>
            Easy to use app which help you manage your classes and tests hassle
            free meeting your almost every need
          </Text>
        </View>

        <View style={styles.midGroupContainer}>
          <View style={styles.midBoxContainer}>
            <Group12 />
            <Text style={{fontSize: 16}}>
              Easy to use interface, jump to your new class with just a click.
              Be ready to take your class to the moon
            </Text>
          </View>

          <View style={styles.midBoxContainer}>
            <Group5 />
            <Text style={{fontSize: 16}}>
              Create one of the most secure objective tests with features like
              randomizing options and questions.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.midContent}>
        <View style={styles.midTextContainer}>
          <Text style={styles.midTextHeading}>Why Choose us</Text>
          <Text style={styles.midTextSub}>
            Some of the features, you might not want to miss.
          </Text>
        </View>

        <View style={styles.boxParentContainer}>
          <View style={styles.trulyCenter}>
            <View style={[styles.boxContainer, {backgroundColor: '#000637'}]}>
              <Group95 />
            </View>
            <Text style={styles.boxHeading}>Be Creative</Text>
            <Text style={styles.boxSubText}>with easy to use interface</Text>
          </View>

          <View style={styles.trulyCenter}>
            <View style={[styles.boxContainer, {backgroundColor: '#ffad00'}]}>
              <Group108 />
            </View>
            <Text style={styles.boxHeading}>Stay Ahead</Text>
            <Text style={styles.boxSubText}>with realtime announcements</Text>
          </View>

          <View style={styles.trulyCenter}>
            <View style={[styles.boxContainer, {backgroundColor: '#bbbbf2'}]}>
              <Group126 />
            </View>
            <Text style={styles.boxHeading}>Video Lessons</Text>
            <Text style={styles.boxSubText}>with our standard plan</Text>
          </View>

          <View style={styles.trulyCenter}>
            <View style={[styles.boxContainer, {backgroundColor: '#5ed6b3'}]}>
              <Group115 />
            </View>
            <Text style={styles.boxHeading}>Fully yours</Text>
            <Text style={styles.boxSubText}>use like it's your own</Text>
          </View>
        </View>
      </View>

      <View style={{paddingHorizontal: 100, marginTop: 20}}>
        <ImageBackground
          source={require('../../shared/images/gdpr.jpg')}
          style={styles.contactImage}>
          <Text style={styles.midTextHeading}>
            Any feature request or improvements you have in mind?
          </Text>

          <a
            href="mailto:easyteach.support@inddex.co"
            style={{textDecoration: 'none'}}>
            <Button
              title="Contact us"
              type="outline"
              buttonStyle={{
                borderRadius: 50,
                backgroundColor: '#fff',
                marginTop: 18,
              }}
            />
          </a>
        </ImageBackground>
      </View>

      <View style={styles.lastBoxContainer}>
        <View style={{marginVertical: 10}}>
          <Image
            source={require('../../shared/images/icon.png')}
            style={{width: 250, height: 80}}
            resizeMode="contain"
          />
          <Text>easyteach.support@inddex.co</Text>
        </View>

        <View style={{marginVertical: 10}}>
          <Text style={[styles.boxHeading, {fontSize: 20}]}>Links</Text>
          <a
            href="https://play.google.com/store/apps/details?id=com.hcodes.easyteach"
            style={{textDecoration: 'none'}}>
            <Text style={{fontSize: 16}}>Mobile App</Text>
          </a>
          <a href={`${websiteRoot}/auth`} style={{textDecoration: 'none'}}>
            <Text style={{fontSize: 16}}>Web App</Text>
          </a>
          <a href={`${websiteRoot}`} style={{textDecoration: 'none'}}>
            <Text style={{fontSize: 16}}>Website</Text>
          </a>
          <a href={`${root}/privacy`} style={{textDecoration: 'none'}}>
            <Text style={{fontSize: 16}}>Privacy Policy</Text>
          </a>
        </View>

        <View style={{width: 200, marginVertical: 10}}>
          <a
            href="https://play.google.com/store/apps/details?id=com.hcodes.easyteach"
            target="_blank"
            style={{textDecoration: 'none'}}>
            <Image
              source={require('../../shared/images/google-play-badge.png')}
              style={{height: 80, width: 200}}
            />
          </a>
          <Text>
            Google Play and the Google Play logo are trademarks of Google LLC.
          </Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text>
          Copyright © <Text style={{color: '#ff1d1d'}}>Inddex</Text>. All rights
          reserved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#f7f8fa',
    width: '100%',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    width: 200,
    height: 100,
  },
  heroContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  headingText: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 20,
    fontSize: 18,
  },
  midContent: {
    width: '100%',
    padding: 20,
  },
  midTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  midTextHeading: {
    fontSize: 32,
    fontWeight: '600',
  },
  midTextSub: {
    fontSize: 18,
  },
  midGroupContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 100,
    width: '100%',
  },
  midBoxContainer: {
    justifyContent: 'center',
    width: 220,
    height: 180,
    alignItems: 'center',
  },
  boxContainer: {
    height: 256,
    width: 256,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  boxParentContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  trulyCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxHeading: {
    fontSize: 18,
    fontWeight: '600',
  },
  boxSubText: {
    fontSize: 15,
  },
  contactImage: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastBoxContainer: {
    padding: 20,
    paddingHorizontal: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  footerContainer: {
    padding: 20,
    marginHorizontal: 100,
    borderTopColor: '#000',
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
