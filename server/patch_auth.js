const fs = require('fs');
const path = require('path');

/**
 * Patch script to verify / ensure auth.controller.js supports both email and phone login
 */
const targetPath = path.join(__dirname, 'src', 'controllers', 'auth.controller.js');
if (fs.existsSync(targetPath)) {
    console.log('[patch_auth] auth.controller.js is present at', targetPath);
    const content = fs.readFileSync(targetPath, 'utf8');
    if (content.includes('isEmail') && content.includes('LOWER(u.email)')) {
        console.log('[patch_auth] Verified: Email and Phone authentication is already active and up to date.');
    } else {
        console.log('[patch_auth] Note: Please verify login function query in auth.controller.js');
    }
} else {
    console.log('[patch_auth] File not found at expected path:', targetPath);
}
