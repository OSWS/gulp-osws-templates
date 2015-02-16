var Templates = require('osws-templates');
var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');

var name = 'gulp-osws-templates';

module.exports = function(options){
	var options = _.defaults(_.isObject(options)? options : {}, module.exports.options);
	
	return through.obj(function(file, enc, callback){
		
		var flow = this;
		
		if (file.isNull()) {
			flow.push(file);
			
		} else if (file.isStream()) {
            this.emit(
                'error',
                new gutil.PluginError(name, 'Streaming not supported')
            );
			
		} else if(file.isBuffer()){
			try {
				options.handler(
					Templates.compile(String(file.contents), file.path),
					options,
					file,
					function(error, result) {
						file.contents = new Buffer(result);
						file.path = gutil.replaceExtension(file.path, '.html');
						flow.push(file);
					}
				);
			} catch(error) {
				callback(new gutil.PluginError(name, error));
			}
			
		} else {
			callback(null, file);
		}
		
		callback();
	});
};

module.exports.options = {
	arguments: [],
	context: {},
	handler: function(template, options, file, callback) {
		Templates.Module(template)
		.apply(null, options.arguments)
		.render(callback, options.context);
	}
};