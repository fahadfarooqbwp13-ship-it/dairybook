// One-time: generate a fixed PKCS#12 keystore (no JDK/keytool needed) so every
// APK build is signed with the same key → updates install over the old app.
// Output: android/app/dairybook.p12  (committed to the repo)
const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

const keys = forge.pki.rsa.generateKeyPair(2048)
const cert = forge.pki.createCertificate()
cert.publicKey = keys.publicKey
cert.serialNumber = '01'
cert.validity.notBefore = new Date()
cert.validity.notAfter = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30)
const attrs = [
  { name: 'commonName', value: 'DairyBook' },
  { name: 'organizationName', value: 'DairyBook' },
  { name: 'countryName', value: 'PK' },
]
cert.setSubject(attrs)
cert.setIssuer(attrs)
cert.sign(keys.privateKey, forge.md.sha256.create())

const p12 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], 'dairybook', {
  friendlyName: 'dairybook',
  algorithm: '3des',
})
const der = forge.asn1.toDer(p12).getBytes()
const out = path.join(__dirname, '..', 'android', 'app', 'dairybook.p12')
fs.writeFileSync(out, Buffer.from(der, 'binary'))
console.log('wrote keystore:', out, Buffer.from(der, 'binary').length, 'bytes')
