webpack的打包其实就是将我们的代码文件根据Loader进行转义编辑成浏览器认识的文件，其核心步骤就是转义过程（如何将源代码转化成新文件）。

#### webpack的基本使用
```plain
npm init
npm install webpack
```



```plain
├── node_modules 
├── package-lock.json 
├── package.json 
├── webpack.config.js #配置文件 
├── debugger.js #测试文件 
└── src # 源码目录 
    |── index.js 
    |── name.js 
    └── age.js
```



```plain
const path = require("path");
module.exports = {
  mode: "development", //防止代码被压缩
  entry: "./src/index.js", //入口文件
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devtool: "source-map", //防止干扰源文件
};
```



```plain
const name = require("./name");
const age = require("./age");
console.log("entry文件打印作者信息", name, age);
```



```plain
module.exports = "不要秃头啊";
```



```plain
module.exports = "99";
```



文件依赖关系  
![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748417457079-fd47ac9a-9a3b-4236-aba5-1e269aaf45d9.webp)



```plain
node ./debugger.js
```



查看dist文件夹下的main.js文件

+ `<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">modules</font>`<font style="color:rgb(37, 43, 58);"> 用于存放</font>**<font style="color:rgb(37, 43, 58);">入口文件的依赖模块</font>**<font style="color:rgb(37, 43, 58);">，</font>`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">key 值为依赖模块路径，value 值为依赖模块源代码</font>`
+ <font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">入口文件（src/index.js）被放在立即执行函数中</font>
+ `<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">require</font>`<font style="color:rgb(37, 43, 58);"> 函数是 </font>**<font style="color:rgb(37, 43, 58);">web 环境下</font>**<font style="color:rgb(37, 43, 58);"> 加载模块的方法（ </font>`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">require</font>`<font style="color:rgb(37, 43, 58);"> 原本是 </font>**<font style="color:rgb(37, 43, 58);">node环境</font>**<font style="color:rgb(37, 43, 58);"> 中内置的方法，浏览器并不认识 </font>`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">require</font>`<font style="color:rgb(37, 43, 58);">，所以这里需要手动实现一下），它接受模块的路径为参数，返回模块导出的内容</font>

```javascript
/******/ (() => { // webpackBootstrap
	// 初始化：定义了modules对象，key为路径，value是一个函数，函数里面是源代码
	/******/ 	var __webpack_modules__ = ({

		/***/ "./src/age.js":
			/*!********************!*\
  !*** ./src/age.js ***!
  \********************/
			/***/ ((module) => {

				module.exports = "99";

				/***/
			}),

		/***/ "./src/name.js":
			/*!*********************!*\
  !*** ./src/name.js ***!
  \*********************/
			/***/ ((module) => {

				module.exports = "不要秃头啊";

				/***/
			})

		/******/
	});
	/************************************************************************/
	/******/ 	// The module cache定义缓存对象
	/******/ 	var __webpack_module_cache__ = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
		/******/ 		// Check if module is in cache
		/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
		/******/ 		if (cachedModule !== undefined) {
			/******/ 			return cachedModule.exports;
			/******/
		}         
		/******/ 		// Create a new module (and put it into the cache)声明module
		/******/ 		var module = __webpack_module_cache__[moduleId] = {
			/******/ 			// no module.id needed
			/******/ 			// no module.loaded needed
			/******/ 			exports: {}
			/******/
		};
		/******/
		/******/ 		// Execute the module function	
								// 执行modules对象中相应对象的函数值，且将module作为参数传入
		/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
		/******/
		/******/ 		// Return the exports of the module
								// 此使module.exports就是modules对象中相应函数值执行后的内容结果，比如name：“不要秃头啊”
		/******/ 		return module.exports;
		/******/
	}
	/******/
	/************************************************************************/
	// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
	(() => {
		/*!**********************!*\
      !*** ./src/index.js ***!
      \**********************/
		const name = __webpack_require__(/*! ./name */ "./src/name.js");
		const age = __webpack_require__(/*! ./age */ "./src/age.js");
		console.log("entry文件打印作者信息", name, age);
	})();

	/******/
})()
	;
//# sourceMappingURL=main.js.map
```



:::danger
问题：如何将源码转化成dist/main.js文件

:::

