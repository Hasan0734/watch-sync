import config from "./config.ts";
import { PlaylistVideo } from "./types.ts";
import { youtube, youtube_v3 } from "@googleapis/youtube";




let Youtube = config.YOUTUBE_API_KEY
    ? youtube({
        version: "v3",
        auth: config.YOUTUBE_API_KEY,
    })
    : null;


export const mapYoutubeSearchResult = (
    video: youtube_v3.Schema$SearchResult,
): PlaylistVideo => {
    return {
        channel: video.snippet?.channelTitle ?? "",
        url: "https://www.youtube.com/watch?v=" + video?.id?.videoId,
        name: video.snippet?.title ?? "",
        img: video.snippet?.thumbnails?.default?.url ?? "",
        duration: 0,
        type: "youtube",
    };
};


export const searchYoutube = async (
    query: string,
): Promise<PlaylistVideo[]> => {
    try {
        const response = await Youtube?.search.list({
            part: ["snippet"],
            type: ["video"],
            maxResults: 25,
            q: query,
        });
        console.log('hello', process.env.YOUTUBE_API_KEY)
        return response?.data?.items?.map(mapYoutubeSearchResult) ?? [];

    } catch (err) {
        console.log(err)
        return []
    }

};