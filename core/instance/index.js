import { initMixin } from './init.js';
import { renderMixin } from './render.js';

//定义Due
function Due (options) {
    this._init(options);
    if (this._created !== null) {
        this._created.call(this);
    }
    this._render();
}

initMixin(Due);
renderMixin(Due);

export default Due;