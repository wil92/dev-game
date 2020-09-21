import {Attribute, Model, ToMany} from '../../core';

@Model()
export default class User {
    @Attribute({type: String})
    id;

    @Attribute({type: String, unique: true, required: true})
    username;

    @Attribute({type: String, unique: true})
    email;

    @Attribute({type: String})
    password;

    @ToMany({model: 'Provider'})
    providers;
}
