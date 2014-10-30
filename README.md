tidycss
==============

> 一个快速分析CSS冗余的工具。

动机
----

经常看到有童鞋问，有没有什么工具能快速分析出站点的CSS冗余，于是就有了这个项目。本质上，这个工具是为了解决我们 [腾讯课堂](http://ke.qq.com) 在多人开发与快速迭代下的CSS冗余问题，为代码Review提供可行的工具。

技术实现
--------

[@TJ Holowaychuk](https://github.com/visionmedia) 大神为其抽象CSS预处理库 [Rework](https://github.com/reworkcss/rework) 编写了两个CSS处理的基础库：
* [css-parse](https://github.com/reworkcss/css-parse) 将CSS转成便于遍历分析的JSON对象。
* [css-stringify](https://github.com/reworkcss/css-stringify) 将css-parse生成的JSON对象编译成CSS。

由此降低了我们对CSS分析以及生成的难度。[cheerio](https://github.com/cheeriojs/cheerio) 为我们提供了服务器端高速jQuery实现，简化了对DOM的选择器查询。而PhantomJS则提供了获取特定状态下页面所有DOM节点的方法。

简单的说，我们获取所有CSS的选择器，然后在DOM中进行逐一选取，对没有取到任何节点的选择器进行标记，最后在生成相应报表。

使用
----

* 安装：

> $ npm install tidycss

* 写一个例子：

```javascript
var tidy = require('tidycss');

tidy(
	// 你要检测冗余的url
	'http://ke.qq.com',
	// 可选参数
	{
		// 不对common.xxxx.css检测冗余，因为这个是站点公共文件
		ignore: /common\..*\.css/,
		// 忽略的选择器列表, 即这里的选择器是被review后可冗余项，
		// 比如有通过javascript动态生成的DOM树
		unchecks: ['.mod-nav__course-all span:hover']
	}
);
```

* 运行则可见到相关报表，用于代码reveiw。

## License
(The MIT License)

Copyright (c) 2013 Daniel Yang <miniflycn@justany.net>

Copyright (c) 2014 QQEDU TEAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
