using CounterStrikeSharp.API.Core;
using Cs2SharpServerPlugin.Domain;
using Cs2SharpServerPlugin.Plugin;
using Microsoft.Extensions.Logging;

namespace Cs2SharpServerPlugin;

public class Cs2SharpServerPlugin : BasePlugin
{
    private readonly ServerFeatureToggles _toggles = new();

    public override string ModuleName => "CS2Helper server plugin";

    public override string ModuleVersion => "0.1.0";

    public override string ModuleAuthor => "Qadrax";

    public override string ModuleDescription =>
        "Optional server tweaks toggled from console (css_ch_feature); no game mode logic.";

    public override void Load(bool hotReload)
    {
        PluginBootstrap.RegisterAll(this, _toggles);
        Logger.LogInformation(
            "Cs2SharpServerPlugin loaded (hotReload={HotReload}). {Usage}",
            hotReload,
            ServerFeatureToggles.UsageLine);
    }
}
