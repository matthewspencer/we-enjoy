var fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec,
	moment = require('moment'),
	yaml = require('yaml-front-matter'),
	config = {
		twitter: require('../_twitter.json'),
		tumblr: require('../_tumblr.json')
	},
	Twitter = require('node-twitter'),
	tumblrjs = require('tumblr.js'),
	twitter = new Twitter.RestClient(
		config.twitter.consumer_key,
		config.twitter.consumer_secret,
		config.twitter.access_token_key,
		config.twitter.access_token_secret
	),
	tumblr = tumblrjs.createClient(config.tumblr),

	title = moment().format('dddd, MMMM D, YYYY'),
	filename = moment().format('YYYY-MM-DD-dddd').toLowerCase() + '.md',
	permalink = 'http://we-enjoy.us/' + moment().format('YYYY/MM/DD/dddd/').toLowerCase(),

	paths = {
		images: path.normalize(__dirname + '/../assets'),
		posts: path.normalize(__dirname + '/../_posts')
	}
;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

fs.exists(paths.posts + '/' + filename, function(exists) {
	if (! exists) return console.error(filename + ' doesn’t exist.');

	fs.readFile(paths.posts + '/' + filename, 'utf-8', function(err, data) {
		if (err) return console.error(err);

		publish_post( yaml.loadFront(data) );
	});
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function publish_post( post ) {
	var options = {
		twitter: {
			'status': title + ' ' + permalink,
			'media[]': paths.images + '/' + post.photo
		},
		tumblr: {
			caption: post.__content,
			format: 'markdown',
			tweet: 'off',
			data: paths.images + '/' + post.photo,
		}
	};

	fs.exists(paths.images + '/' + post.photo, function(exists) {
		if (! exists) return console.error(post.photo + ' doesn’t exist.');

		twitter.statusesUpdateWithMedia(options.twitter, function(err, resp) {
			if (err) return console.log(err);
			console.log(resp);
		});

		return;

		tumblr.photo('we-enjoy', options.tumblr, function(err, resp) {
			if (err) console.log(err.message);
		});

		push_changes();
	});
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function push_changes() {
	var commit_message = moment().format('dddd, MMMM D, YYYY')
	;

	console.log(commit_message);

	exec('cd ../', function(error, stdout, stderr) {
		if (error) return console.log(error);
		if (stdout) return console.log(stdout);
		if (stderr) return console.log(stderr);
	});
	exec('git add -A', function(error, stdout, stderr) {
		if (error) return console.log(error);
		if (stdout) return console.log(stdout);
		if (stderr) return console.log(stderr);
	});
	exec('git commit -am "' + commit_message + '"', function(error, stdout, stderr) {
		if (error) return console.log(error);
		if (stdout) return console.log(stdout);
		if (stderr) return console.log(stderr);
	});
	exec('git pull', function(error, stdout, stderr) {
		if (error) return console.log(error);
		if (stdout) return console.log(stdout);
		if (stderr) return console.log(stderr);
	});
	exec('git push origin master', function(error, stdout, stderr) {
		if (error) return console.log(error);
		if (stdout) return console.log(stdout);
		if (stderr) return console.log(stderr);
	});
}