import {Router} from 'express';
import {getService} from "./injection";

export function Controller({route}) {
    return function (target) {
        return class extends target {
            constructor(...args) {
                super(...args);
                let router = new Router();
                const keys = Object.getOwnPropertyNames(target.prototype);
                for (let key of keys) {
                    const element = target.prototype[key];
                    if (typeof element === 'object' && element.route) {
                        delete target.prototype[key];
                        element.func = element.func.bind(this);
                        element.middlewares.forEach(middleware => {
                            const middlewareIns = getService(middleware);
                            router.use(element.route, middlewareIns.next.bind(middlewareIns));
                        });
                        router[element.method](element.route, element.func);
                        this[element.key] = element.func;
                    }
                }
                if (route) {
                    const routerBase = new Router();
                    routerBase.use(route, router);
                    router = routerBase;
                }
                this.router = router;
            }
        };
    };
}

function buildMethod(target, key, descriptor, route, method, middlewares) {
    middlewares = middlewares || [];
    middlewares = typeof middlewares === 'function' ? [middlewares] : middlewares;
    target[key + '_endpoint'] = {method, func: descriptor.value, route, key, middlewares};
    return descriptor;
}

export function Get({route, middlewares}) {
    return function (target, key, descriptor) {
        return buildMethod(target, key, descriptor, route, 'get', middlewares);
    };
}

export function Post({route, middlewares}) {
    return function (target, key, descriptor) {
        return buildMethod(target, key, descriptor, route, 'post', middlewares);
    };
}

export function Delete({route, middlewares}) {
    return function (target, key, descriptor) {
        return buildMethod(target, key, descriptor, route, 'delete', middlewares);
    };
}

export function Patch({route, middlewares}) {
    return function (target, key, descriptor) {
        return buildMethod(target, key, descriptor, route, 'patch', middlewares);
    };
}

export function Put({route, middlewares}) {
    return function (target, key, descriptor) {
        return buildMethod(target, key, descriptor, route, 'put', middlewares);
    };
}
