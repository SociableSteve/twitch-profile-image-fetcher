import * as dotenv from "dotenv";
dotenv.config();
import * as http from "http";

import axios from "axios";
let token: string = "";
async function setOAuthCredentials() {
  const response = (
    await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    )
  ).data;
  token = response.access_token;
  setTimeout(setOAuthCredentials, Math.min(response.expires_in, 86400));
}
setOAuthCredentials();

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    axios
      .get(`https://api.twitch.tv/helix/users?login=${req.url.substr(1)}`, {
        headers: {
          authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
      })
      .then((response) => {
        res.write(response.data.data[0].profile_image_url);
      })
      .catch((e) => {
        res.write(e.toString());
      })
      .finally(() => res.end());
  }
);

server.listen(process.env.PORT || 3001);
