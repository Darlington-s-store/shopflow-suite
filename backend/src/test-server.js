try {
    console.log('Attempting to import index.js...');
    await import('./index.js');
    console.log('index.js imported successfully');
} catch (error) {
    console.error('Import failed with error:');
    console.error(error);
}
