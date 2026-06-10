import fs from 'node:fs';

/**
 * Parses a TSC error file and generates a summary of errors per file and per category.
 */

function analyzeErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const fileStats = {};
  const errorCategories = {};
  const totalErrors = { count: 0 };

  // Regex to match TSC errors: path/to/file.tsx(line,col): error TSXXXX: Message
  // Adjusted for the format in the provided text file which starts with line numbers
  const tscErrorRegex = /(.+\.tsx?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)/;

  let currentError = null;

  lines.forEach((line) => {
    const trimmedLine = line.trimEnd();
    const match = trimmedLine.match(tscErrorRegex);

    if (match) {
      if (currentError) {
        processError(currentError);
      }
      const [_, file, lineNum, col, errorCode, message] = match;
      currentError = { file, lineNum, col, errorCode, message };
    } else if (currentError && trimmedLine.startsWith('  ')) {
      // Append second line of message (indented)
      currentError.message += ` ${trimmedLine.trim()}`;
    } else if (currentError && !trimmedLine.match(tscErrorRegex) && trimmedLine.length > 0) {
      // It might be a follow-up line without the double space (sometimes happens in certain tsc outputs)
      if (trimmedLine.includes('is not assignable to type')) {
        currentError.message += ` ${trimmedLine.trim()}`;
      }
    }
  });

  if (currentError) {
    processError(currentError);
  }

  function processError(error) {
    const { file, errorCode, message } = error;
    totalErrors.count++;

    // File stats
    if (!fileStats[file]) {
      fileStats[file] = { count: 0, errors: [] };
    }
    fileStats[file].count++;
    fileStats[file].errors.push(error);

    // Category categorization
    let category = 'Other';
    const msgLower = message.toLowerCase();

    if (msgLower.includes("'sx' does not exist")) category = 'Legacy SX Prop';
    else if (msgLower.includes("'classname' does not exist"))
      category = 'Missing className Support';
    else if (msgLower.includes("'spacing' does not exist")) category = 'Legacy Spacing Prop';
    else if (msgLower.includes("'space' does not exist")) category = 'Missing Space Prop';
    else if (msgLower.includes("'color' does not exist on type 'intrinsicattributes & textprops'"))
      category = 'Legacy Text color Prop';
    else if (msgLower.includes("'bold' does not exist")) category = 'Legacy Text bold Prop';
    else if (msgLower.includes("'italic' does not exist")) category = 'Legacy Text italic Prop';
    else if (msgLower.includes("'variant' does not exist")) category = 'Legacy Variant Prop';
    else if (msgLower.includes("'size' does not exist")) category = 'Legacy Size Prop';
    else if (msgLower.includes("'gap' does not exist")) category = 'Legacy Gap Prop';
    else if (msgLower.includes("'textalign' does not exist")) category = 'Legacy textAlign Prop';
    else if (msgLower.includes("'justifycontent' does not exist"))
      category = 'Legacy Flex Prop (justifyContent)';
    else if (msgLower.includes("'alignitems' does not exist"))
      category = 'Legacy Flex Prop (alignItems)';
    else if (msgLower.includes("cannot find name 'theme'")) category = 'Missing Theme Reference';
    else if (msgLower.includes("cannot find name 'colors'")) category = 'Missing Colors Reference';
    else if (msgLower.includes('expected 1 arguments, but got')) category = 'API Change (Args)';
    else if (errorCode === 'TS2305') category = 'Import/Export Error';
    else if (errorCode === 'TS2339' && msgLower.includes("'show'")) category = 'Toast API Change';
    else if (msgLower.includes("object is possibly 'undefined'")) category = 'Strict Null Check';

    if (!errorCategories[category]) {
      errorCategories[category] = 0;
    }
    errorCategories[category]++;
  }

  // Sort files by error count descending
  const sortedFiles = Object.entries(fileStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50); // Get top 50 files

  // Sort categories by count descending
  const sortedCategories = Object.entries(errorCategories).sort((a, b) => b[1] - a[1]);

  const report = {
    totalErrors: totalErrors.count,
    timestamp: new Date().toISOString(),
    categories: sortedCategories.map(([name, count]) => ({
      name,
      count,
      percent: `${((count / totalErrors.count) * 100).toFixed(2)}%`,
    })),
    topOffendingFiles: sortedFiles.map(([name, data]) => ({
      file: name,
      count: data.count,
    })),
  };

  console.log('--- ERROR ANALYSIS REPORT ---');
  console.log(`Total Errors Parsed: ${totalErrors.count}`);
  console.log('\n--- BY CATEGORY ---');
  console.table(report.categories);
  console.log('\n--- TOP 20 OFFENDING FILES ---');
  console.table(report.topOffendingFiles.slice(0, 20));

  fs.writeFileSync('error_analysis_summary.json', JSON.stringify(report, null, 2));
  console.log('\nFull report saved to error_analysis_summary.json');
}

const targetFile = process.argv[2] || 'tsc-output.txt';
analyzeErrors(targetFile);
