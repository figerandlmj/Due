//创建虚拟节点和挂载el
import VNode from '../vdom/vnode.js';
import { prepareRender, getTemplate2Vnode, getVnode2Template, getVNodeByTemplate, clearMap } from './render.js';
import { vmodel } from './grammer/vmodel.js';
import { vforInit } from './grammer/vfor.js';
import { checkVBind } from './grammer/vbind.js';
import { checkVOn } from './grammer/von.js';
import { mergeAttr } from '../util/ObjectUtil.js';

//使用$mount来挂载节点
export function initMount (Due) {
    Due.prototype.$mount = function (el) {
        const vm = this;
        const rootDom = document.getElementById(el);
        mount(vm, rootDom);
    }
}

//指定el来挂载节点
export function mount (vm, elm) {
    //进行挂载
    console.log('begin mount');
    vm._vnode = constructVNode(vm, elm, null);
    console.log(vm._vnode);
    //预备渲染(建立模板节点索引,通过模板找vnode,通过vnode找模板)
    prepareRender(vm, vm._vnode);
    console.log(getTemplate2Vnode());
    console.log(getVnode2Template());
};

//创建虚拟节点(深度优先搜索)
function constructVNode (vm, elm, parent) {
    let vnode = analysisAttr(vm, elm, parent);
    if (vnode === null) {
        let text = getNodeText(elm);
        let data = null;
        let nodeType = elm.nodeType;
        let tag = elm.nodeName;
        vnode = new VNode(tag, elm, [], text, data, parent, nodeType);
        if (elm.nodeType === 1 && elm.getAttribute('env')) {//将带有env属性的标签节点的env合并
            vnode.env = mergeAttr(vnode.env, JSON.parse(elm.getAttribute('env')));
        } else {
            vnode.env = mergeAttr(vnode.env, parent ? parent.env : {});
        }
    }
    checkVBind(vm, vnode);
    checkVOn(vm, vnode);
    //处理子节点
    //如果是虚拟节点则获取其父节点下的childNodes
    let childNodes = vnode.nodeType === 0 ? vnode.parent.elm.childNodes : vnode.elm.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        let childVNode = constructVNode(vm, childNodes[i], vnode);
        if (childVNode instanceof VNode) {//返回单一节点
            vnode.children.push(childVNode);
        } else {//返回节点数组
            vnode.children = vnode.children.concat(childVNode);
        }
    }
    return vnode;
}

//获取节点文本(文本节点才有文本)
function getNodeText (elm) {
    if (elm.nodeType === 3) {// 文本节点
        return elm.nodeValue;
    } else {
        return "";
    }
}

//分析属性
function analysisAttr (vm, elm, parent) {
    if (elm.nodeType === 1) {//标签节点
        let attrs = elm.getAttributeNames();
        if (attrs.indexOf('v-model') > -1) {
            vmodel(vm, elm, elm.getAttribute('v-model'));
        }
        if (attrs.indexOf('v-for') > -1) {
            return vforInit(vm, elm, parent, elm.getAttribute('v-for'));
        }
    }
    return null;
}

//重新构建虚拟节点
export function rebuild (vm, template) {
    let vnode = getVNodeByTemplate(template);
    for (let i = 0; i < vnode.length; i++) {
        vnode[i].parent.elm.innerHTML = '';
        vnode[i].parent.elm.appendChild(vnode[i].elm);
        let result = constructVNode(vm, vnode[i].elm, vnode[i].parent);
        vnode[i].parent.children = [result];
        clearMap();//清除template<->vnode映射
        prepareRender(vm, vm._vnode);//重新建立template<->vnode映射
    }
}

