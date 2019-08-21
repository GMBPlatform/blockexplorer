const HDKey = require("@ont-community/hdkey-secp256r1");
const pbkdf2 = require("pbkdf2").pbkdf2Sync;
const uniqueRandomRange = require("unique-random-range");
const unorm = require("unorm");
const xor = require("buffer-xor");

const setSalt = (randomByte, password) => {
  return randomByte.readUInt16BE().toString() + " " + password;
};
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
const setPassword = (personalSentence, password) => {
  return personalSentence + " " + password;
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
module.exports = ({ personalSentence, personalPassword, randomByte }) => {
  const _rng = randomGenerate(randomByte);
  let sentenceBuffer = bufferModular(
    Buffer.from(unorm.nfkd(setPassword(personalSentence, personalPassword)), "utf8"),
    _rng
  );
  let saltBuffer = bufferModular(Buffer.from(unorm.nfkd(setSalt(_rng, personalPassword)), "utf8"), _rng);
  let _seed = pbkdf2(sentenceBuffer, saltBuffer, 2048, 64, "sha512");
  return { seed: _seed, rng: _rng };
};
