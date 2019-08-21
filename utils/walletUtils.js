module.export.hexPadding = hex => {
  while (hex.length < 4) {
    hex = "0" + hex;
    if (hex.length == 4) {
      break;
    }
  }
  return hex;
};

module.export.transactionHandler = (from, note, keyR, keyS) => ({
  Revision: 0,
  PreviousKeyID: 0,
  ContractCreateTime: 1562231185,
  Fintech: 0,
  From: from,
  Balance: 0,
  NotePrivacy: 0,
  Note: [note],
  KeyR: keyR,
  KeyS: keyS
});
