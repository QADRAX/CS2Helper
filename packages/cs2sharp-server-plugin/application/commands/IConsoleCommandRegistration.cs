using CounterStrikeSharp.API.Core;

namespace Cs2SharpServerPlugin.Application.Commands;

/// <summary>
/// Registers one console command against a plugin instance (CounterStrikeSharp <c>AddCommand</c> bridge).
/// Add new command types as new classes and append them to <see cref="PluginBootstrap"/> collections.
/// </summary>
public interface IConsoleCommandRegistration
{
    void Register(BasePlugin plugin);
}
