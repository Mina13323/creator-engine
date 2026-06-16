// scripts/test-embedding.ts

import { embedText } from '../packages/rag-core/src';

async function main() {
  const embedding = await embedText(
    'Creator Engine embedding test'
  );

  console.log('Embedding Length:', embedding.length);
}

main().catch(console.error);