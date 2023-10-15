const fs = require('fs');
const util = require('util');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const config = require('../config/config')
const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

function getMacaroon() {
    const m = fs.readFileSync(config.LND_MACAROON_PATH);
    const macaroon = m.toString('hex');
    return macaroon
}

function getCredentials() {
    const macaroon = getMacaroon()
    
     // build meta data credentials
     let metadata = new grpc.Metadata()
     metadata.add('macaroon', macaroon)
     let macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
         callback(null, metadata);
     });
 
     // build ssl credentials without needing to pass in the cert
     const sslCreds = grpc.credentials.createSsl();
 
      // combine the cert credentials and the macaroon auth credentials
     // such that every call is properly encrypted and authenticated
     let credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

     return credentials
    
}

async function getProtoFiles() {
    const directoryPath = './lnd/proto';
    const readdir = util.promisify(fs.readdir);

    try {
        let protos = []
        const files = await readdir(directoryPath);        
        files.forEach(file => {          
          protos.push(`${directoryPath}/${file}`)
        });    
        return protos
    } catch (err) {
        console.error('Error reading directory:', err);
        return null
    }    
}

async function loadPackage() {
    const protos = await getProtoFiles()
    const packageDefinition = protoLoader.loadSync(protos, loaderOptions);
    process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'
       
    // Pass the crendentials when creating a channel
    let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
    return lnrpcDescriptor
}

async function initLNRPC(type) {
    const lnrpcDescriptor = await loadPackage()
    const credentials = getCredentials()
    const lndGrpc = config.LND_GRPC

    switch(type) {
        case 'LNRPC':
            let lnrpc = lnrpcDescriptor.lnrpc;
            return new lnrpc.Lightning(lndGrpc, credentials);                    
        case 'LNRPC_ROUTER':
            let routerrpc = lnrpcDescriptor.routerrpc;
            return new routerrpc.Router(lndGrpc, credentials);            
        default:
            return null      
    }

}

module.exports = {
   initLNRPC
}