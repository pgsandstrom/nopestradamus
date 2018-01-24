import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';

import Main from './main';
import store from './store';

import '../css/reset.scss';
import '../css/global.scss';
import '../css/_util_global.scss';
import '../css/styles.scss';

const content = document.getElementById('content');

ReactDOM.render(
  <AppContainer>
    <BrowserRouter>
      <Provider store={store}>
        <Main />
      </Provider>
    </BrowserRouter>
  </AppContainer>,
  content,
);

// Hotswap in changes:
if (module.hot) {
  module.hot.accept('./main', () => {
    const UpdatedApp = require('./main').default; // eslint-disable-line global-require
    ReactDOM.render(
      <AppContainer>
        <BrowserRouter>
          <Provider store={store}>
            <UpdatedApp />
          </Provider>
        </BrowserRouter>
      </AppContainer>,
      content,
    );
  });
}
