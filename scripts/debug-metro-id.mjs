import fs from 'fs';
import path from 'path';
import http from 'http';

const args = process.argv.slice(2);
const searchId = args[0] || '6459'; // Default to the id the user reported
const url = 'http://localhost:8081/index.bundle?platform=web&dev=true';

console.log(`Fetching Metro web bundle from ${url}...`);

http.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Request Failed. Status Code: ${res.statusCode}`);
        return;
    }

    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            console.log('Bundle fetched successfully. Analyzing module IDs...');
            // Metro bundle format usually defines modules like:
            // __d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) { ... }, ID, [dependencies], "Path/to/file.js");

            // Let's find the matching module ID
            const regex = new RegExp(`__d\\(.*?,\\s*${searchId}\\s*,\\s*\\[(.*?)\\],\\s*"([^"]+)"\\)`, 'g');
            const match = regex.exec(rawData);

            if (match) {
                console.log(`\n\x1b[32mFound Module ${searchId}:\x1b[0m`);
                console.log(`Path: ${match[2]}`);
                console.log(`Dependencies: [${match[1]}]`);

                // Let's also parse dependencies to find their names
                const depsStr = match[1].split(',').map(s => s.trim()).filter(Boolean);
                if (depsStr.length > 0) {
                    console.log('Resolving dependencies:');
                    for (const depId of depsStr) {
                        const depRegex = new RegExp(`__d\\(.*?,\\s*${depId}\\s*,\\s*\\[.*?\\],\\s*"([^"]+)"\\)`, 'g');
                        const depMatch = depRegex.exec(rawData);
                        if (depMatch) {
                            console.log(`  - ID ${depId}: ${depMatch[1]}`);
                        } else {
                            console.log(`  - ID ${depId}: (Unknown)`);
                        }
                    }
                }
            } else {
                console.log(`\n\x1b[31mModule ${searchId} not found directly in bundle.\x1b[0m`);
                console.log(`This might be an internal dynamically generated ID or the bundle failed to compile fully.`);

                // Let's try to search the entire bundle for the ID in case the regex missed it
                console.log(`Looking for occurrences of the string "${searchId}" in the bundle...`);
                const lines = rawData.split('\n');
                let found = false;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes(` ${searchId},`) || lines[i].includes(`[${searchId}]`) || lines[i].includes(`${searchId}`)) {
                        console.log(`Match at line ${i + 1}: ${lines[i].substring(0, 150)}...`);
                        found = true;
                        if (i > 100) break; // limit output
                    }
                }
                if (!found) {
                    console.log('No instances found.');
                }
            }
        } catch (e) {
            console.error('Error parsing bundle:', e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    console.log(`Please make sure Metro is running in apps/gurudevi-mobile via 'pnpm start'.`);
});
