import {Model, ToMany} from '../../core';

@Model()
export default class Position {
    @ToMany({model: 'User'})
    users;
}
