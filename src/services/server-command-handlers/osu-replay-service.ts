/*eslint-disable no-async-promise-executor*/
import { Message } from "discord.js";
import { injectable } from "inversify";
import { MessageResponse } from "../message-handler";
import { CommandHandler, Handle } from "./server-commands-config";
import axios from "axios";
import { createWriteStream } from "fs";
import { createReadStream } from "fs";
import FormData = require("form-data");

@CommandHandler
@injectable()
export class OsuReplayService {
  public downloadFile = async (fileUrl: string, outputLocationPath: string) => {
    const writer = createWriteStream(outputLocationPath);

    return axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    }).then(response => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on("error", err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on("close", () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    });
  };

  public replayRequestBuilder = fileName => {
    const data = new FormData();
    data.append("username", "FluffyEcho");
    data.append("resolution", "1920x1080");
    data.append("globalVolume", "50");
    data.append("musicVolume", "50");
    data.append("hitsoundVolume", "50");
    data.append("showHitErrorMeter", "true");
    data.append("showScore", "true");
    data.append("showHPBar", "true");
    data.append("showComboCounter", "true");
    data.append("showPPCounter", "false");
    data.append("showKeyOverlay", "true");
    data.append("showScoreboard", "false");
    data.append("showBorders", "false");
    data.append("showMods", "true");
    data.append("showResultScreen", "true");
    data.append("skin", "MonkoEdit");
    data.append("useSkinCursor", "true");
    data.append("useSkinColors", "true");
    data.append("useBeatmapColors", "false");
    data.append("cursorScaleToCS", "false");
    data.append("cursorRainbow", "false");
    data.append("cursorTrailGlow", "false");
    data.append("drawFollowPoints", "true");
    data.append("scaleToTheBeat", "false");
    data.append("sliderMerge", "false");
    data.append("objectsRainbow", "false");
    data.append("objectsFlashToTheBeat", "false");
    data.append("useHitCircleColor", "true");
    data.append("seizureWarning", "false");
    data.append("loadStoryboard", "false");
    data.append("loadVideo", "false");
    data.append("introBGDim", "0");
    data.append("inGameBGDim", "90");
    data.append("breakBGDim", "50");
    data.append("BGParallax", "false");
    data.append("showDanserLogo", "true");
    data.append("motionBlur960fps", "false");
    data.append("skip", "true");
    data.append("cursorRipples", "false");
    data.append("sliderSnaking", "false");
    data.append("replayFile", createReadStream(fileName));
    return data;
  };

  public getRenderProgress = async renderID => {
    const rendersList = (
      await axios.get("https://ordr-api.issou.best/renders", {
        params: {
          pageSize: 10,
          page: 1,
        },
      })
    ).data.renders;

    const render = rendersList.filter(render => render.renderID === renderID)[0];
    return render;
  };

  @Handle("!ordr")
  public handleOsuReplayRequest = async (message: Message): Promise<MessageResponse> => {
    const promise = new Promise<MessageResponse>(async resolve => {
      await this.downloadFile(
        (message.attachments as any).first().attachment,
        (message.attachments as any).first().name
      );

      const data = this.replayRequestBuilder((message.attachments as any).first().name);

      const renderRequest = await axios({
        method: "post",
        url: "https://ordr-api.issou.best/renders/",
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      });
      const renderID = renderRequest.data.renderID;

      const renderCheck = setInterval(async () => {
        const render = await this.getRenderProgress(renderID);
        if (render.progress === "Done.") {
          clearInterval(renderCheck);
          console.log("Render Complete.");
          const messageResponse = new MessageResponse(render.videoUrl, true);
          resolve(messageResponse);
        } else {
          console.log("Render still in progress.");
        }
      }, 5000);
    });

    return promise;
  };
}
