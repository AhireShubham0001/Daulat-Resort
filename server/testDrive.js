import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');
// The folder ID you provided in previous steps
const FOLDER_ID = '1hR1fKWzdOm8pQR_by78zn-a3x1IlTEzF';

console.log("---------------------------------------------------");
console.log("🔍 DIAGNOSTIC: GOOGLE DRIVE CONNECTION TEST");
console.log("---------------------------------------------------");
console.log(`Checking for credentials at: ${KEY_FILE_PATH}`);

if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error("❌ ERROR: credentials.json is MISSING in the server folder.");
    console.error("   Please download it from Google Cloud Console and place it here.");
    process.exit(1);
} else {
    console.log("✅ credentials.json found.");
}

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function checkPermission() {
    try {
        console.log(`\nAttempting to access folder: ${FOLDER_ID}...`);

        // 1. Try to get folder metadata
        const folder = await drive.files.get({
            fileId: FOLDER_ID,
            fields: 'id, name, capabilities'
        });

        console.log(`✅ FOLDER FOUND: "${folder.data.name}" (ID: ${folder.data.id})`);

        // 2. Check strict permissions
        if (folder.data.capabilities && folder.data.capabilities.canAddChildren) {
            console.log("✅ PERMISSION CHECK PASSED: Service Account CAN write to this folder.");
        } else {
            console.warn("⚠️ WARNING: Folder found, but Service Account might NOT have write permission.");
            console.warn("   'canAddChildren' is false. Please share the folder with 'Editor' role.");
        }

        // 3. Try a real write test
        console.log("\nAttempting to create a test file...");
        const res = await drive.files.create({
            requestBody: {
                name: 'Test_Permission_Check.txt',
                parents: [FOLDER_ID]
            },
            media: {
                mimeType: 'text/plain',
                body: 'If you see this, the backend has correct permissions.'
            },
            supportsAllDrives: true
        });

        console.log(`✅ WRITE SUCCESS! Created file ID: ${res.data.id}`);

        // 4. Cleanup
        await drive.files.delete({ fileId: res.data.id });
        console.log("✅ DELETE SUCCESS! Cleaned up the test file.");

        console.log("\n---------------------------------------------------");
        console.log("🎉 CONCLUSION: EVERYTHING IS WORKING PERFECTLY!");
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("\n❌ OPERATION FAILED:");
        console.error(`   Error Message: ${error.message}`);

        if (error.code === 404) {
            console.error("\n👉 CAUSE: Folder not found or not shared.");
            console.error("   Action: Check the Folder ID. If correct, SHARE the folder with the Service Account email.");
        } else if (error.code === 403) {
            console.error("\n👉 CAUSE: Insufficient Permissions (403).");
            console.error("   Action: Share the folder with the Service Account as 'Editor'.");
        } else {
            console.error("\n👉 CAUSE: Unknown API Error.");
            console.error("   Action: Check if 'Google Drive API' is enabled in Google Cloud Console.");
        }
    }
}

checkPermission();
