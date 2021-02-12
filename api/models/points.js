import {Attribute, Model, ToOne} from '../../core';
import User from "./user";
import Position from "./position";

@Model()
export default class Points {
    @Attribute({type: Number})
    value;

    @Attribute({type: Number})
    difference;

    @Attribute({type: Number})
    position;

    @ToOne({model: User})
    user;

    @ToOne({model: Position})
    standing;
}
