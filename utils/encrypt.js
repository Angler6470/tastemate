const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_SECRET; // Must be a 64-character hex string

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (hash) => {
  const [iv, content] = hash.split(':');
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, 'hex'),
    Buffer.from(iv, 'hex')
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };
