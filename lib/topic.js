var DB = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');


exports.home = function(request, response){
    DB.query(`SELECT * FROM topic`, function(error, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.List(topics);
        var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response, queryData){
    DB.query(`SELECT * FROM topic`, function(error, topics){
    if(error){
      throw error;
    }
    //DB.query(`SELECT * FROM topic WHERE id=${queryData.id}`, function(error2, topic){ 이거보단 아래처럼 배열에 담아서 주면 보안성 증가함. ?에 오른쪽을 자동으로 대입하도록 되어있으며,
    //또한 공격성이 있는것은 알아서 필터링 하는 역할도 함. 따라서 아래 방법이 좀 더 보안성 높음, 
    DB.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[queryData.id], function(error2, topic){
      if(error2){
        throw error2;
      }
      //객체들이 배열형태로 들어오기때문에 index 써주어야함.
      console.log(topic);
      var title = topic[0].title;
      var description = topic[0].description;
      var list = template.List(topics);
      var html = template.HTML(title, list, 
        `
        <h2>${title}</h2>
        ${description}
        <p>by ${topic[0].name}</p>
        `,`
          <a href="/create">create</a> 
          <a href="/update?id=${queryData.id}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${queryData.id}">
            <input type="submit" value = "delete">
          </form>`);
      response.writeHead(200);
      response.end(html);
    });
  });
}

exports.create = function(request, response){
DB.query(`SELECT * FROM topic`, function(error, topics){
    DB.query('SELECT * FROM author', function(error2, authors){
      var title = 'Create';
      var list = template.List(topics);
      var html = template.HTML(title, list, 
      `        
      <form action="/create_process" method = "post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
          <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        ${template.authorSelect(authors)}
      </p>
      <p>
          <input type="submit">
      </p>
      </form>
      `, `<a href="/create">create</a>`);
      response.writeHead(200);
      response.end(html);
    });
  });
}


exports.create_process = function(request, response){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      DB.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, [post.title, post.description, post.author], function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/?id=${result.insertId}`});
        response.end();
      });
    });
    
}



exports.update = function(request, response,queryData){
    DB.query('SELECT * FROM topic', function(error, topics){
        if(error){
          throw error;
        }
        DB.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error){
            throw error;
          }
          DB.query('SELECT * FROM author', function(error2, authors){
            var list = template.List(topics);
            var html = template.HTML(topic[0].title, list, 
              //value = "${title}" 옵션 주면 placeholder 자리에 내용 채워줌.
              //textarea의 경우 html태그 안쪽에 넣어주면 placeholder 안에 내용 들어가게됨.
              //hidden의 경우 사용자가 제목을 변경할 수도 있기 때문에 원래 제목을 보존하기 위해서 생성, 히든처리하면 사용자에게는 안보이는 효과
            `
            <form action="/update_process" method = "post">
            <input type="hidden" name="id" value="${topic[0].id}">
            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
            <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
            </p>
              ${template.authorSelect(authors ,topic[0].author_id)}
            <p>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
            `
            
            , `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
            response.writeHead(200);
            response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response, queryData){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      DB.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id =?', [post.title, post.description, post.author, post.id], function(error, result){
        response.writeHead(302, {Location: `/?id=${post.id}`}); //writeHead 302는 다른곳으로 redirection 하라는 뜻.
        response.end();
      });
    });    
}

exports.delete_process = function(request, response){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = qs.parse(id).base; // 루트 경로 거르고 접근할 수 있도록.
      //삭제하는 방법 , unlink
      DB.query('DELETE FROM topic WHERE id = ?', [post.id], function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/`}); //writeHead 302는 다른곳으로 redirection 하라는 뜻.
        response.end();
      });
    });
}