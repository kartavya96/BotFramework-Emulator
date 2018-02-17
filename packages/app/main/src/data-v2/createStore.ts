//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { applyMiddleware, createStore, Store } from 'redux';
import { WebSocketServer } from 'electron-ipcmain-websocket';
import createPromiseMiddleware from 'redux-promise-middleware';
import createSagaMiddleware from 'redux-saga';
import createWebSocketBridge from 'redux-websocket-bridge';
import reducers from './reducer';
import rootSaga from './sagas';
import { IState, DEFAULT_STATE } from './state';



export default function create(window): Promise<Store<IState>> {
  return new Promise<Store<IState>>((resolve, reject) => {
    new WebSocketServer(window).on('connection', connection => {
      const sagaMiddleware = createSagaMiddleware<IState>();
      const store: Store<IState> = applyMiddleware(
        store => next => action => {
          console.log(action);

          return next(action);
        },
        createPromiseMiddleware(),
        createWebSocketBridge(() => connection),
        sagaMiddleware,
        store => next => action => {
          console.log(action);

          return next(action);
        }
      )(createStore)(reducers, DEFAULT_STATE) as Store<IState>;

      sagaMiddleware.run(rootSaga);

      resolve(store);
    })
  });
}