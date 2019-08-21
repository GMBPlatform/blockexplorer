const HDKey = require("@ont-community/hdkey-secp256r1");
const nodeCrypto = require("crypto");
const seedGenerator = require("./seedGenerator");

const secp256r1WalletUtil = ({ seed, childKeyLength = 50, randomNumber }) => {
  const walletInfo = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
  const childKeys = [];
  for (let i = 0; i < childKeyLength; i++) {
    childKeys.push(walletInfo.derive(`m/0/0/${i}`));
  }
  return {
    walletInfo: walletInfo,
    childKeys: childKeys,
    randomNumber: randomNumber
  };
};

module.exports = request => {
  const seed = seedGenerator({
    personalSentence: request.mnemonic,
    personalPassword: request.password,
    randomByte: request.randomNumber
  });
  const HDKey = secp256r1WalletUtil({ seed: seed.seed.toString(), randomNumber: parseInt(seed.rng, 16) });
  const walletInfo = {
    randomNumber: HDKey.randomNumber,
    privateKey: HDKey.walletInfo._privateKey.toString("hex"),
    chainCode: HDKey.walletInfo.chainCode.toString("hex"),
    publicKey: HDKey.walletInfo._publicKey.toString("hex"),
    childKeys: [],
    keyFile: {
      content: Buffer.from(
        JSON.stringify({
          mnemonic: request.mnemonic,
          password: nodeCrypto
            .createHash("sha256")
            .update(request.password)
            .digest("hex"),
          randomNumber: HDKey.randomNumber
        }),
        "utf8"
      ).toString("base64")
    }
  };
  HDKey.childKeys.forEach(child => {
    walletInfo.childKeys.push({
      privateKey: child._privateKey.toString("hex"),
      publicKey: child._publicKey.toString("hex"),
      path: `m/44/0/${child.depth}/0/${child.index}`,
      address: child._identifier.toString("hex")
    });
  });
  return walletInfo;
};
