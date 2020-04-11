import { getValue, getEnvAttr } from "../../util/ObjectUtil.js";
import { generateCode, isTrue } from '../../util/code.js';

export function checkVBind (vm, vnode) {
  if (vnode.nodeType !== 1) {// 非标签节点
    return;
  }
  let attrNames = vnode.elm.getAttributeNames();
  for (let i = 0; i < attrNames.length; i++) {
    if (attrNames[i].indexOf('v-bind:') === 0 || attrNames[i].indexOf(':') === 0) {
      vBind(vm, vnode, attrNames[i], vnode.elm.getAttribute(attrNames[i]));
    }
  }
}

// name -> v-bind:src 
// value -> imgSrc
function vBind (vm, vnode, name, value) {
  let k = name.split(':')[1];
  if (/^{[\w\W+]+}$/.test(value)) {// {red: obj.x < 2, blue: obj.x > 2}
    let str = value.substring(1, value.length - 1).trim();//去除{}，red: obj.x < 2, blue: obj.x > 2
    let expressionList = str.split(',');
    let result = analysisExpression(vm, vnode, expressionList);
    vnode.elm.setAttribute(k, result);
  } else {
    let v = getValue(vm._data, value);
    vnode.elm.setAttribute(k, v);
  }
}

// 解析表达式 [red: obj.x < 2, blue: obj.x > 2]
function analysisExpression (vm, vnode, expressionList) {
  // 获取当前环境的变量
  let attr = getEnvAttr(vm, vnode);
  // 判断表达式是否成立
  // 拼组result
  let envCode = generateCode(attr);
  let result = '';
  for (let i = 0; i < expressionList.length; i++) {
    let site = expressionList[i].indexOf(':');
    if (site > -1) {
      let code = expressionList[i].substring(site + 1, expressionList[i].length);// obj.x < 2
      // 结合envCode，判断表达式是否成立
      if (isTrue(code, envCode)) {
        result += expressionList[i].substring(0, site) + ',';
      }
    } else {// 没有冒号，直接拼接
      result += expressionList[i] + ',';
    }
  }
  if (result.length > 0) {
    result = result.substring(0, result.length - 1);
  }
  return result;
}