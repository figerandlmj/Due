//定义虚拟dom
export default class VNode {
    constructor(tag, elm, children, text, data, parent, nodeType) {
        this.tag = tag;//标签类型, DIV,SPAN,INPUT,#TEXT
        this.elm = elm;//对应的真实节点
        this.children = children;//当前节点下子节点
        this.text = text;//当前虚拟节点中的文本
        this.data = data;//VNodeData, 暂时保留,毫无意义
        this.parent = parent;//父级节点
        this.nodeType = nodeType;//节点类型
        this.env = {};//当前节点的环境变量
        this.instructions = null;//存放指令
        this.template = [];//当前节点涉及的模板
    }
}