#### 核心思想
1. 根据配置信息拿到入口文件
2. 找到入口文件所依赖的模块，并收集关键信息（如路径、源代码、所依赖的模块）
3. 根据得到的信息，生成最终输出到硬盘中的文件（dist）：包括module对象、require模板代码、入口文件等

```javascript
var modules = [
  {
    id: "./src/name.js",//路径
    dependencies: [], //所依赖的模块
    source: 'module.exports = "不要秃头啊";', //源代码
  },
  {
    id: "./src/age.js",
    dependencies: [], 
    source: 'module.exports = "99";',
  },
  {
    id: "./src/index.js",
    dependencies: ["./src/name.js", "./src/age.js"], 
    source:
      'const name = require("./src/name.js");\n' +
      'const age = require("./src/age.js");\n' +
      'console.log("entry文件打印作者信息", name, age);',
  },
];

```

#### 架构设计
打包过程其实分三个阶段：

1. 打包前的准备工作
2. 打包过程中（编译过程）
3. 打包结束后（包含打包成功、打包失败）

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748509204742-6ccc2b03-8d56-4474-900e-3f9bb37c4ef7.webp)





#### 具体实现
+ （1）搭建结构，读取配置参数
+ （2）用配置参数对象初始化 `Compiler` 对象
+ （3）挂载配置文件中的插件
+ （4）执行 `Compiler` 对象的 `run` 方法开始执行编译
+ （5）根据配置文件中的 `entry` 配置项找到所有的入口
+ （6）从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译
+ （7）找出此模块所依赖的模块，再对依赖模块进行编译
+ （8）等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`
+ （9）把各个代码块 `chunk` 转换成一个一个文件加入到输出列表
+ （10）确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统



##### 1、搭建结构，读取配置函数
Webpack本质就是个函数，函数内部存在一个compiler实例对象，调用compiler实例对`象的run方法就会启动编译，run方法接受一个回调判断编译过程中的编译信息或错误信息

**调用webpack函数**

```javascript
// webpack函数
const { webpack } = require("./webpack.js")
// webpack配置信息
const webpackOptions = require('./webpack.config.js')
// 获取返回的compiler对象
const compiler = webpack(webpackOptions)
// 调用compiler对象的run函数
compiler.run((err, stats) => {
  console.log(err)
  console.log(
    stats.toJson({
      assets: true,
      chunks: true,
      modules: true
    })
  )
})
```

**webpack函数手写**

```javascript
// 创建Compiler类
class Compiler {
  constructor() {}
  
  run(callback) {}
}

// 1、读取配置参数
function webpack(webpackOptions) {
  // 2、创建compiler实例
  const compiler = new Compiler(webpackOptions)

  return compiler
}
```

**流程图**

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748590592990-643825f8-d7b1-4551-8b04-79ba8dcfe7b7.webp)



##### 2、初始化Compiler对象
`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">Compiler</font>`<font style="color:rgb(37, 43, 58);"> 它就是整个打包过程的大管家，它里面放着各种你可能需要的</font>`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">编译信息</font>`<font style="color:rgb(37, 43, 58);">和</font>`<font style="color:rgb(199, 54, 54);background-color:rgb(255, 238, 237);">生命周期 Hook</font>`<font style="color:rgb(37, 43, 58);">，而且是单例模式</font>

```javascript
const { SyncHook } = require("tapable"); //这是一个同步钩子

//Compiler其实是一个类，它是整个编译过程的大管家，而且是单例模式
class Compiler {
+ constructor(webpackOptions) {
+   this.options = webpackOptions; //存储配置信息
+   //它内部提供了很多钩子
+   this.hooks = {
+     run: new SyncHook(), //会在编译刚开始的时候触发此run钩子
+     done: new SyncHook(), //会在编译结束的时候触发此done钩子
+   };
+ }
}

//第一步：搭建结构，读取配置参数，这里接受的是webpack.config.js中的参数
function webpack(webpackOptions) {
  //第二步：用配置参数对象初始化 `Compiler` 对象
+ const compiler = new Compiler(webpackOptions)
  return compiler;
}
```

**流程图**

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748590710357-2586a7fc-1fb6-45ef-95c3-0e929dd3a165.webp)



##### 3、挂载配置文件中的插件
**插件即Plugin，何为插件？**

