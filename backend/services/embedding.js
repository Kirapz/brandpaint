const { pipeline } = require('@xenova/transformers');

let extractor = null;
let isLoading = false;
let loadError = null;

async function getEmbedding(text) {
  if (loadError) {
    console.warn('Embedding disabled due to previous error:', loadError.message);
    throw loadError;
  }

  if (isLoading) {
    console.log('Waiting for model to load...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getEmbedding(text); // Retry 
  }

  try {
    if (!extractor) {
      console.log('Loading embedding model...');
      isLoading = true;
      
      extractor = await pipeline(
        'feature-extraction',
        'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        { 
          quantized: true,
          progress_callback: null
        }
      );
      
      isLoading = false;
      console.log(' Embedding model loaded successfully');
    }

    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    return Array.from(output.data);
  } catch (error) {
    isLoading = false;
    loadError = error;
    console.error(' Embedding error:', error.message);
    throw error;
  }
}

module.exports = { getEmbedding };
