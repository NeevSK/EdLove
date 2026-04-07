const fs = require('fs');
const path = require('path');

const API_DIR = 'c:/Users/Naween/projects/polymath-platform/packages/core/src/api';
const INDEX_PATH = path.join(API_DIR, 'index.ts');

function audit() {
    const indexContent = fs.readFileSync(INDEX_PATH, 'utf-8');
    
    const coverageRegex = /assertContractCoverage\(\s*(\w+),\s*defineContractCoverage\((\{[\s\S]*?\})\)\);/g;
    let match;
    const modules = [];

    while ((match = coverageRegex.exec(indexContent)) !== null) {
        const rawVarName = match[1];
        const configStr = match[2];
        
        const moduleNameMatch = configStr.match(/moduleName:\s*['"](.+?)['"]/);
        const contractMatch = configStr.match(/contract:\s*(\w+)/);
        const mappingMatch = configStr.match(/methodMapping:\s*(\{[\s\S]*?\}),/);
        const internalMethodsMatch = configStr.match(/internalMethods:\s*(\[[\s\S]*?\])/);
        
        if (!moduleNameMatch || !contractMatch) continue;

        const moduleName = moduleNameMatch[1];
        const contractVar = contractMatch[1];
        const methodMapping = mappingMatch ? eval(`(${mappingMatch[1]})`) : {};
        const internalMethods = internalMethodsMatch ? eval(`(${internalMethodsMatch[1]})`) : [];

        const importRegex = new RegExp(`import\\s+\\{\\s*(\\w+API)\\s+as\\s+${rawVarName}\\s*\\}\\s+from\\s+['"]\\.\\/(.+?)['"]`);
        const importMatch = indexContent.match(importRegex);
        const importDirectRegex = new RegExp(`import\\s+\\{\\s*${rawVarName}\\s*\\}\\s+from\\s+['"]\\.\\/(.+?)['"]`);
        const importDirectMatch = indexContent.match(importDirectRegex);

        const fileName = (importMatch ? importMatch[2] : (importDirectMatch ? importDirectMatch[1] : moduleName)) + '.ts';
        const implPath = path.join(API_DIR, fileName);

        const contractImportRegex = new RegExp(`import\\s+\\{\\s*${contractVar}\\s*\\}\\s+from\\s+['"]\\.\\/(.+?)['"]`);
        const contractImportMatch = indexContent.match(contractImportRegex);
        const contractFileName = (contractImportMatch ? contractImportMatch[1] : moduleName + '.contract') + '.ts';
        const contractPath = path.join(API_DIR, contractFileName);

        modules.push({ moduleName, implPath, contractPath, methodMapping, internalMethods });
    }

    const report = [];

    for (const mod of modules) {
        if (!fs.existsSync(mod.implPath)) continue;
        if (!fs.existsSync(mod.contractPath)) continue;

        const implContent = fs.readFileSync(mod.implPath, 'utf-8');
        const contractContent = fs.readFileSync(mod.contractPath, 'utf-8');

        // Robustly extract keys from the exported API object
        // Find: export const xxxAPI = {
        const apiNameMatch = mod.implPath.match(/(\w+API)\.ts$/) || mod.implPath.match(/(\w+)\.ts$/);
        const apiName = apiNameMatch ? apiNameMatch[1] : 'API';
        
        const apiBlockRegex = new RegExp(`export const \\w*API = \\{([\\s\\S]*?^\\s*\\};)`, 'm');
        const apiMatch = implContent.match(apiBlockRegex);
        
        const implMethods = new Set();
        if (apiMatch) {
            const block = apiMatch[1];
            // Match keys:  method(args) { or method: ...
            // Avoid matching things inside comments or strings if possible, but let's be careful.
            const lines = block.split('\n');
            for (let line of lines) {
                // Key patterns:
                // 1. method(args) {
                // 2. async method(args) {
                // 3. method: (args) => {
                // 4. "method": ...
                const m = line.match(/^\s*(?:async\s+)?(\w+)\s*[\(\:]/);
                if (m) {
                    const key = m[1];
                    if (!['if', 'for', 'while', 'switch', 'return', 'await'].includes(key)) {
                        implMethods.add(key);
                    }
                }
            }
        }

        // Contract keys from c.router({ ... })
        const contractKeyRegex = /^\s*(\w+):\s*\{/gm;
        const contractKeys = new Set();
        let keyMatch;
        while ((keyMatch = contractKeyRegex.exec(contractContent)) !== null) {
            contractKeys.add(keyMatch[1]);
        }

        const missingInContract = [];
        const reverseMapping = {};
        for (const [impl, contract] of Object.entries(mod.methodMapping)) {
            reverseMapping[impl] = contract;
        }

        const internals = new Set(mod.internalMethods);

        for (const implMethod of implMethods) {
            if (internals.has(implMethod)) continue;
            const mappedName = reverseMapping[implMethod] || implMethod;
            if (!contractKeys.has(mappedName)) {
                missingInContract.push(implMethod);
            }
        }

        report.push({
            moduleName: mod.moduleName,
            status: missingInContract.length === 0 ? 'OK' : 'ERROR',
            ghostMethods: missingInContract,
            totalImpl: implMethods.size,
            totalContract: contractKeys.size
        });
    }

    console.log(JSON.stringify(report, null, 2));
}

audit();
