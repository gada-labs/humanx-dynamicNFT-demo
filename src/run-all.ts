import createDemo1 from '../metadata/create-demo1';
import Solana from './Solana';


console.log(new Date().toISOString(), 'HUMANX: Running run-all.ts ops...');

console.log(new Date().toISOString(), 'HUMANX: Loading create metadatas...');

const metadatas = [];
metadatas.push(createDemo1);

console.log(new Date().toISOString(), 'HUMANX: Finished loading create metadatas.');

console.log(new Date().toISOString(), 'HUMANX: Running create ops...');

for (let i = 0; i < metadatas.length; i++) {
  console.log(new Date().toISOString(), `HUMANX: Running create op ${i}...`);

  const metadata = metadatas[i];

  await Solana.mintNft(metadata, metadataUri());

  console.log(new Date().toISOString(), `HUMANX: Finished running create op ${i}.`);
}

console.log(new Date().toISOString(), 'HUMANX: Finished running create scripts.');

console.log(new Date().toISOString(), 'HUMANX: Finished running run-all.ts.');

function metadataUri() {
  return async (metadata: string) => {
    return 'http://github....';
  }
}