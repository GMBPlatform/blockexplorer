const fs = require("fs");
const pbkdf2 = require("pbkdf2").pbkdf2Sync;
const unorm = require("unorm");
const randomBytes = require("randombytes");
const uniqueRandomRange = require("unique-random-range");
const xor = require("buffer-xor");

const nodeCrypto = require("crypto");
const address = require("./wallet/address");
const crypto = require("./wallet/crypto");
const ecpair = require("./wallet/ecpair");
const networks = require("./wallet/networks");
const hdnode = require("./wallet/hdnode");

const walletGenerate = info => {
  const personalPassword = info.password;
  const personalRandomNumber = info.randomNumber;
  const personalSentence = info.mnemonic;
  const seed = passphraseToSeed(personalSentence, personalPassword, personalRandomNumber);
  const masterNode = hdnode.fromSeedBuffer(seed.seed);
  const randomNumber = parseInt(seed.rng, 16);
  const childNode = masterNode.derivePath("m/44'/0'/0'/0");
  const walletInfo = {
    randomNumber: randomNumber,
    privateKey: masterNode.keyPair.d.toString(16),
    chainCode: masterNode.chainCode.toString("hex"),
    publicKey: masterNode.getPublicKeyBuffer().toString("hex"),
    extendedPrivateKey: masterNode.toBase58(),
    extendedPublicKey: masterNode.neutered().toBase58(),
    childKeys: [],
    keyFile: {
      content: Buffer.from(
        JSON.stringify({
          mnemonic: personalSentence,
          password: nodeCrypto
            .createHash("sha256")
            .update(personalPassword)
            .digest("hex"),
          randomNumber: randomNumber
        }),
        "utf8"
      ).toString("base64")
    }
  };
  for (let i = 0; i < 50; i++) {
    const path = `m/44 /0 /0 /0 /${i}`;
    const address = childNode.derive(i).getAddress();
    const publicKey = childNode
      .derive(i)
      .getPublicKeyBuffer()
      .toString("hex");
    const privateKey = childNode.derive(i).keyPair.d.toString(16);
    walletInfo.childKeys.push({
      path: path,
      address: address,
      publicKey: publicKey,
      privateKey: privateKey.length == 63 ? "0" + privateKey : privateKey
    });
  }
  return walletInfo;
};

// 사용자의 문장과 비밀번호를 잇는다.
const setPassword = (personalSentence, password) => {
  return personalSentence + " " + password;
};

// 선택한 단어(도형, 색상, 음식, 장소 등)와 비밀번호를 잇는다.
const setSalt = (randomByte, password) => {
  return randomByte.readUInt16BE().toString() + " " + password;
};
// const randomGenerate_ = randomByte => {
//   if (randomByte === undefined) {
//     const _randomNumber = uniqueRandomRange(0, 65535)().toString(16);
//     const randomNumber = _randomNumber.length % 2 != 0 ? "0" + _randomNumber : _randomNumber;
//     return Buffer.from(randomNumber, "hex");
//   } else {
//     return Buffer.from(randomByte, "hex");
//   }
// };

// // 사용자의 문장, 선택한 단어, 개인 비밀번호로 Seed를 생성한다.
// const passphraseToSeed_ = (personalSentence, personalPassword, randomByte) => {
//   const _rng = randomGenerate_(randomByte);

//   let sentenceBuffer = bufferModular(
//     Buffer.from(unorm.nfkd(setPassword(personalSentence, personalPassword)), "utf8"),
//     _rng
//   );
//   let saltBuffer = bufferModular(Buffer.from(unorm.nfkd(setSalt(_rng, personalPassword)), "utf8"), _rng);
//   let _seed = pbkdf2(sentenceBuffer, saltBuffer, 2048, 64, "sha512");
//   return { seed: _seed, rng: _rng };
// };

const randomGenerate = randomByte => {
  if (randomByte === undefined) {
    const _randomNumber = uniqueRandomRange(0, 65535)().toString(16);
    const randomNumber = _randomNumber.length % 2 != 0 ? "0" + _randomNumber : _randomNumber;
    return Buffer.from(randomNumber);
  } else {
    const randomByteConvertInt = parseInt(randomByte).toString(16);
    const randomNumber =
      randomByteConvertInt.length % 2 != 0 ? "0" + randomByteConvertInt : randomByteConvertInt;

    return Buffer.from(randomNumber);
  }
};

// 사용자의 문장, 선택한 단어, 개인 비밀번호로 Seed를 생성한다.
const passphraseToSeed = (personalSentence, personalPassword, randomByte) => {
  const _rng = randomGenerate(randomByte);
  let sentenceBuffer = bufferModular(
    Buffer.from(unorm.nfkd(setPassword(personalSentence, personalPassword)), "utf8"),
    _rng
  );
  let saltBuffer = bufferModular(Buffer.from(unorm.nfkd(setSalt(_rng, personalPassword)), "utf8"), _rng);
  let _seed = pbkdf2(sentenceBuffer, saltBuffer, 2048, 64, "sha512");
  return { seed: _seed, rng: _rng };
};

const bufferModular = (_testBuffer, _rng) => {
  rng = Buffer.allocUnsafe(2);
  _rng.copy(rng, 0);

  testBuffer = _testBuffer;
  for (i = 0; i < testBuffer.length; i++) {
    tempBuffer = !(i % 2) ? rng.slice(0, 1) : rng.slice(1, 2);
    xor(testBuffer.slice(i, i + 1), tempBuffer).copy(testBuffer, i);
    if (!(i % 2)) testBuffer.slice(i, i + 1).copy(rng, 0);
    else testBuffer.slice(i, i + 1).copy(rng, 1);
  }

  return testBuffer;
};

module.exports = {
  passphraseToSeed: passphraseToSeed,
  hdnode: hdnode,
  address: address,
  crypto: crypto,
  ecpair: ecpair,
  networks: networks,
  setPassword: setPassword,
  setSalt: setSalt,
  walletGenerate: walletGenerate
};
