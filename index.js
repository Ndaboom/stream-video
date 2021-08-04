const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function(req, res){
    res.sendFile(__dirname+"/index.html");
});

app.get("/video", function(req, res){// Define a part of the video that we wan to stream
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if(!range){// If there's no ranger
        res.status(400).send("Requires Range header");
    }

    //Video path
    const videoPath = "wordpress.mp4";
    const videoSize = fs.statSync("wordpress.mp4").size;

    const CHUNK_SIZE = 10 ** 6; //1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

     // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, {start, end});

    // Stream the video chunk to the client
    videoStream.pipe(res);

});

app.listen(8000, function(){
    console.log("Listening on port 8000");
});

//Consomme beaucoup des ressources parceque a chaque action
//une demande est fait au serveur, et le stream est 
//configure a prendre 1 MB de la video a chaque requete
//Au serveur(Pas usage des caches)