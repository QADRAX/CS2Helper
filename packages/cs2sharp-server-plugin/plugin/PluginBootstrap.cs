using CounterStrikeSharp.API.Core;
using Cs2SharpServerPlugin.Application.Commands;
using Cs2SharpServerPlugin.Application.Hooks;
using Cs2SharpServerPlugin.Domain;
using Cs2SharpServerPlugin.Infrastructure.Commands;
using Cs2SharpServerPlugin.Infrastructure.Hooks;

namespace Cs2SharpServerPlugin.Plugin;

/// <summary>
/// Composition root: ordered registration of hooks and console commands.
/// </summary>
public static class PluginBootstrap
{
    public static void RegisterAll(BasePlugin plugin, ServerFeatureToggles toggles)
    {
        foreach (var hook in CreateHookRegistrations(toggles))
            hook.Register(plugin);

        foreach (var cmd in CreateCommandRegistrations(toggles))
            cmd.Register(plugin);
    }

    /// <summary>Global listeners — keep order explicit if dependencies appear later.</summary>
    private static IReadOnlyList<IGameHookRegistration> CreateHookRegistrations(ServerFeatureToggles toggles) =>
    [
        new HeadshotOnlyDamagePreRegistration(toggles),
    ];

    /// <summary>Console commands collection — add new <see cref="IConsoleCommandRegistration"/> here.</summary>
    private static IReadOnlyList<IConsoleCommandRegistration> CreateCommandRegistrations(ServerFeatureToggles toggles) =>
    [
        new ChFeatureToggleConsoleRegistration(toggles),
    ];
}
