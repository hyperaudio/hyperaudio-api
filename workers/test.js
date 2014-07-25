var fs = require('fs');
var path = require('path');

var youtubedl = require('youtube-dl');

var url = "https://www.youtube.com/watch?v=X8CNpNUKoQA";
var dl = youtubedl.download(url,
        './test/', [
          //'--quiet',
'--verbose',
'--get-url',
'--format=bestaudio',
          '--output=%(autonumber)s.%(ext)s',
          '--write-info-json',
          '--write-annotations',
          '--write-thumbnail',
          '--all-subs',
          '--write-auto-sub',
          //'--extract-audio',
          //'--audio-format=aac',
          //'--keep-video'
        ]);

dl.on('download', function(data) {
        console.log('filename: ' + data.filename);
        console.log('size: ' + data.size);
});

dl.on('error', function(err) {
        // throw err;
        console.log(err);
        // callback('bury');
});

dl.on('end', function(data) {
        console.log(data);
});

