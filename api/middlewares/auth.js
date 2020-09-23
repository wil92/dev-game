import {Inject, Injectable} from "../../core";
import {Jwt} from "../services";
import {Users} from "../repositories";

@Injectable()
export class Auth {

    @Inject(Jwt)
    jwt;

    @Inject(Users)
    userRepository;

    next(req, res, next) {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.replace(/^Bearer /g, '');
            try {
                if (this.jwt.validateJwt(token)) {
                    const {username} = this.jwt.decodeJwt(token);
                    return this.userRepository.findOne({username}).then(user => {
                        req.user = user;
                        next();
                    });
                }
            }catch (ignore){}
        }
        res.status(401).send({error: 'not authorized session'});
    }
}
