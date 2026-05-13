using CounterStrikeSharp.API.Core;
using Cs2SharpServerPlugin.Application.Commands;
using Cs2SharpServerPlugin.Domain;
using Microsoft.Extensions.Logging;

namespace Cs2SharpServerPlugin.Infrastructure.Commands;

/// <summary>
/// Server console: <c>css_ch_feature &lt;feature&gt; &lt;0|1&gt;</c>.
/// </summary>
public sealed class ChFeatureToggleConsoleRegistration : IConsoleCommandRegistration
{
    private const string CommandName = "css_ch_feature";
    private const string Description = "CS2Helper: toggle optional server tweaks.";

    private readonly ServerFeatureToggles _toggles;

    public ChFeatureToggleConsoleRegistration(ServerFeatureToggles toggles)
    {
        _toggles = toggles;
    }

    public void Register(BasePlugin plugin)
    {
        plugin.AddCommand(CommandName, Description, (caller, command) =>
        {
            if (caller is not null)
            {
                command.ReplyToCommand("[CS2Helper] This command can only be run from the server console.");
                return;
            }

            if (command.ArgCount < 3)
            {
                command.ReplyToCommand($"[CS2Helper] Usage: {ServerFeatureToggles.UsageLine}");
                return;
            }

            var feature = (command.ArgByIndex(1) ?? string.Empty).Trim();
            var valueRaw = (command.ArgByIndex(2) ?? string.Empty).Trim();

            if (!int.TryParse(valueRaw, out var intVal) || intVal is not (0 or 1))
            {
                command.ReplyToCommand($"[CS2Helper] value must be 0 or 1. {ServerFeatureToggles.UsageLine}");
                return;
            }

            var enabled = intVal == 1;
            if (!_toggles.TrySet(feature, enabled))
            {
                command.ReplyToCommand($"[CS2Helper] unknown feature \"{feature}\". {ServerFeatureToggles.UsageLine}");
                return;
            }

            command.ReplyToCommand($"[CS2Helper] feature \"{feature}\" = {(enabled ? "1 (on)" : "0 (off)")}");
            plugin.Logger.LogInformation("css_ch_feature: {Feature} set to {Enabled}", feature, enabled);
        });
    }
}
