const pinataSDK = require('@pinata/sdk');

const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_HASH);

async function loadData() {
    let options = {
        pinataMetadata: { name: '0x8a579fc5b79a7F0e3f0094B86e7226D489FBc157.json' },
        pinataOptions: { cidVersion: 0 }
    };
    let payload = {
        "name": "Vintage Culture - Culture Shock II",
        "description": "Vintage Culture drops new tracks from Alesso, GORDO, Tinlicker, Kaskade, Martinez Bros, Leftwing Kody, Alok, Jackarta and many more!",
        "contract_nft": "0x8a579fc5b79a7F0e3f0094B86e7226D489FBc157",
        "artists_site": "https://www.youtube.com/",
        "artists_social_networking_twitter": "https://twitter.com/JaqGomesOficial",
        "artists_social_networking_instagram": "https://www.instagram.com/filipemachado.sh",
        "company_site": "https://www.youtube.com/",
        "token_standard": "ERC1155",
        "blockchain": "eth",
        "youtube_url": "https://www.youtube.com/channel/UCtZZIenge-VfCE1eAXgLd4g",
        "animation_url": "https://www.youtube.com/channel/UCtZZIenge-VfCE1eAXgLd4g",
        "date_mint": "1644610044205",
        "image": "https://app.vectary.com/viewer/v1/?model=7fa90a27-83ae-4ab1-ad6f-1b14f24fcc3c&env=studio3&turntable=3",
        "attributes": [{ "trait_type": "eye", "value":  "blue" }],
        "checksum": "61ef5c7daced05b58036f77a"
      }
    let nft = await pinata.pinJSONToIPFS(payload, options);
    console.log(nft);
}
loadData();