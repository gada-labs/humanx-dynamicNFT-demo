import 'dotenv/config';

const createMetadataFiles = [
  '../metadata/create-demo1.json',
];

import Solana from './Solana';


(async () => {

  console.log(new Date().toISOString(), 'HUMANX: Running run-all.ts ops...');

  //await Solana.init();
  
  console.log(new Date().toISOString(), 'HUMANX: Loading create metadatas...');
  
  const createMetadatas = [];
  for (const createMetadataFile of createMetadataFiles) {
    createMetadatas.push(await import(createMetadataFile));
  }
  
  console.log(new Date().toISOString(), 'HUMANX: Finished loading create metadatas.');
  
  console.log(new Date().toISOString(), 'HUMANX: Running create ops...');
  
  for (let i = 0; i < createMetadatas.length; i++) {
    console.log(new Date().toISOString(), `HUMANX: Running create op ${i}...`);
  
    const metadata = createMetadatas[i];
  
    await Solana.mintNft(metadata, createMetadataFiles[i].replace('..', 'https://raw.githubusercontent.com/gada-labs/humanx-dynamicNFT/main'));
  
    console.log(new Date().toISOString(), `HUMANX: Finished running create op ${i}.`);
  }
  
  console.log(new Date().toISOString(), 'HUMANX: Finished running create scripts.');
  
  console.log(new Date().toISOString(), 'HUMANX: Finished running run-all.ts.');
  
  function metadataUri() {
    return async (metadata: string) => {
      return 'http://github....'; // TODO
    }
  }  

})();
