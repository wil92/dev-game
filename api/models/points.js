import {Attribute, Model, ToOne} from '../../core';
import User from "./user";

@Model()
export default class Points {
    @Attribute({type: Number})
    value;

    @ToOne({model: User})
    user;
}
