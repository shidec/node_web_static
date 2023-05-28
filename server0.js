//-- this the simpler version for learning purpose
//-- it will only display a file, not the direcory content
 
const http = require('http');
const fs = require('fs');
const mime = require('mime');

const port = 88;
const host = 'localhost';

const requestListener = (request, response) => {
	let filename = request.url == '/' ?'htdocs/index.html' : 'htdocs/' + request.url.substring(1);

    if(fs.existsSync(filename)){
        try{
            response.setHeader('Content-type', mime.getType(filename));
            response.statusCode = 200;
            response.end(fs.readFileSync(filename));
        }catch{
            response.statusCode = 500;
            response.end('Server error');
        }

    }else{
		response.statusCode = 404;
		response.end('File not found');
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
	console.log(`Server berjalan pada http://${host}:${port}`);
});