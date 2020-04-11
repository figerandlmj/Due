//数据代理(data -> render)
import { renderData } from './render.js';
import { rebuild } from './mount.js';
import { getValue } from '../util/ObjectUtil.js';

//data代理
export function constructProxy (vm, obj, namespace) {
    let proxyObj = null;
    if (obj instanceof Array) {//data为数组
        proxyObj = new Array(obj.length);
        for (let i = 0; i < obj.length; i++) {
            proxyObj[i] = constructProxy(vm, obj[i], namespace);//代理数组中每一项
        }
        proxyObj = proxyArr(vm, proxyObj, namespace);//代理数组本身
    } else if (obj instanceof Object) {//data为对象
        proxyObj = constructObjectProxy(vm, obj, namespace);
    } else {
        throw new Error('data error!');
    }
    return proxyObj;
}

//代理数组
function proxyArr (vm, arr, namespace) {
    let obj = {
        eleType: 'Array',
        toString () {
            let result = '';
            for (let i = 0; i < arr.length; i++) {
                result += ', ';
            }
            return result.substring(0, result.length - 2);
        },
        push () { },
        pop () { },
        shift () { },
        unshift () { }
    };
    defArrayFunc.call(vm, obj, 'push', namespace, vm);
    defArrayFunc.call(vm, obj, 'pop', namespace, vm);
    defArrayFunc.call(vm, obj, 'shift', namespace, vm);
    defArrayFunc.call(vm, obj, 'unshift', namespace, vm);
    arr.__proto__ = obj;//改变数组的原型
    return arr;
}

//代理数组的方法
const arrayProp = Array.prototype;//数组原型
function defArrayFunc (obj, func, namespace, vm) {
    Object.defineProperty(obj, func, {
        enumerable: true,
        configurable: true,
        value: function (...args) {
            let original = arrayProp[func];
            const result = original.apply(this, args);
            console.log(getNamespace(namespace, ""));
            rebuild(vm, getNamespace(namespace, ""));//重新构建节点
            renderData(vm, getNamespace(namespace, ""));
            return result;
        }
    });
}

//代理对象
function constructObjectProxy (vm, obj, namespace) {
    const proxyObj = {};
    for (let prop in obj) {
        const propNamespace = getNamespace(namespace, prop);
        Object.defineProperty(proxyObj, prop, {
            configurable: true,
            get () {
                return obj[prop];
            },
            set (value) {
                console.log(propNamespace);
                obj[prop] = value;
                renderData(vm, propNamespace);
            }
        });
        propNamespace.indexOf('.') == -1 && Object.defineProperty(vm, prop, {
            configurable: true,
            get () {
                return obj[prop];
            },
            set (value) {
                console.log(propNamespace);
                obj[prop] = value;
                let val = getValue(vm._data, propNamespace);
                if (val instanceof Array) {// 设置的值为数组
                    rebuild(vm, propNamespace);//重新构建节点
                    renderData(vm, propNamespace);
                } else {
                    renderData(vm, propNamespace);
                }
            }
        });
        if (obj[prop] instanceof Object) {
            proxyObj[prop] = constructProxy(vm, obj[prop], propNamespace);
        }
    }
    return proxyObj;
}

//获取命名空间
function getNamespace (nowNamespace, nowProp) {
    if (nowNamespace === null || nowNamespace === '') {
        return nowProp;
    } else if (nowProp === null || nowProp === '') {
        return nowNamespace;
    } else {
        return nowNamespace + '.' + nowProp;
    }
}