using CounterStrikeSharp.API.Core;
using Cs2SharpServerPlugin.Application.Hooks;
using Cs2SharpServerPlugin.Domain;

namespace Cs2SharpServerPlugin.Infrastructure.Hooks;

/// <summary>
/// When <see cref="ServerFeatureToggles.HeadshotOnlyDamage"/> is on, non-head hits deal no damage.
/// </summary>
public sealed class HeadshotOnlyDamagePreRegistration : IGameHookRegistration
{
    private readonly ServerFeatureToggles _toggles;

    public HeadshotOnlyDamagePreRegistration(ServerFeatureToggles toggles)
    {
        _toggles = toggles;
    }

    public void Register(BasePlugin plugin)
    {
        plugin.RegisterListener<Listeners.OnPlayerTakeDamagePre>((player, info) =>
        {
            if (!_toggles.HeadshotOnlyDamage)
                return HookResult.Continue;

            return info.GetHitGroup() == HitGroup_t.HITGROUP_HEAD
                ? HookResult.Continue
                : HookResult.Handled;
        });
    }
}
