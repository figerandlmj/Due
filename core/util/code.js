
// 根据attr环境变量对象生成可执行代码
export function generateCode (attr) {
  let code = '';
  for (let temp in attr) {
    code += 'let ' + temp + '=' + JSON.stringify(attr[temp]) + ';';
  }
  return code;
}

// 判断表达式是否成立
export function isTrue (expression, env) {
  let bool = false;
  let code = env;
  code += 'if(' + expression + '){bool = true;}';
  eval(code);
  return bool;
}