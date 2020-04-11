import VNode from "../../vdom/vnode.js";
import { getValue, clone } from '../../util/ObjectUtil.js'

//v-for

//instructions: 'item in list'
export function vforInit (vm, elm, parent, instructions) {
    //VNode(tag, elm, children, text, data, parent, nodeType)
    let virtualNode = new VNode(elm.nodeName, elm, [], "", getVirtualNodeData(instructions)[2], parent, 0);
    virtualNode.instructions = instructions;
    parent.elm.removeChild(elm);//删除ul下的子节点
    parent.elm.appendChild(document.createTextNode(''));//在ul下创建一个空的文本节点
    let resultSet = analysisInstructions(vm, elm, parent, instructions);
    return virtualNode;
}

//获取'item in list'中的list
function getVirtualNodeData (instructions) {
    let insSet = instructions.trim().split(' ');
    if (insSet.length !== 3 || (insSet[1] !== 'in' && insSet[1] !== 'of')) {
        throw new Error('v-for error!');
    }
    insSet.forEach(item => {
        item = item.trim();
    })
    return insSet;
}

//分析'(item,index) in list'
//在parent下创建tempDom子节点
//返回
//{ item: { name: '张三', age: 18 }, index: 0 }
//{ item: { name: '李四', age: 20 }, index: 1 }
function analysisInstructions (vm, elm, parent, instructions) {
    let insSet = getVirtualNodeData(instructions);//['item', 'in', 'list']
    let dataSet = getValue(vm._data, insSet[2]);
    if (!dataSet) {
        throw new Error('v-for data error!');
    }
    let resultSet = [];
    for (let i = 0; i < dataSet.length; i++) {
        let tempDom = document.createElement(elm.nodeName);
        tempDom.innerHTML = elm.innerHTML;
        let env = analysisEnv(insSet[0], dataSet[i], i);
        tempDom.setAttribute('env', JSON.stringify(clone(env)));
        parent.elm.appendChild(tempDom);
        resultSet.push(env);
    }
    return resultSet;
}

//当前节点环境变量 instructions: item/(item)/(item,index)
//返回obj: {item: value, index: index}
function analysisEnv (instructions, value, index) {
    if (/\([a-zA-Z0-9_$,]+\)/.test(instructions)) {//去括号
        instructions = instructions.trim();
        instructions = instructions.substring(1, instructions.length - 1);
    }
    //[item]/[item, index]
    let keys = instructions.split(',');
    if (keys.length == 0) {
        throw new Error('v-for error!');
    }
    let obj = {};
    if (keys.length >= 1) {
        obj[keys[0].trim()] = value;
    }
    if (keys.length >= 2) {
        obj[keys[1].trim()] = index;
    }
    return obj;
}