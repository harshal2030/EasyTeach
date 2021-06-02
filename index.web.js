import React from 'react';
import {AppRegistry} from 'react-native';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import App from './web/App';

import {name as appName} from './app.json';
import {store} from './shared/global';

// Generate required css
import MaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';

const iconFontStyles = `
@font-face {
  src: url(${MaterialIcons});
  font-family: 'MaterialIcons';
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
      <SafeAreaProvider>
        <Router>
          <App />
        </Router>

        <ToastContainer position="bottom-left" />
      </SafeAreaProvider>
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
