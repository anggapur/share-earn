function hexToBytes(hexString) {
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    return bytes;
}

function uint8ArrayToHex(bufferData) {
    const uint8Array = new Uint8Array(bufferData);

    // Convert Uint8Array to hexadecimal string
    const hexString = Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return hexString
}

module.exports = {
    hexToBytes,
    uint8ArrayToHex
}