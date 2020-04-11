//创建虚拟节点<->模板的映射,渲染虚拟节点
import { getValue } from '../util/ObjectUtil.js';

//通过模板找节点
let template2Vnode = new Map();
function setTemplate2Vnode (template, vnode) {
    let templateName = getTemplateName(template);
    let vnodeSet = template2Vnode.get(templateName);
    if (vnodeSet) {//模板存在
        vnodeSet.push(vnode);
    } else {
        template2Vnode.set(templateName, [vnode]);
    }
}

//通过节点找模板
let vnode2Template = new Map();
function setVnode2Template (template, vnode) {
    let templateSet = vnode2Template.get(vnode);
    if (templateSet) {
        templateSet.push(getTemplateName(template));
    } else {
        vnode2Template.set(vnode, [getTemplateName(template)]);
    }
}

// 预备渲染，创建虚拟节点<->模板的映射
export function prepareRender (vm, vnode) {
    if (vnode === null) {
        return;
    }
    if (vnode.nodeType === 3) {//文本节点
        analysisTemplateString(vnode);
    }
    if (vnode.nodeType === 0) {//虚拟节点
        setTemplate2Vnode(vnode.data, vnode);
        setVnode2Template(vnode.data, vnode);
    }
    analysisAttr(vm, vnode);// 分析属性里的模板
    // if (vnode.nodeType === 1) {//标签节点

    // }
    for (let i = 0; i < vnode.children.length; i++) {
        //递归调用
        prepareRender(vm, vnode.children[i]);
    }
}

// render混入函数
export function renderMixin (Due) {
    Due.prototype._render = function () {
        renderNode(this, this._vnode);
    }
}

// 根据模板数据data找到需要渲染的节点进行渲染
export function renderData (vm, data) {
    let vnodes = template2Vnode.get(data);
    if (vnodes) {
        for (let i = 0; i < vnodes.length; i++) {
            renderNode(vm, vnodes[i]);
        }
    }
}

//根据template查找vnode
export function getVNodeByTemplate (template) {
    return template2Vnode.get(template);
}

//清除索引
export function clearMap () {
    template2Vnode.clear();
    vnode2Template.clear();
}

//导出template2Vnode
export function getTemplate2Vnode () {
    return template2Vnode;
}

//导出vnode2Template
export function getVnode2Template () {
    return vnode2Template;
}

//获取模板字符串的名称
function getTemplateName (template) {
    if (template.substring(0, 2) === '{{' && template.substring(template.length - 2, template.length) === "}}") {
        return template.substring(2, template.length - 2);
    } else {
        return template;
    }
}

//分析模板字符串
function analysisTemplateString (vnode) {
    let templateString = vnode.text.trim().match(/\{\{[a-zA-Z0-9_.]+\}\}/g);
    for (let i = 0; templateString && i < templateString.length; i++) {
        setTemplate2Vnode(templateString[i], vnode);
        setVnode2Template(templateString[i], vnode);
    }
}

//获取模板的值
function getTemplateValue (objs, templateName) {
    for (let i = 0; i < objs.length; i++) {
        let temp = getValue(objs[i], templateName);
        if (temp !== null) {
            return temp;
        }
    }
    return null;
}

//渲染节点
function renderNode (vm, vnode) {
    if (vnode.nodeType === 3) {//文本节点
        let templates = vnode2Template.get(vnode);
        if (templates) {
            let result = vnode.text;
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if (templateValue !== null) {
                    result = result.replace("{{" + templates[i] + "}}", templateValue);
                }
            }
            vnode.elm.nodeValue = result;// 改变节点的值
        }
    } else if (vnode.nodeType === 1 && vnode.tag === 'INPUT') {
        let templates = vnode2Template.get(vnode);
        if (templates) {
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if (templateValue !== null) {
                    vnode.elm.value = templateValue;
                }
            }
        }
    } else {
        for (let i = 0; i < vnode.children.length; i++) {
            renderNode(vm, vnode.children[i]);
        }
    }
}

// 分析属性
function analysisAttr (vm, vnode) {
    if (vnode.nodeType !== 1) {// 非标签节点
        return;
    }
    let attrNames = vnode.elm.getAttributeNames();
    if (attrNames.indexOf('v-model') > -1) {
        setTemplate2Vnode(vnode.elm.getAttribute('v-model'), vnode);
        setVnode2Template(vnode.elm.getAttribute('v-model'), vnode);
    }
}

