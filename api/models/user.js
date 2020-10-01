import {Attribute, Model, ToMany} from '../../core';

@Model()
export default class User {
    @Attribute({type: String, unique: true, required: true})
    username;

    @Attribute({type: String})
    email;

    @Attribute({type: String})
    password;

    @Attribute({type: Number})
    points;

    @Attribute({type: Number})
    total;

    @Attribute({type: Number})
    wins;

    @ToMany({model: 'Provider'})
    providers;
}
