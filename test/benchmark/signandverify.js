var SignAndVerify = new BenchmarkSuite('SignAndVerify', [108932.46], [
  new Benchmark("SignMessage", true, false, signMessage),
  new Benchmark("VerifyMessage", true, false, verifyMessage),
]);


var privateKey;
var message = "this is the bitcoin transaction";
var sigHex;

function signMessage() {
  if (!privateKey) {
    privateKey = new Bitcoin.ECKey();
  }
  var hash = Crypto.SHA256(Crypto.SHA256(message, {asBytes: true}), {asBytes: true});
  var sig = privateKey.sign(hash);
  var obj = Bitcoin.ECDSA.parseSig(sig);
  sigHex = Crypto.util.bytesToHex(integerToBytes(obj.r, 32))+Crypto.util.bytesToHex(integerToBytes(obj.s, 32));
}

function verifyMessage() {
  var adr = privateKey.getBitcoinAddress().toString();
  var sig = sigHex;

  var hash = Crypto.SHA256(Crypto.SHA256(message, {asBytes: true}), {asBytes: true});

  sig = [27].concat(Crypto.util.hexToBytes(sig));
  sig = Bitcoin.ECDSA.parseSigCompact(sig);

  var res = false;

  for (var i=0; i<4; i++)
  {
    sig.i = i;

    var pubKey;
    try {
      pubKey = Bitcoin.ECDSA.recoverPubKey(sig.r, sig.s, hash, sig.i);
    } catch(err) {
      throw err;  // benchmark error
    }

    var expectedAddress = pubKey.getBitcoinAddress().toString();
    if (expectedAddress == adr)
    {
      res = adr;
      break;
    }
  }
  if (!res) {
    throw 'verification failure';
  }
}
