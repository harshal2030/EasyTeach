import React from 'react';
import {AppRegistry} from 'react-native';
import {Provider} from 'react-redux';
import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeProvider} from '@material-ui/styles';

import App from './web/App';

import {commonBlue} from './shared/styles/colors';

import {name as appName} from './app.json';
import {store} from './shared/global';

// Generate required css
import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import AntDesign from 'react-native-vector-icons/Fonts/AntDesign.ttf';
import Entypo from 'react-native-vector-icons/Fonts/Entypo.ttf';
import EvilIcons from 'react-native-vector-icons/Fonts/EvilIcons.ttf';
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf';
import Octicons from 'react-native-vector-icons/Fonts/Octicons.ttf';
import Feather from 'react-native-vector-icons/Fonts/Feather.ttf';
import FA4Icon from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import FA5IconSolid from 'react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf';
import FA5IconRegular from 'react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf';
import FontAwesome from 'react-native-vector-icons/Fonts/FontAwesome.ttf';

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
@font-face {
  src: url(${FA4Icon});
  font-family: FontAwesome;
}
@font-face {
  src: url(${FA5IconSolid});
  font-family: 'FontAwesome5_Solid';
}
@font-face {
  src: url(${FA5IconRegular});
  font-family: 'FontAwesome5_Regular';
}
@font-face {
  src: url(${FontAwesome});
  font-family: 'FontAwesome';
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

const theme = createMuiTheme({
  palette: {
    primary: {
      main: commonBlue,
    },
  },
});

const Wrapper = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
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
