var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
//객체화 완료 refactoring
var DB = require('./lib/db.js');
var topic = require('./lib/topic.js');
const { authorSelect } = require('./lib/template.js');
var author = require('./lib/author.js')
//출력 보안을 위한 라이브러리 인듯.



var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id == undefined){
        topic.home(request, response);
      } else{
        topic.page(request, response, queryData);
      }
    } else if(pathname === '/create'){
      topic.create(request, response);
    } else if(pathname === '/create_process'){
      topic.create_process(request, response);
    } else if(pathname === '/update'){
      topic.update(request, response, queryData);
    } else if(pathname === '/update_process'){
      topic.update_process(request, response, queryData);
    } else if(pathname === '/delete_process'){
      topic.delete_process(request, response);
    } else if(pathname === '/author'){
      author.home(request, response);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
});
app.listen(3000);