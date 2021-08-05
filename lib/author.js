
var DB = require('./db.js');
var template = require('./template.js');

exports.home = function(request, response) {
    DB.query(`SELECT * FROM topic`, function(error, topics){
        DB.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'author';
            var list = template.List(topics);
            var html = template.HTML(title, list, 
                `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>
                `, 
                `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
        });
    });
}