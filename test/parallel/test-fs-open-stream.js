'use strict';

const common = require('../common');
const assert = require('assert');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// Use existing file instead of creating one
const testFile = '../../mine/bigfile_x5.m4b';

async function streamFile(path) {
  const fileHandle = await fsPromises.open(path);
  const stats = await fileHandle.stat();
  const fileData = new Uint8Array(stats.size);
  let chunkArray;
  
  try {
    let i = 0;
    for await (const chunk of fileHandle.readableWebStream()) {
      chunkArray = new Uint8Array(chunk);
      fileData.set(chunkArray, i);
      i += chunkArray.byteLength;
    }
    return fileData;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw to fail the test
  } finally {
    await fileHandle.close();
  }
}

async function runTest() {
  // Get file size for verification
  const stats = await fsPromises.stat(testFile);
  const fileSize = stats.size;
  
  // Run multiple iterations
  let iteration = 1;
  const maxIterations = 1_000_000; // Limit iterations for test
  
  try {
    while (iteration <= maxIterations) {
      console.log(`Starting iteration ${iteration}`);
      const data = await streamFile(testFile);
      
      // Verify data is correct
      assert.strictEqual(data.length, fileSize);
      
      console.log(`Iteration ${iteration} completed successfully, data length: ${data.length}`);
      iteration++;
    }
    console.log('All iterations completed successfully');
  } catch (error) {
    console.error(`Error occurred on iteration ${iteration}:`, error);
    throw error; // Re-throw to fail the test
  }
}

// Run the test
(async () => {
  try {
    await runTest();
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
