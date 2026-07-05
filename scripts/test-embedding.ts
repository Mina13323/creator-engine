// scripts/test-embedding.ts

import { embedText } from '../packages/rag-core/src/index';

async function main() {
  const embedding = await embedText(
    'Creator Engine embedding test'
  );

  console.info('Embedding Length:', embedding.length);
}

main().catch(console.error);