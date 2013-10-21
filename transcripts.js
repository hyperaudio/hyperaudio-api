var passport = require('passport');
var Transcript = require('./models/transcript');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

module.exports = function(app, nconf) {

  app.get('/:user?/transcripts', function(req, res) {
    if (req.params.user) {
      var query = {
        owner: req.params.user
      };
      return Transcript.find(query, function(err, transcripts) {
        return res.send(transcripts);
      });
    }
    return Transcript.find(function(err, transcripts) {
      return res.send(transcripts);
    });
  });

  app.get('/:user?/transcripts/:id', function(req, res) {
    return Transcript.findById(req.params.id, function(err, transcript) {
      if (!err) {
        try {
          var filePath = path.join(__dirname, 'media/' + transcript.owner + '/' + transcript.meta.filename);
          transcript.content = fs.readFileSync(filePath);
        } catch (ignored) {}
        return res.send(transcript);
      }
    });
  });

  app.put('/:user?/transcripts/:id', function(req, res) {
    return Transcript.findById(req.params.id, function(err, transcript) {

      transcript.label = req.body.label;
      transcript.desc = req.body.desc;
      transcript.type = req.body.type;
      transcript.sort = req.body.sort;
      // transcript.owner = req.body.owner;
      transcript.meta = req.body.meta;
      
      if (req.params.user) {
        transcript.owner = req.params.user;
      } else {
        transcript.owner = req.body.owner;
      }
      
      if (req.body.content) {
        transcript.content = req.body.content;
        try {
          var filePath = path.join(__dirname, 'media/' + transcript.owner + '/' + transcript.meta.filename);
          fs.writeFileSync(filePath, req.body.content);
        } catch (ignored) {}
      }

      return transcript.save(function(err) {
        if (!err) {
          console.log("updated");
        }
        return res.send(transcript);
      });
    });
  });

  app.post('/:user?/transcripts', function(req, res) {

    var transcript;
    var owner;
    var content = null;
    
    if (req.params.user) {
      owner = req.params.user;
    } else {
      owner = req.body.owner;
    }


    if (req.body.content) {
      content = req.body.content;
      try {
        var filePath = path.join(__dirname, 'media/' + req.body.owner + '/' + req.body.meta.filename);
        fs.writeFileSync(filePath, req.body.content);
      } catch (ignored) {}
    }
    
    transcript = new Transcript({
      label: req.body.label,
      desc: req.body.desc,
      type: req.body.type,
      sort: req.body.sort,
      owner: req.body.owner,
      meta: req.body.meta,
      content: content
    });

    // download if needed
    if (transcript.meta.filename && transcript.meta.key) {
      var p = cp.fork(__dirname + '/fileDownload.js');
      p.send({
        id: transcript.meta.filename,
        url: transcript.meta.url,
        owner: transcript.owner
      });
    }

    console.log(transcript);

    transcript.save(function(err) {
      if (!err) {
        return console.log("created");
      }
    });
    return res.send(transcript);
  });

  app.delete('/:user?/transcripts/:id', function(req, res) {
    return Transcript.findById(req.params.id, function(err, transcript) {
      return transcript.remove(function(err) {
        if (!err) {
          console.log("removed");
          return res.send('')
        }
      });
    });
  });

};