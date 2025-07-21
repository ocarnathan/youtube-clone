// 1. Google Cloud Storage file interactions
// 2. Local file system interactions
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const STORAGE = new Storage(); // instance of GCS library

const RAW_VIDEO_BUCKET_NAME = "neetcode-yt-raw-videos";
const PROCESSED_VIDEO_BUCKET_NAME = "neetcode-yt-processed-videos";

const LOCAL_RAW_VIDEO_PATH = "./raw-videos";
const LOCAL_PROCESSED_VIDEO_PATH = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExistence(LOCAL_RAW_VIDEO_PATH);
    ensureDirectoryExistence(LOCAL_PROCESSED_VIDEO_PATH);

}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${LOCAL_RAW_VIDEO_PATH}/${rawVideoName}`)
        .outputOptions("-vf", "scale=trunc(iw*360/ih/2)*2:360") // 360p
        .on("end", () => {
            console.log('Processing finished successfully');
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            console.log('Input:', `${LOCAL_RAW_VIDEO_PATH}/${rawVideoName}`);
            console.log('Output:', `${LOCAL_PROCESSED_VIDEO_PATH}/${processedVideoName}`);
            reject(err);
        })
        .save(`${LOCAL_PROCESSED_VIDEO_PATH}/${processedVideoName}`);
    });
}

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await STORAGE.bucket(RAW_VIDEO_BUCKET_NAME)
    .file(fileName)
    .download({destination: `${LOCAL_RAW_VIDEO_PATH}/${fileName}` });

    console.log(
        `gs://${RAW_VIDEO_BUCKET_NAME}/${fileName} downloaded to ${LOCAL_RAW_VIDEO_PATH}/${fileName}.`
    )
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = STORAGE.bucket(PROCESSED_VIDEO_BUCKET_NAME);

    await bucket.upload(`${LOCAL_PROCESSED_VIDEO_PATH}/${fileName}`, {
        destination: fileName
    });
    console.log(`${LOCAL_PROCESSED_VIDEO_PATH}/${fileName} uploaded to gs://${RAW_VIDEO_BUCKET_NAME}/${fileName}.`
    );

    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link LOCAL_RAW_VIDEO_PATH} folder.
 * @returns a promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string){
    return deleteFile(`${LOCAL_RAW_VIDEO_PATH}/${fileName}`)
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link LOCAL_PROCESSED_VIDEO_PATH} folder.
 * @returns a promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${LOCAL_PROCESSED_VIDEO_PATH}/${fileName}`);
}

/**
 * 
 * @param filePath - path of file that needs to be deleted.
 * @returns A promise that resolves when the file has been sucessfully deleted.
 */

function deleteFile(filePath: string): Promise<void>{
    return new Promise ((resolve, reject) =>{
        if(!fs.existsSync(filePath)){
            reject(`File ${filePath} does not exist.`)
        } else {
            fs.unlink(filePath, (err) =>{
                if(err) {
                    console.log(`Failed to delete file at ${filePath}.`);
                    console.log(JSON.stringify(err));
                    reject(err);
                }
                resolve();
            });
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true }); // recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}