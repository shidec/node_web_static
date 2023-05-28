const http = require('http'); //-- load http library to create server
const fs = require('fs'); //-- load file system library
const mime = require('mime'); //-- load mime library to get mime type of file
const { file_image, directory_image } = require('./images.js'); //-- load images.js for image data

//-- web server parameters
const port = 88;
const host = 'localhost';

const requestListener = (request, response) => {
	//-- convert url to local file location
	let filename = 'htdocs' + request.url;

	//-- check if file is exist
	if (fs.existsSync(filename)) {
		//-- if current file name is directory and index.html file is exist then display the index.html instead of directory content
		if (fs.lstatSync(filename).isDirectory() && fs.existsSync(filename + '/index.html')) filename = filename + '/index.html';

		if (fs.lstatSync(filename).isFile()) {
			//-- if current file file name is a file
			try {
				//-- get the mime, send it as header
				response.setHeader('Content-type', mime.getType(filename));
				//-- set status code as 200 (success)
				response.statusCode = 200;
				//-- read the file and send it to client
				response.end(fs.readFileSync(filename));
			} catch {
				//-- send status code 500 if an error occurs
				response.statusCode = 500;
				response.end('Server error');
			}
		} else if (fs.lstatSync(filename).isDirectory()) {
			//-- if current file file name is a directory. Display all file names in it
			fs.readdir(filename, (err, files) => {
				if (err) {
					//-- send status code 500 if an error occurs
					response.statusCode = 500;
					response.end('Server error');
				} else {
					//-- beginning of the html
					let html = `<html><head><title>Index of ${request.url}</title></head>`;
					//-- display the title of the directory
					html += `<body><h1>Index of ${request.url}</h1><ul>`;
					if (request.url !== '/') {
						//-- if the url is not the root directory, display link to go to the parent directory
						//-- get last position of / 
						const lastSegment = request.url.lastIndexOf('/');
						//-- remove text starting from the last / position
						const url = request.url.substring(0, lastSegment === 0 ? 1 : lastSegment);
						//-- display the link
						html += `<li><img src="${directory_image}"/> <a href="${url}">..</a></li>`;
					}

					files.forEach(file => {
						//-- add / if the url not end by /
						const url = request.url + (request.url.endsWith('/') ? '' : '/') + file;
						//-- choose the right icon (file or directory)
						const image = fs.lstatSync(filename + '/' + file).isDirectory() ? directory_image : file_image;
						//-- display the link
						html += `<li><img src="${image}"/> <a href="${url}">${file}</a>`;
					});

					//-- end of the html
					html += '</ul></body></html>';
					//-- send it to client
					response.end(html);
				}
			});
		}
	} else {
		//-- if file is not exist, send status code 404 (not found)
		response.statusCode = 404;
		response.end('File not found');
	}
};

//-- create the server
const server = http.createServer(requestListener);

//-- run it
server.listen(port, host, () => {
	console.log(`Server berjalan pada http://${host}:${port}`);
});