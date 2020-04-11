//获取obj[name], name可能为item.x
export function getValue (obj, name) {
    if (!obj) {
        return obj;
    }
    let nameList = name.split('.');
    let temp = obj;
    for (let i = 0; i < nameList.length; i++) {
        if (temp[nameList[i]] !== null && temp[nameList[i]] !== undefined) {
            temp = temp[nameList[i]];
        } else {
            return null;
        }
    }
    return temp;
}

//设置obj[name] = value, name可能为item.x
export function setValue (obj, name, value) {
    if (!obj) {
        return;
    }
    let arrList = name.split('.');
    let temp = obj;
    for (let i = 0; i < arrList.length - 1; i++) {
        if (temp[arrList[i]]) {
            temp = temp[arrList[i]];
        } else {
            return;
        }
    }
    temp[arrList[arrList.length - 1]] = value;
}

//合并对象
export function mergeAttr (obj, obj2) {
    if (!obj) {
        return clone(obj2);
    }
    if (!obj2) {
        return clone(obj);
    }
    let result = cloneObject(obj);
    let obj2Attrs = Object.getOwnPropertyNames(obj2);
    for (let i = 0; i < obj2Attrs.length; i++) {
        result[obj2Attrs[i]] = obj2[obj2Attrs[i]];
    }
    return result;
}

//克隆
export function clone (obj) {
    // JSON.parse(JSON.stringify(obj));//无法合并代理对象vm._data
    if (obj instanceof Array) {
        return cloneArray(obj);
    } else if (obj instanceof Object) {
        return cloneObject(obj);
    } else {
        return obj;
    }
}

//clone 数组
export function cloneArray (arr) {
    let result = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        result[i] = clone(arr[i]);
    }
    return result;
}

//clone对象
export function cloneObject (obj) {
    let result = {};
    let names = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < names.length; i++) {
        result[names[i]] = clone(obj[names[i]]);
    }
    return result;
}

// 获取当前环境变量
export function getEnvAttr (vm, vnode) {
    let result = mergeAttr(vm._data, vnode.env);
    result = mergeAttr(result, vm._computed);
    return result;
}

