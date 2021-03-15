// Importamos modulos
const express = require('express');
const path = require('path');
const fs = require('fs');

// Recogemos la función del servidor http express
const app = express();

// Constantes
const CHUNK_SIZE = 10**6; // 1MB

// Rutas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/video", (req, res) => {

    // Recogemos headers
    let range = req.headers.range;
    if (!range)
        res.status(400).send("Http header range es obligatoria.");

    let videoPath = "Our Planet-Netflix.mp4";
    let videoSize = fs.statSync(videoPath).size;
    
    // Parsea la header content-range
    // Ejemplo:  Content-Range: bytes 0-1000000/242000000
    let start = Number(range.replace(/\D/g, ""));
    let end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    let contentLength = end - start + 1; 

    // Response headers
    const headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Content-Type": "video/mp4"
    };

    // Escribimos Http status code 206 (contenido parcial) y las headers
    res.writeHead(206, headers); 

    // La magia ocurre aqui...
    const videoStream = fs.createReadStream(videoPath, {start, end});
    videoStream.pipe(res);
})

// Levantamos el servidor en el puerto 8000
app.listen(8000, () => {
    console.log("Servidor HTTP de streaming escuchando en el puerto 8000...");
})