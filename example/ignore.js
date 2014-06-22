var red = require('../');

red('http://ke.qq.com', {
	ignore: /common\.min\..*?\.css$/
});