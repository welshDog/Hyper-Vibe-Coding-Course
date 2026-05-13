import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { Attribution } from 'ox/erc8021';

const hash = (process.argv[2] ?? process.env.TX_HASH ?? '').trim();
const builderCode = (process.argv[3] ?? process.env.BUILDER_CODE ?? '').trim();

if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
  console.error('Missing/invalid tx hash.');
  console.error('Usage: node check-tx.mjs <0xTX_HASH> [BUILDER_CODE]');
  console.error('Example: node check-tx.mjs 0xabc... bc_rxomj3y2');
  process.exit(1);
}

if (!builderCode) {
  console.error('Missing BUILDER_CODE.');
  console.error('Provide it as argv[3] or env BUILDER_CODE=...');
  process.exit(1);
}

const expectedSuffix = Attribution.toDataSuffix({ codes: [builderCode] });

const c = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const tx = await c.getTransaction({ hash });

console.log('hash=', hash);
console.log('builderCode=', builderCode);
console.log('expectedSuffix=', expectedSuffix);
console.log('input=', tx.input);
console.log('inputEndsWithSuffix=', tx.input.toLowerCase().endsWith(expectedSuffix.toLowerCase()));
