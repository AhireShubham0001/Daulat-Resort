import { google } from 'googleapis';
import path from 'path';
import stream from 'stream';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE_PATH = path.join(__dirname, '..', 'credentials.json');
// UPDATED SCOPES: Use the full drive scope to avoid permission issues with different drive types
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Initial dummy auth to prevent crash if file missing
let auth = null;
let drive = null;

try {
    if (fs.existsSync(KEY_FILE_PATH)) {
        auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: SCOPES,
        });
        drive = google.drive({ version: 'v3', auth });
        console.log("Drive API Initialized Successfully");
    } else {
        console.warn("WARNING: credentials.json not found. Google Drive upload will fail.");
    }
} catch (error) {
    console.error("Error initializing Google Drive:", error);
}

export const uploadFile = async (fileObject) => {
    if (!drive) throw new Error("Google Drive API not initialized. Missing credentials.json?");

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    // FIXED: The structure of create() arguments was slightly wrong in previous iteration
    // 'requestBody' contains metadata, 'media' contains the file
    try {
        const { data } = await drive.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: ['1hR1fKWzdOm8pQR_by78zn-a3x1IlTEzF'], // Replace with your actual Folder ID
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            fields: 'id, name, webContentLink, webViewLink',
        });

        console.log(`Uploaded file ${data.name} (ID: ${data.id})`);

        // Make file publicly readable
        await drive.permissions.create({
            fileId: data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return data;

    } catch (error) {
        console.error("Detailed Upload Error:", error);
        throw error; // Re-throw so the frontend gets the error
    }
};

export const deleteFile = async (fileId) => {
    if (!drive) throw new Error("Google Drive API not initialized.");
    try {
        await drive.files.delete({ fileId });
        console.log(`Deleted file ${fileId}`);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};
