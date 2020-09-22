import {Injectable} from "../../core";

@Injectable()
export class Off {

    next(req, res) {
        res.status(401).send({error: 'not authorized session'});
    }
}
