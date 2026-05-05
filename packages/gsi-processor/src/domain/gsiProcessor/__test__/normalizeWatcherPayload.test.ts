import { describe, expect, it } from "vitest";
import type { Pistol } from "../../csgo/weaponTypes";
import { normalizeWatcherPayload } from "../normalizeWatcherPayload";
import {
  minimalClientTick,
  minimalDedicatedTick,
} from "../../../__test__/fixtures/minimalWatcherTick";

describe("normalizeWatcherPayload", () => {
  it("maps client_local player into snapshot.players", () => {
    const tick = minimalClientTick();
    const snap = normalizeWatcherPayload(tick);
    expect(snap.watcherMode).toBe("client_local");
    expect(snap.players).toHaveLength(1);
    expect(snap.players[0].steamid).toBe("self-steamid");
    expect(snap.players[0].equippedWeapon).toBe("weapon_usp_silencer");
  });

  it("merges allplayers without duplicating the same steamid", () => {
    const tick = minimalDedicatedTick();
    const snap = normalizeWatcherPayload(tick);
    const ids = snap.players.map((p) => p.steamid).sort();
    expect(ids).toEqual(["steam-a", "steam-b"]);
  });

  it("defaults optional player fields when state and stats are missing", () => {
    const tick = minimalClientTick({
      player: {
        steamid: "x",
        name: "anon",
        observer_slot: 0,
        activity: "playing",
      },
    });
    const snap = normalizeWatcherPayload(tick);
    expect(snap.players[0].health).toBe(0);
    expect(snap.players[0].money).toBe(0);
    expect(snap.players[0].kills).toBe(0);
    expect(snap.players[0].team).toBe("CT");
    expect(snap.players[0].equippedWeapon).toBe("Unknown");
    expect(snap.players[0].weapons).toEqual([]);
  });

  it("uses inactive weapon slot when none are active", () => {
    const holsteredGlock: Pistol = {
      type: "Pistol",
      name: "weapon_glock",
      paintkit: "default",
      ammo_clip: 20,
      ammo_clip_max: 20,
      ammo_reserve: 120,
      state: "holstered",
    };
    const tick = minimalClientTick({
      player: {
        ...minimalClientTick().player!,
        weapons: {
          weapon_1: holsteredGlock,
        },
      },
    });
    const snap = normalizeWatcherPayload(tick);
    expect(snap.players[0].equippedWeapon).toBe("Unknown");
  });

  it("sets map and round to null when absent on payload", () => {
    const tick = minimalClientTick({ map: undefined, round: undefined });
    const snap = normalizeWatcherPayload(tick);
    expect(snap.map).toBeNull();
    expect(snap.round).toBeNull();
  });
});
