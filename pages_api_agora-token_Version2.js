import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export default function handler(req, res) {
  const { channel, uid } = req.query;

  if (!channel || !uid) {
    return res.status(400).json({ error: "channel and uid are required" });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appID || !appCertificate) {
    return res.status(500).json({ error: "Agora credentials not set" });
  }

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channel,
    Number(uid),
    role,
    privilegeExpireTs
  );

  return res.status(200).json({ token });
}