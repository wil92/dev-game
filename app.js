import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import {buildControllers} from './api/controllers';
import {addInjectableService} from './core';
import {WebSocketConnection} from './api/services';
import {Main} from './game';

const app = express();

addInjectableService(WebSocketConnection);
addInjectableService(Main);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// loading the controllers
const routes = buildControllers();
Object.keys(routes)
    .filter(key => Boolean(routes[key].router))
    .forEach(key => app.use('/', routes[key].router));

export default app;
