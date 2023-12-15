import * as fs from 'fs';
import "dotenv/config.js";
import { formatsByName } from '@ensdomains/address-encoder';
import * as ensContent from "@ensdomains/content-hash";

let _rec = JSON.parse(fs.readFileSync('./records.json'));
console.log(process.env.SIGNER)
import { normalize } from 'viem/ens'
import { privateKeyToAccount } from 'viem/accounts'
import { getAddress, isAddress, encodeAbiParameters, parseAbiParameters, keccak256 } from 'viem'
const signer = privateKeyToAccount(process.env.SIGNER.startsWith("0x") ? process.env.SIGNER : "0x" + process.env.SIGNER)
const RESOLVER = "0x83c25DbcFD8d79a9E0F9f7f6cFc5b21716ACf469";
const CHAINID = "5"
const recSigner = getAddress(_rec.signer);
console.log(recSigner, signer.address)
const toHexString = arr => Array.from(arr, i => i.toString(16).padStart(2, "0")).join("");
const utf8 = new TextEncoder();
console.log(toHexString(utf8.encode("√∫©ßƒ")))
/*const approvedSig = await approver.signMessage({
    message: `Requesting Signature To Approve ENS Records Signer\n` +
        `\nGateway: ${gateway}` +
        `\nResolver: eip155:${env.CHAINID}:${env.RESOLVER}` +
        `\nApproved Signer: eip155:${env.CHAINID}:${addr}`
});*/
//console.log(formatsByName["ETH"].coinType)
//console.log(formatsByName["ETH"].decoder("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF").toString("hex"))
for (const [_domain, _records] of Object.entries(_rec.records)) {
    let _path = ".well-known/" + _domain.split(".").reverse().join("/")
    if (_records.contenthash) {
        let _contenthash = encodeContenthash(_records.contenthash)
        console.log("CH:", _contenthash)
        if (_contenthash) {
            const signedContent = "";
            writeFile(_path, "contenthash", _contenthash, _contenthash)
        }
    }
    if (_records.address) {
        for (const [_symbol, _address] of Object.entries(_records.address)) {
            let result = encodeAddress(_symbol, _address)
            console.log("address", result)
            if (result) { }
            //result.address = encodeBytes(result.address);
        }
    }
    console.log(`${_domain}: ${_records} : ${_path}`);
}
function signRecord(_gateway, _recType, _result) {
    _result = encodeBytes(_result).toLowerCase();
    _result = keccak256(_result)
    const _msg = `Requesting Signature To Update ENS Record\n` +
        `\nGateway: https://${_gateway}` +
        `\nResolver: eip155:${CHAINID}:${RESOLVER}` +
        `\nRecord Type: ${_recType}` +
        `\nExtradata: ${toHexString(_result)}` +
        `\nSigned By: eip155:${CHAINID}:${signer.address}`
}

function encodeContenthash(_ch) {
    try {
        const _content = _ch.split("://")
        const _proto = _content[0].toLowerCase()
        switch (_proto) {
            case "ipfs" || "ipns" || "onion":
                return encodeBytes(ensContent.encode(_proto, _content[1]))
            case "bzz":
                return encodeBytes(ensContent.encode("swarm", _content[1]))
            case "onion3":
                return encodeBytes(ensContent.encode("onion3", _content[1]))
            case "ar" || "arweave":
                return encodeBytes(ensContent.encode("arweave", _content[1]))
            default:
                return false
        }
    } catch (err) {
        console.error(err)
        return false
    }
}

function encodeBytes(_result) {
    return encodeAbiParameters(
        parseAbiParameters('bytes result'),
        [_result]
    ).toLowerCase()
}
function encodeString(_result) {
    return encodeAbiParameters(
        parseAbiParameters('string result'),
        [_result]
    ).toLowerCase()
}

function formatAddress(_result) {
    return encodeAbiParameters(
        parseAbiParameters('address result'),
        [_result]
    ).toLowerCase()
}

function formatData(signer, recSig, appSig, result) {
    return "0x2b45eb2b" + encodeAbiParameters(
        parseAbiParameters('address signer, bytes recSig, bytes appSig, bytes result'),
        [signer, recSig, appSig, result]
    ).slice(2)
}

console.log(encodeBytes("0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF"))
function encodeAddress(_symbol, _address) {
    _symbol = _symbol.toUpperCase();
    try {
        const _type = formatsByName[_symbol].coinType
        let _addr = formatsByName[_symbol].decoder(_address).toString("hex")
        _addr = _addr.length > 64 ? encodeBytes("0x" + _addr) : "0x" + _addr.padStart(64, "0")
        return { _type: `address/${_type}`, _encoded: _addr }
    } catch (err) {
        console.error(err.message)
        return false;
    }
}

function writeFile(_dir, _filename, _data, _raw) {
    _dir = `./test/${_dir}/`
    if (!fs.existsSync(`${_dir}`)) {
        fs.mkdirSync(`${_dir}`, { recursive: true });
    }
    fs.writeFile(`${_dir}${_filename}.json`, JSON.stringify({ data: _data, value: _raw }), (err) => {
        if (err) {
            console.error(err.message);
            return false;
        }
        console.log(`${_dir}${_filename}.json - Data written to file`);
    });
}

function generateProfile(params) {

}