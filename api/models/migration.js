import {Attribute, Model} from '../../core';

@Model()
export default class Migration {
    @Attribute({type: String})
    version;
}
