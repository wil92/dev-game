import {Inject, Injectable} from "../../core";
import {Jwt} from "../services";

@Injectable()
export class Auth {

    @Inject(Jwt)
    jwt;

    next(req, res, next) {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.replace(/^Bearer /g, '');
            try {
                if (this.jwt.validateJwt(token)) {
                    return next();
                }
            }catch (ignore){}
        }
        res.status(401).send({error: 'not authorized session'});
    }
}
