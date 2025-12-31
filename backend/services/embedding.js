const { pipeline } = require('@xenova/transformers');

let extractor = null;

async function getEmbedding(text) {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    );
  }

  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true
  });

  return Array.from(output.data);
}

module.exports = { getEmbedding };
