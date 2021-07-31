var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
//객체화 완료 refactoring



var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id == undefined){

        fs.readdir('./data', function(error, filelist){

          var title = 'Welcome';
          var description = 'Hello, Node.js';

          var list = template.List(filelist);
          var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
          response.end(html);
          response.writeHead(200);
        });

      } else{
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.List(filelist);
          //delete의 경우 이를 링크로 처리할경우 보안문제 발생함. 따라서 post 방식으로 변경해야됨 
          var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, 
          `
          <a href="/create">create</a> 
          <a href="/update?id=${title}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value = "delete">
          </form>
          `);
          response.end(html);
          response.writeHead(200);
        });
      });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){

        var title = 'WEB - create';

        var list = template.List(filelist);
        //링크로 하면 누구나 외부에서 글을 수정할 수도 있기 때문에, post방식으로 진행함.
        var html = template.HTML(title, list, `        
        <form action="/create_process" method = "post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
        `, ``);
        response.end(html);
        response.writeHead(200);
      });

    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`}); //writeHead 302는 다른곳으로 redirection 하라는 뜻.
          response.end('success')
        })
      });
      
    }else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.List(filelist);
          var html = template.HTML(title, list, 
            //value = "${title}" 옵션 주면 placeholder 자리에 내용 채워줌.
            //textarea의 경우 html태그 안쪽에 넣어주면 placeholder 안에 내용 들어가게됨.
            //hidden의 경우 사용자가 제목을 변경할 수도 있기 때문에 원래 제목을 보존하기 위해서 생성, 히든처리하면 사용자에게는 안보이는 효과
          `
          <form action="/update_process" method = "post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
              <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
              <input type="submit">
          </p>
          </form>
          `
          
          , `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.end(html);
          response.writeHead(200);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        //rename을 통해 파일명 변경, 전칸을 후칸로 바꾸라는 뜻임.
        fs.rename(`data/${id}`, `data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`}); //writeHead 302는 다른곳으로 redirection 하라는 뜻.
            response.end('success');
          });
        });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        //삭제하는 방법 , unlink
        fs.unlink(`data/${id}`, function(error){
          response.writeHead(302, {Location: `/`}); //writeHead 302는 다른곳으로 redirection 하라는 뜻.
          response.end();
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
});
app.listen(3000);