import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    // Get path of the input video file from request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=trunc(iw*360/ih/2)*2:360") // 360p
        .on("end", () => {
            console.log('Processing finished successfully');
            res.status(200).send('Processing finished successfully');
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            console.log('Input:', inputFilePath);
            console.log('Output:', outputFilePath);
            res.status(500).send(`An error occurred: ${err.message}`);
        })
        .save(outputFilePath);

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});