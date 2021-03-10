import React from 'react';
import {AppRegistry} from 'react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';

import {name as appName} from './app.json';
import App from './src/App';
import {store} from './src/global';

// Generate required css
import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import AntDesign from 'react-native-vector-icons/Fonts/AntDesign.ttf';
import Entypo from 'react-native-vector-icons/Fonts/Entypo.ttf';
import EvilIcons from 'react-native-vector-icons/Fonts/EvilIcons.ttf';
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf';
import Octicons from 'react-native-vector-icons/Fonts/Octicons.ttf';
import Feather from 'react-native-vector-icons/Fonts/Feather.ttf';

const iconFontStyles = `@font-face {
  src: url(${iconFont});
  font-family: FontAwesome;
}
@font-face {
  src: url(${AntDesign});
  font-family: AntDesign;
}
@font-face {
  src: url(${EvilIcons});
  font-family: EvilIcons;
}
@font-face {
  src: url(${Entypo});
  font-family: Entypo;
}
@font-face {
  src: url(${Ionicons});
  font-family: Ionicons;
}
@font-face {
  src: url(${Octicons});
  font-family: Octicons;
}
@font-face {
  src: url(${Feather});
  font-family: Feather;
}
`;

// Create stylesheet
const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}

// Inject stylesheet
document.head.appendChild(style);

const Wrapper = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

if (module.hot) {
  module.hot.accept();
}
AppRegistry.registerComponent(appName, () => Wrapper);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
