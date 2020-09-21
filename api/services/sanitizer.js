import {Injectable} from '../../core';

@Injectable()
export class Sanitizer {

    constructor() {}

    /**
     *
     * @param req {{body: *}}
     * @param expectedKeys {[string]}
     * @returns {boolean}
     */
    sanitizeRequestBody(req, res, expectedKeys) {
        if (!((req.body && expectedKeys &&
            !expectedKeys.reduce((p, k) => p || req.body[k] === undefined, false) &&
            Object.keys(req.body).length === expectedKeys.length))) {
            res.status(400).send({error: 'Invalid body'});
            return false;
        }
        return true;
    }
}
