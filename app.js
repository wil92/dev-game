import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import {buildControllers} from './api/controllers';
import {addInjectableService, getService} from './core';
import {WebSocketConnection} from './api/services';
import {Main} from './game';

const app = express();

addInjectableService(WebSocketConnection);
addInjectableService(Main);

// run migrations
import migrate from "./core/migrate";

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// loading the controllers
const routes = buildControllers();
Object.keys(routes)
    .filter(key => Boolean(routes[key].router))
    .forEach(key => app.use('/api/', routes[key].router));

// start game
getService(Main).restartGame().then();

export default app;
