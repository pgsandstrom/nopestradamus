import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';

import Main from './main';
import rootReducer from './rootReducer';

import '../css/reset.scss';
import '../css/global.scss';
import '../css/_util_global.scss';
import '../css/styles.scss';

const store = createStore(rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // eslint-disable-line no-underscore-dangle
  applyMiddleware(thunk));

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
