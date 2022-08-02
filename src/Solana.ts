import * as solana from '@solana/web3.js';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as solanaToken from '@solana/spl-token';
import * as metaplexNs from '@metaplex-foundation/js';
import * as bs58 from 'bs58';


export default abstract class Solana {

  private static readonly HUMANX_AUTHORITY_PUBLIC_KEY = 'cr3MDcyGai6gkCmrRSX3atoaAqRW8pMAFCa25WfoZry';
  private static readonly HUMANX_AUTHORITY_PRIVATE_KEY = '3nBp3EYhRQmcaCNzXjYd416Y9SBg88KHWHYF8wugaf7MjEnGKw2p59teasxhJyAPZ2oidQEnRKbELbbNKmt4Vrjj';
  private static readonly HUMANX_ROYALTY_PUBLIC_KEY = 'cr3nrTZYDWTjTGv9bY1LoGm9Er4uwW4FD4SDBoLdcqX';
  private static readonly HUMANX_ROYALTY_PRIVATE_KEY = '4nP8HqLYiPDKivxftF4mRaNomc8uNv7TukMKMmUV6WEcXEUSpUEMEMwL9pZgsv6mdDVSxf3B1fCLiW9mhkXU7Ss3';

  // Private functions

  private static readonly CLUSTER: solana.Cluster = 'devnet';
  private static readonly COMMITMENT: solana.Commitment = 'confirmed';

  private static connection() {
    const cluster: solana.Cluster = this.CLUSTER;
    const endpoint = solana.clusterApiUrl(cluster);
    const commitment: solana.Commitment = this.COMMITMENT;
    const connection = new solana.Connection(endpoint, commitment);
    return connection;
  }

  private static async __checkConnection() {

    const connection = this.connection();
    const endpoint = solana.clusterApiUrl(this.CLUSTER);

    console.log(new Date().toISOString(), `HUMANX Solana __checkConnection() Connecting to endpoint ${endpoint}`);
    const solanaNodeVersion = (await connection.getVersion())['solana-core'];
    console.log(new Date().toISOString(), `HUMANX Solana __checkConnection() Connected to endpoint ${endpoint} ${solanaNodeVersion}`);

    this.__fundHumanX('devnet').then(() => { }, () => { });
    this.__fundHumanX('testnet').then(() => { }, () => { });
  }

  private static async __fundHumanX(cluster: solana.Cluster) {

    console.log(new Date().toISOString(), `HUMANX Solana __fundGada() Funding GADA authority wallet...`);
    const signature = await this.connection().requestAirdrop(
      new PublicKey(this.HUMANX_AUTHORITY_PUBLIC_KEY),
      solana.LAMPORTS_PER_SOL * 100
    );

    console.log(new Date().toISOString(), `HUMANX Solana __fundGada() Requested airdrop with signature ${signature}`);
    await this.connection().confirmTransaction(signature);
    console.log(new Date().toISOString(), `HUMANX Solana __fundGada() Confirmed airdrop with signature ${signature}`);
  }

  // Public functions

  public static async mintNft(metadata: any, metadataUri: (metadata: string) => Promise<string>) {

    this.__checkConnection();

    /* eslint-disable @typescript-eslint/naming-convention */
    // const metadata = {
    //   'name': utility.name,
    //   'symbol': 'GADA',
    //   'description': utility.description,
    //   'image': utility.imageURL,
    //   //'animation_url': '',
    //   'external_url': 'https://www.gadalabs.com',
    //   'attributes': [
    //     {
    //       'trait_type': 'Provider',
    //       'value': 'GADA'
    //     }
    //   ]
    // };
    //TODO compare output with: https://solscan.io/token/2QgaD4KhUmC8pKegmadFB4pQJ7BgrC5xWUsnnB6iCJq7#metadata, which for example shows as (MASTER EDITION), and has on chain metadata like editionNonce int 254, collection with verified info and edition with maxSuppy and supply props
    /* eslint-enable @typescript-eslint/naming-convention */
    const metadataString = JSON.stringify(metadata);
    const _metadataUri = await metadataUri(metadataString);

    console.log(new Date().toISOString(), 'HUMANX Solana mintNft(): Minting NFT...');
    const metaplex = new metaplexNs.Metaplex(this.connection());
    metaplex.use(metaplexNs.keypairIdentity(Keypair.fromSecretKey(bs58.decode(this.HUMANX_AUTHORITY_PRIVATE_KEY))));
    const task = metaplex.nfts().create({
      uri: _metadataUri, // Off-chain JSON data
      name: metadata.name, // On-chain, duplicated in the off-chain JSON data
      sellerFeeBasisPoints: 500, // On-chain only
      symbol: metadata.symbol, // On-chain, duplicated in the off-chain JSON data
      creators: [
        {
          'address': new PublicKey(this.HUMANX_AUTHORITY_PUBLIC_KEY),
          'share': 0,
          'verified': true
        },
        {
          'address': new PublicKey(this.HUMANX_ROYALTY_PUBLIC_KEY),
          'share': 100,
          'verified': false
        },
      ],
      isMutable: true, // Default is true
      maxSupply: 0, // Default is 0
      collection: null, // Default is null. For future addition of verified collection metadata check https://solscan.io/token/2QgaD4KhUmC8pKegmadFB4pQJ7BgrC5xWUsnnB6iCJq7#metadata as an example
      uses: null // Default is null
    });
    task.onStatusChange((status) => {
      console.log(new Date().toISOString(), 'HUMANX: Minting status change:');
      console.log(status);
    });
    const output = await task.run();
    const mintTransaction = output.response.signature;
    const mintAddress = output.nft.mintAddress.toBase58(); // Apparently the same as:
    //                  output.nft.mint.address.toBase58();
    //                  output.mintSigner.publicKey.toBase58();
    const metadataAddress = output.metadataAddress.toBase58(); // Apparently the same as:
    //                      output.nft.metadataAddress.toBase58();
    const mintAuthority = output.nft.mint.mintAuthorityAddress!.toBase58(); // Apparently the same as:
    //                    output.masterEditionAddress.toBase58();
    //                    output.nft.edition.address.toBase58();

    console.log(new Date().toISOString(), 'HUMANX Solana mintNft(): Minted NFT:');
    console.log(`mintTransaction: ${mintTransaction}`);
    console.log(`mintAddress: ${mintAddress}`);
    console.log(`metadataAddress: ${metadataAddress}`);
    console.log(`mintAuthority: ${mintAuthority}`);

    console.log(new Date().toISOString(), `HUMANX Solana mintNft(): Confirming mint transaction... ${mintTransaction}`);
    await this.connection().confirmTransaction(mintTransaction);
    console.log(new Date().toISOString(), `HUMANX Solana mintNft(): Confirmed mint transaction: ${mintTransaction}`);
  }

}
