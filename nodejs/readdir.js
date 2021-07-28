var testFolder = 'data';
var fs = require('fs');
const { cpuUsage } = require('process');

fs.readdir(testFolder, function(error, filelist){
    console.log(filelist);
})
