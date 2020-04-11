//v-model
import { setValue } from '../../util/ObjectUtil.js';

export function vmodel (vm, elm, name) {
    elm.oninput = function (event) {
        setValue(vm._data, name, elm.value);// 在vm._data中找属性名为name的属性，设置其值为elm.value
    }
}