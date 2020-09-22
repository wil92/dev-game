import {Attribute, Model, ToOne} from '../../core';

@Model()
export default class Strategy {
    @Attribute({type: String, required: true})
    name;

    @Attribute({type: String})
    code;

    @Attribute({type: Boolean})
    valid;

    @ToOne({model: 'User'})
    user;
}
