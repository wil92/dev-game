import {Attribute, Model, ToOne} from '../../core';

@Model()
export default class Provider {
    @Attribute({type: String})
    id;

    @Attribute({type: String})
    provider;

    @Attribute({type: String})
    scope;

    @Attribute({type: String, unique: true, required: true})
    username;

    @Attribute({type: String})
    avatar;

    @Attribute({type: String})
    url;

    @Attribute({type: String})
    name;

    @Attribute({type: String})
    token;

    @ToOne({model: 'User'})
    user;
}
