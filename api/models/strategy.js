import {Attribute, Model, ToOne} from '../../core';

@Model()
export default class Strategy {
    @Attribute({type: String, required: true})
    name;

    @Attribute({type: String})
    code;

    @Attribute({type: Boolean})
    valid;

    @Attribute({type: Boolean})
    active;

    @ToOne({model: 'User'})
    user;
}