插件是专注处理webpack`在编译过程中`的某个特定任务的功能模块，是针对Loader结束后，整个webpack打包过程，并不直接操作文件，而是基于事件机制，监听webpack打包过程中的某些节点，执行广泛的任务。比如热更新插件。

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748591110960-6e390b30-dfd0-408e-89b2-2e33055c65c6.webp)



```javascript
const { SyncHook } = require("tapable"); //这是一个同步钩子

//自定义插件WebpackRunPlugin
// 此插件就是开始打包时，调用hooks的run钩子函数的同时，通知系统开始编译
class WebpackRunPlugin {
  apply(compiler) {
		// tab函数是通过SyncHook注册事件并传入参数
    compiler.hooks.run.tap("WebpackRunPlugin", () => {
      console.log("开始编译");
    });
  }
}

//自定义插件WebpackDonePlugin
// 此插件就是打包结束时，调用hooks的done钩子函数的同时，通知系统结束编译
class WebpackDonePlugin {
  apply(compiler) {
    compiler.hooks.done.tap("WebpackDonePlugin", () => {
      console.log("结束编译");
    });
  }
}

//第一步：搭建结构，读取配置参数，这里接受的是webpack.config.js中的参数
function webpack(webpackOptions) {
  //第二步：用配置参数对象初始化 `Compiler` 对象
  const compiler = new Compiler(webpackOptions);
  //第三步：挂载配置文件中的插件
+ const { plugins } = webpackOptions;
+ for (let plugin of plugins) {
+   plugin.apply(compiler);
+ }
  return compiler;
}


module.exports = {
  webpack,
  WebpackRunPlugin,
  WebpackDonePlugin,
};
```

**流程图**

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748592489021-a976ab6f-c24c-481b-8ae6-336fae210956.webp)



##### 4、执行Compiler对象的run方法开始执行编译
在正式编译前，我们需要调用Compiler实例中的run钩子和done钩子告诉系统开始编译和结束编译

```javascript
// 搭建结构
//Compiler其实是一个类，它是整个编译过程的大管家，而且是单例模式
class Compiler {
  // 运行初始化函数
  constructor(webpackOptions) {
    this.options = webpackOptions; // 存储配置信息

    // 编写hooks生命周期函数
    this.hooks = {
      run: new SyncHook(), //会在编译刚开始的时候触发此run钩子
      done: new SyncHook()  //会在编译结束的时候触发此done钩子
    }
  }

  // 具体执行编译函数，整个编译的过程在此进行
  compile(callback) {
    // 这里的this指向Compiler类
    let compilation = new Compilation(this.options)
    compilation.build(callback)
  }

  // 4、执行Compiler对象的run方法开始编译
  run(callback) {
    this.hooks.run.call() // 在编译前出发hooks的run钩子函数，表示开始启动编译（该run函数与Compiler对象的run函数不一样）

    // 声明编译成功函数
    const onCompiled = () => {
      this.hooks.done.call() // 编译成功后出发hooks的done钩子函数
    }
	
    this.compile(onCompiled) // 开始编译，成功后调用onCompiler通知编译成功
  }
}

class Compilation {
	constructor(webpackOptions) {
+     this.options = webpackOptions;
+     this.modules = []; //本次编译所有生成出来的模块
+     this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块
+     this.assets = {}; //本次编译产出的资源文件
+     this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译
+   }

+   build(callback) {
+    //这里开始做编译工作，编译成功执行callback
+    callback()
+   }
}
```

**流程图**

执行Compiler对象的run方法开始编译，过程分为编译前，编译中，编译完成。其中编译过程需要单独解耦，也是webpack打包的核心内容。

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748592568053-fe9e2b98-7d4b-41fb-bc99-8774c7edd651.webp)



##### 5、根据配置文件中的entry配置找到所有入口
```javascript
// 编译过程（最重要的过程）
class Compilation {
  constructor(webpackOptions) {
    this.options = webpackOptions
    this.modules = [] // 编译完成后生成的模块
    this.chunks = [] // 本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块
    this.assets = [] // 编译后的资源
    this.fileDependencies = [] // 本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译
  }

	build(callback) {
		// 5、根据配置文件中的entry配置项找到所有的入口
    let entry = {}
    if(typeof this.options.entry == 'string') {
      // 单入口，将entry:'xx'替换成{main:"xx"}
      /**
       * entry: {
       *  main: './src/index.js'
       * }
       */
      entry.main = this.options.entry 
    }else {
      entry = this.options.entry
    }
	}
}
```

