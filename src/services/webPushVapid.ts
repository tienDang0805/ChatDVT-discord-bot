import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';

export interface VapidKeys {
  publicKey: string; // base64url uncompressed 65-byte P-256 point
  privateKeyJwk: crypto.JsonWebKey;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface WebPushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
  badge?: string;
  urgent?: boolean;
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(str: string): Buffer {
  const padLen = (4 - (str.length % 4)) % 4;
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
  return Buffer.from(b64, 'base64');
}

export function generateVapidKeys(): VapidKeys {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  const pubJwk = publicKey.export({ format: 'jwk' });
  const privJwk = privateKey.export({ format: 'jwk' });
  const x = fromBase64Url(String(pubJwk.x));
  const y = fromBase64Url(String(pubJwk.y));
  const uncompressed = Buffer.concat([Buffer.from([0x04]), x, y]);
  return {
    publicKey: toBase64Url(uncompressed),
    privateKeyJwk: privJwk,
  };
}

export function createVapidAuthHeader(
  endpoint: string,
  vapid: VapidKeys,
  subject = 'mailto:admin@devtiendang.blog'
): string {
  const origin = new URL(endpoint).origin;
  const header = toBase64Url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const payload = toBase64Url(
    Buffer.from(
      JSON.stringify({
        aud: origin,
        exp,
        sub: subject,
      })
    )
  );
  const signingInput = `${header}.${payload}`;
  const privKey = crypto.createPrivateKey({ key: vapid.privateKeyJwk, format: 'jwk' });
  const signature = crypto.sign('sha256', Buffer.from(signingInput, 'ascii'), {
    key: privKey,
    dsaEncoding: 'ieee-p1363',
  });
  const jwt = `${signingInput}.${toBase64Url(signature)}`;
  return `vapid t=${jwt}, k=${vapid.publicKey}`;
}

export function encryptRFC8291Payload(
  plaintextUtf8: string,
  p256dhBase64Url: string,
  authBase64Url: string
): Buffer {
  const uaPublic = fromBase64Url(p256dhBase64Url);
  const authSecret = fromBase64Url(authBase64Url);
  if (uaPublic.length !== 65 || uaPublic[0] !== 0x04) {
    throw new Error('Invalid subscriber p256dh public key');
  }

  const localEcdh = crypto.createECDH('prime256v1');
  const asPublic = localEcdh.generateKeys(); // 65-byte uncompressed
  const ecdhSecret = localEcdh.computeSecret(uaPublic);

  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0', 'ascii'), uaPublic, asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', ecdhSecret, authSecret, keyInfo, 32));

  const salt = crypto.randomBytes(16);
  const cekInfo = Buffer.from('Content-Encoding: aes128gcm\0', 'ascii');
  const nonceInfo = Buffer.from('Content-Encoding: nonce\0', 'ascii');
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, cekInfo, 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, nonceInfo, 12));

  // RFC 8291 single-record delimiter 0x02
  const paddedPlaintext = Buffer.concat([Buffer.from(plaintextUtf8, 'utf8'), Buffer.from([0x02])]);
  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const encrypted = Buffer.concat([cipher.update(paddedPlaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Binary header: salt (16) || rs=4096 uint32BE (4) || idlen=65 uint8 (1) || keyid=asPublic (65)
  const recordHeader = Buffer.alloc(21);
  salt.copy(recordHeader, 0);
  recordHeader.writeUInt32BE(4096, 16);
  recordHeader.writeUInt8(asPublic.length, 20);

  return Buffer.concat([recordHeader, asPublic, encrypted, authTag]);
}

export function decryptRFC8291ForTest(
  body: Buffer,
  uaEcdh: crypto.ECDH,
  authBase64Url: string
): string {
  const salt = body.subarray(0, 16);
  const idLen = body.readUInt8(20);
  const asPublic = body.subarray(21, 21 + idLen);
  const ciphertextAndTag = body.subarray(21 + idLen);
  const ciphertext = ciphertextAndTag.subarray(0, ciphertextAndTag.length - 16);
  const authTag = ciphertextAndTag.subarray(ciphertextAndTag.length - 16);

  const uaPublic = uaEcdh.getPublicKey();
  const ecdhSecret = uaEcdh.computeSecret(asPublic);
  const authSecret = fromBase64Url(authBase64Url);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0', 'ascii'), uaPublic, asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', ecdhSecret, authSecret, keyInfo, 32));
  const cek = Buffer.from(
    crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0', 'ascii'), 16)
  );
  const nonce = Buffer.from(
    crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0', 'ascii'), 12)
  );
  const decipher = crypto.createDecipheriv('aes-128-gcm', cek, nonce);
  decipher.setAuthTag(authTag);
  const decryptedPadded = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const delimIdx = decryptedPadded.lastIndexOf(0x02);
  return decryptedPadded.subarray(0, delimIdx).toString('utf8');
}

export async function sendWebPushNotification(
  sub: PushSubscriptionRecord,
  payload: WebPushPayload,
  vapid: VapidKeys
): Promise<{ ok: boolean; status: number; expired: boolean }> {
  const jsonBody = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag || 'gau-gym-8d-push',
    url: payload.url || '/gym8D',
    icon: payload.icon || '/gym8D/assets/mascots/app_icon_sherpa_512.png',
    badge: payload.badge || '/gym8D/assets/mascots/app_icon_sherpa_512.png',
  });
  const encryptedBody = encryptRFC8291Payload(jsonBody, sub.p256dh, sub.auth);
  const authHeader = createVapidAuthHeader(sub.endpoint, vapid);
  const targetUrl = new URL(sub.endpoint);
  const transport = targetUrl.protocol === 'http:' ? http : https;

  const status = await new Promise<number>((resolve, reject) => {
    const req = transport.request(
      targetUrl,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'Content-Length': String(encryptedBody.length),
          TTL: '86400',
          Urgency: payload.urgent !== false ? 'high' : 'normal',
        },
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode || 500));
      }
    );
    req.on('error', reject);
    req.write(encryptedBody);
    req.end();
  });

  const expired = status === 404 || status === 410;
  return {
    ok: status >= 200 && status < 300,
    status,
    expired,
  };
}
