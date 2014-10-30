var tidy = require('tidycss');

tidy('http://ke.qq.com', {
    ignore: /common\..*?\.css/,
    unchecks: ['.mod-nav__course-all span:hover']
});