**流程图**

![](https://cdn.nlark.com/yuque/0/2025/webp/55179919/1748593116272-ae2ec9fb-121f-44a6-8130-9eaf9e1c77e8.webp)



##### 6、从入口文件出发，调用配置的loader规则，对各模块进行编译
Loader函数本质就是将资源文件或者上一个Loader产生的结果作为参数，然后输出转义生成的结果

```javascript
const { loader1, loader2 } = require("./webpack");
module.exports = {
  //省略其他
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [loader1, loader2], // 自右向左，自下向上
      },
    ],
  },
};
```

这里主要有三个步骤：

1. 将入口文件的绝对路径添加到依赖数组fileDependencies中，记录这次编译的模块
2. 执行`buildModule函数`，得到入口文件的module对象
3. 将module对象添加到modules数组中，这是编译完成后生成的模块

```javascript
// 6、从入口文件出发，调用配置的loader，对各模块进行编译
for(let entryName in entry) {
  // path.posix是处理POSIX路径函数，确保路径分隔符始终是"/"，对于单文件入口来说，entryName就是main
	let entryFilePath = path.posix.join(baseDir, entry[entryName]) // 绝对路径 E:/Yitong/uiap/webpack/src/index.js
  // 6.1 把入口文件的绝对路径添加到依赖数组，记录此次编译依赖的模块
  this.fileDependencies.push(entryFilePath);
  // 6.2 获取module对象（module对象里面存放路径、依赖模块、源代码）
  let entryModule = this.buildModule(entryName, entryFilePath)
  // 6.3 将生成的入口文件module对象添加到modules模块数组中
  this.modules.push(entryModule)
}
```

webpack打包其实就是需要先将我们的源文件替换成浏览器能够识别的文件，`buildModule`就是该核心步骤的工作，`builModule`主要做以下步骤：

+ 读取模块内容，获取源代码
+ 创建模块对象
+ 查找对应的loader对源代码进行翻译和替换

```javascript
//当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径
buildModule(name, modulePath) {
		// name: main, modulePath: 'src/index.js'
	
		//6.2.1 读取模块内容，获取源代码
    let sourceCode = fs.readFileSync(modulePath, "utf8");
	
    //buildModule最终会返回一个modules模块对象，每个模块都会有一个id,id是相对于根目录的相对路径
+   let moduleId = "./" + path.posix.relative(baseDir, modulePath); //模块id:从根目录出发，找到与该模块的相对路径（./src/index.js）
	
+   //6.2.2 创建模块对象
+   let module = {
+     id: moduleId,
+     names: [name], //names设计成数组是因为代表的是此模块属于哪个代码块，可能属于多个代码块
+     dependencies: [], //它依赖的模块
+     _source: "", //该模块的代码信息
+   };

		// 6.2.3 找到对应的loader对源代码进行翻译和替换
    let loaders = []
    let { rules=[] } = this.options.module
    rules.forEach(rule => {
			// 比如配置文件中，存在需要匹配js文件的loader
      let { test } = rule
      // 如果有正则规则，就把对应的loader添加到loaders数组中
      if(modulePath.match(test)) {
        loaders.push(...rule.use)
      }
    })

		// 自右向左对模块进行翻译和替换
		// 比如先用loader2翻译和替换源代码，再用loader1翻译和替换他们的结果，最后重新赋值回变量sourceCode
    sourceCode = loaders.reduceRight((code, loader) => {
      return loader(code)
    }, sourceCode)

+   return module;
}
```



##### 7、找出当前模块所依赖的所有模块，然后对依赖的所有模块进行编译
该步骤是整体流程中最为复杂的，一遍看不懂没关系，可以先理解思路。

该步骤经过细化可以将其拆分成十个小步骤：

+ （7.1）：先把源代码编译成 [AST](https://link.juejin.cn?target=https%3A%2F%2Fastexplorer.net%2F)
+ （7.2）：在 `AST` 中查找 `require` 语句，找出依赖的模块名称和绝对路径
+ （7.3）：将依赖模块的绝对路径 push 到 `this.fileDependencies` 中
+ （7.4）：生成依赖模块的`模块 id`
+ （7.5）：修改语法结构，把依赖的模块改为依赖`模块 id`
+ （7.6）：将依赖模块的信息 push 到该模块的 `dependencies` 属性中
+ （7.7）：生成新代码，并把转译后的源代码放到 `module._source` 属性上
+ （7.8）：对依赖模块进行编译（对 `module 对象`中的 `dependencies` 进行递归执行 `buildModule` ）
+ （7.9）：对依赖模块编译完成后得到依赖模块的 `module 对象`，push 到 `this.modules` 中
+ （7.10）：等依赖模块全部编译完成后，返回入口模块的 `module` 对象

```javascript
const path = require("path");
const fs = require("fs");
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const generator = require("@babel/generator").default
let types = require("@babel/types")

class Compilation {
	// ...省略代码
	
	// 7.1 先把源代码编译成AST
	let ast = parser.parse(sourceCode, { sourceType: "module"} )
	 traverse(ast, {
+       CallExpression: (nodePath) => {
+         const { node } = nodePath;
+         //7.2：在 `AST` 中查找 `require` 语句，找出依赖的模块名称和绝对路径，在index.js中找到name.js和age.js
+         if (node.callee.name === "require") {
						//获取依赖的模块
+           let depModuleName = node.arguments[0].value;
						//dirname是获取当前正在编译的模所在的目录，modulePath: E:/Yitong/uiap/webpack/src/index.js, dirname: E:/Yitong/uiap/webpack/src
+           let dirname = path.posix.dirname(modulePath); 
						//获取依赖模块的绝对路径，depModulePath: E:/Yitong/uiap/webpack/src/name.js
+           let depModulePath = path.posix.join(dirname, depModuleName); 
						//获取配置中的extensions
+           let extensions = this.options.resolve?.extensions || [ ".js" ]; 
						//尝试添加后缀，找到一个真实在硬盘上存在的文件，E:/Yitong/uiap/webpack/src/name.js
+           depModulePath = tryExtensions(depModulePath, extensions); 
+           //7.3：将依赖模块的绝对路径 push 到 `this.fileDependencies` 中，此使fileDependencies的值为[index.js的绝对路径，name的绝对路径，age的绝对路径]
+           this.fileDependencies.push(depModulePath);
+           //7.4：生成依赖模块的`模块 id`
+           let depModuleId = "./" + path.posix.relative(baseDir, depModulePath);
+           //7.5：修改语法结构，把依赖的模块改为依赖`模块 id` require("./name")=>require("./src/name.js")
+           node.arguments = [types.stringLiteral(depModuleId)];
+           //7.6：将依赖模块的信息 push 到该模块的 `dependencies` 属性中
+           module.dependencies.push({ depModuleId, depModulePath });
+         }
+       },
+     });

		// 将编译成ast格式的源代码编译生成新代码
    let { code } = generator(ast)
    module._source = code
    // 7.8 对依赖模块进行编译（对module对象中的dependencies进行递归执行buildMode
		// dependencies=[{depModuleId: './src/name.js', depModulePath: 'name的绝对路径'}, {depModuleId: './src/age.js', depModulePath: 'age的绝对路径'}]
    module.dependencies.forEach(({depModuleId, depModulePath}) => {
      // 考虑多入口打包，一个模块可能被多个其他模块引用，且不需要重复打包
      let existModule = this.modules.find(item => item.id==depModuleId)
      // 如果存在这个将要编译的依赖模块，则无需编译
      if(existModule) {
        // names指的是它属于哪个代码块chunk
        existModule.names.push(name)
      }else {
        // 7.9 对依赖模块编译完成后得到的依赖模块的module对象添加进modules数组中
        let depModule = this.buildModule(name, depModulePath)
        this.modules.push(depModule)
      }
    })

    // 7.10 等依赖模块全部编译完成后返回入口模块的module对象
    return module

}

```

其中需要注意的点：

+ 在babel中，这块代码功能主要做的是解析（praser）、转换（traverse）、生成（generator）。
+ traverse函数接收两个参数，一个是要遍历的AST，第二个是一个对象，包含了对不同类型节点进行处理的访问者方法，通过调用这个方法，可以在AST中应用自定义的访问者，对不同类型的节点进行操作。
+ 其中CallExpression是在使用babel遍历AST时可能遇到的一个节点类型，该节点表示对某个函数或者对象方法的调用，并包含了传递的参数。
+ node.callee.name是查找AST中的函数名，arguments是函数中的参数。
+ stringLiteral函数用于精确代码中的字符串值。

