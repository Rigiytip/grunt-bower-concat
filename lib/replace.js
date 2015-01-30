var fs = require('fs'),
  fse = require('fs-extra'),
  path = require('path'),
  Replace;

Replace = function() {
  this.counter = {cnt: 0};
  this.cache = {};
};

Replace.prototype.getCnt = function(){
    console.log(this.cache);
    console.log('Up counter from', this.cnt);
    this.cnt++;
    console.log('Up counter to', this.cnt);
    return this.cnt;
};

Replace.prototype.run = function(fileName, staticRoot) {
  var copyMedia = this.copyMedia,
      counter = this.counter,
      cache = this.cache,
      mediaDir = 'media';


  if(!fs.existsSync(path.join(staticRoot, 'media'))){
      fs.mkdirSync(path.join(staticRoot, 'media'));
  }

  if (fs.existsSync(fileName)) {
    var data = fs.readFileSync(fileName).toString();
    if (data && staticRoot) {
      return data.replace(/url\s*\(\s*(['"]?)([^"'\)]*)\1\s*\)/gi, function(match, first, location) {
        var dirName = path.resolve(path.dirname(fileName)),
          url,
          urlPath,
          pathToMediaSrc,
          pathToMediaDst,
          dstFileName;

        match = match.replace(/\s/g, '');
        location = location.replace(/\s/g, '').replace(/#.*/,'').replace(/\?.*/g, '');

        if (/^\/|https:|http:|data:/i.test(location) === false) {
          pathToMediaSrc = path.join(dirName, location);

          if(cache.hasOwnProperty(pathToMediaSrc)){
              dstFileName = cache[pathToMediaSrc];
          }
          else{
              counter.cnt++;
              dstFileName = path.join(mediaDir, counter.cnt+'_'+path.basename(location));
              pathToMediaDst = path.join(staticRoot, dstFileName);
              cache[pathToMediaSrc] = dstFileName;
              try {
                  fse.copySync(pathToMediaSrc, pathToMediaDst);
              }
              catch(e){
                  console.log('Error copy file: ');
                  console.log('From',pathToMediaSrc);
                  console.log('To',pathToMediaDst);
              }
          }
          return "url('"+dstFileName+"')";
        }
        return match;
      });
    }
    return data;
  }

  return '';
};

module.exports = Replace;
