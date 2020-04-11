import { getValue } from "../../util/ObjectUtil.js";

export function checkVOn (vm, vnode) {
  if (vnode.nodeType !== 1) {// 非标签节点
    return;
  }
  let attrNames = vnode.elm.getAttributeNames();
  for (let i = 0; i < attrNames.length; i++) {
    if (attrNames[i].indexOf('v-on:') === 0) {
      vOn(vm, vnode, attrNames[i].split(':')[1], vnode.elm.getAttribute(attrNames[i]));
    } else if (attrNames[i].indexOf('@') === 0) {
      vOn(vm, vnode, attrNames[i].split('@')[1], vnode.elm.getAttribute(attrNames[i]));
    }
  }
}

function vOn (vm, vnode, event, name) {
  let method = getValue(vm._methods, name);
  if (method) {
    if (event.indexOf('.') > -1) {// keydown.enter
      let eventArr = event.split('.');// [keydown, enter]
      let keyCode = getKeyCode(eventArr[1]);
      vnode.elm.addEventListener(eventArr[0], proxyExecute(vm, method, keyCode));
    } else {
      vnode.elm.addEventListener(event, proxyExecute(vm, method));
    }
  }
}

// 代理执行方法，改变this指向为vm
function proxyExecute (vm, method, keyCode) {
  return function (e) {
    console.log(e.keyCode)
    if (keyCode) {
      if (keyCode === e.keyCode) {
        method.call(vm);
      }
    } else {
      method.call(vm);
    }
  }
}

// 获取keyCode
function getKeyCode (name) {
  let keyCode = null;
  switch (name) {
    case 'enter': {
      keyCode = 13;
      break;
    }
    case 'tab': {
      keyCode = 9;
      break;
    }
    default: break;
  }
  return keyCode;
}