import { request } from "http";
import { afterEach, describe, expect, it } from "vitest";
import { createGsiGatewayService } from "../gsiGateway/createGsiGatewayService";

function postJson(url: { host: string; port: number; path: string }, body: string) {
  return new Promise<{ statusCode?: number; body: string }>((resolve, reject) => {
    const req = request(
      {
        host: url.host,
        port: url.port,
        path: url.path,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString("utf-8"),
          });
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

describe("createGsiGatewayService", () => {
  const startedServices: { stop: () => Promise<void> }[] = [];

  afterEach(async () => {
    while (startedServices.length > 0) {
      const service = startedServices.pop();
      if (service) {
        await service.stop();
      }
    }
  });

  it("accepts valid POST /gsi payloads", async () => {
    const service = createGsiGatewayService({ port: 0 });
    startedServices.push(service);
    const address = await service.start();

    const payload = JSON.stringify({
      provider: {
        name: "Counter-Strike: Global Offensive",
        appid: 730,
        version: 1,
        steamid: "76561198000000000",
        timestamp: 1700000000,
      },
      map: {
        mode: "competitive",
        name: "de_mirage",
        phase: "live",
        round: 5,
        team_ct: {
          score: 2,
          consecutive_round_losses: 0,
          timeouts_remaining: 1,
          matches_won_this_series: 0,
        },
        team_t: {
          score: 3,
          consecutive_round_losses: 0,
          timeouts_remaining: 1,
          matches_won_this_series: 0,
        },
        num_matches_to_win_series: 1,
      },
      player: {
        steamid: "76561198000000000",
        name: "player",
        observer_slot: 1,
        team: "CT",
        activity: "playing",
        state: {
          health: 100,
          armor: 100,
          helmet: true,
          flashed: 0,
          smoked: 0,
          burning: 0,
          money: 1000,
          round_kills: 0,
          round_killhs: 0,
          round_totaldmg: 0,
          equip_value: 3000,
        },
        forward: "1,0,0",
        match_stats: {
          kills: 0,
          assists: 0,
          deaths: 0,
          mvps: 0,
          score: 0,
        },
      },
      round: {
        phase: "live",
      },
    });

    const response = await postJson(
      { host: "127.0.0.1", port: address.port, path: "/" },
      payload
    );

    expect(response.statusCode).toBe(204);
    expect(service.getState().totalTicks).toBeGreaterThan(0);
  });

  it("returns 400 for invalid payload JSON", async () => {
    const service = createGsiGatewayService({ port: 0 });
    startedServices.push(service);
    const address = await service.start();

    const response = await postJson(
      { host: "127.0.0.1", port: address.port, path: "/" },
      "{not-json}"
    );

    expect(response.statusCode).toBe(400);
  });
});
