namespace Cs2SharpServerPlugin.Domain;

/// <summary>
/// Runtime toggles for optional server tweaks (no game mode logic — convars / damage rules only).
/// </summary>
public sealed class ServerFeatureToggles
{
    /// <summary>
    /// When true, damage is applied only if the hit group is head; all other hit groups are fully blocked.
    /// </summary>
    public bool HeadshotOnlyDamage { get; set; }

    public bool TrySet(string featureId, bool enabled)
    {
        switch (featureId.Trim().ToLowerInvariant())
        {
            case "headshot_only":
            case "headshotonly":
                HeadshotOnlyDamage = enabled;
                return true;
            default:
                return false;
        }
    }

    public static string UsageLine =>
        "css_ch_feature <feature> <0|1> — features: headshot_only (only head hits deal damage).";
}
