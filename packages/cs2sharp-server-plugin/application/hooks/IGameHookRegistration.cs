using CounterStrikeSharp.API.Core;

namespace Cs2SharpServerPlugin.Application.Hooks;

/// <summary>
/// Registers global game hooks (listeners) for a plugin.
/// </summary>
public interface IGameHookRegistration
{
    void Register(BasePlugin plugin);
}
