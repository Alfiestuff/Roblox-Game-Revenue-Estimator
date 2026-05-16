import { jget } from "./api.js";
import { DEVEX, extractPlaceId } from "./utils.js";

export async function estimate(input) {
  const placeId = extractPlaceId(input);
  if (!placeId) throw new Error("Could not find a Roblox place ID in that input.");

  const uni = await jget(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!uni.universeId) throw new Error("That place has no universe.");
  const universeId = uni.universeId;

  const [gameJson, votesJson, thumbJson] = await Promise.all([
    jget(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
    jget(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`).catch(() => ({ data: [{ upVotes: 0, downVotes: 0 }] })),
    jget(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=256x256&format=Png&isCircular=false`).catch(() => ({ data: [] })),
  ]);

  const g = gameJson.data?.[0];
  if (!g) throw new Error("No game data returned.");

  const v = votesJson.data?.[0] || { upVotes: 0, downVotes: 0 };
  const iconUrl = thumbJson.data?.[0]?.imageUrl || null;

  const concurrent = g.playing;
  const totalVotes = v.upVotes + v.downVotes;
  const likeRatio = totalVotes > 0 ? v.upVotes / totalVotes : 0.85;

  const dauMult = 8 + likeRatio * 6;
  const estDAU = Math.round(concurrent * dauMult);

  const favRatio = g.visits > 0 ? g.favoritedCount / g.visits : 0;
  const engagement = Math.min(1, favRatio * 50);

  const arpdauRobux = 0.8 + likeRatio * 1.5 + engagement * 1.2;

  const dailyRobux = Math.round(estDAU * arpdauRobux);
  const monthlyRobux = dailyRobux * 30;

  let paidAccessRobux = 0;
  if (g.price && g.price > 0) {
    paidAccessRobux = Math.round(g.visits * 0.03 * g.price);
  }

  const ageDays = Math.max(
    1,
    Math.floor((Date.now() - new Date(g.created).getTime()) / 86400000)
  );

  const lifeRunRate = Math.round(dailyRobux * ageDays * 0.45);
  const lifeVisits = Math.round(g.visits * 0.35);

  const lifetimeRobux = Math.max(lifeRunRate, lifeVisits) + paidAccessRobux;

  return {
    name: g.name,
    creator: g.creator.name,
    iconUrl,
    playing: concurrent,
    visits: g.visits,
    favorites: g.favoritedCount,
    dailyUSD: dailyRobux * DEVEX,
    monthlyUSD: monthlyRobux * DEVEX,
    lifetimeUSD: lifetimeRobux * DEVEX,
  };
}