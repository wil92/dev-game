import {Attribute, Model, ToMany} from '../../core';

@Model()
export default class User {
    @Attribute({type: String, unique: true, required: true})
    username;

    @Attribute({type: String})
    email;

    @Attribute({type: String})
    password;

    @ToMany({model: 'Provider'})
    providers;
}
