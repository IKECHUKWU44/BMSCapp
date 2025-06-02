const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

export default function handler(req, res) {
  const { channel, uid } = req.query;
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID, appCertificate, channel, Number(uid), role, expireTime
  );
  res.status(200).json({ token });
}
