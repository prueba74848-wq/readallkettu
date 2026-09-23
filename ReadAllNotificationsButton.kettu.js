/*
 * ReadAllNotificationsButton — Kettu port
 * Original: Vencord/Equicord, by Devs.kemo & EquicordDevs.KrystalSkull
 *
 * PORTING NOTES:
 * - Kettu is React Native, not a DOM/webpack client, so there is no
 *   ServerListAPI equivalent. This port exposes the action as a button in
 *   the plugin's own settings panel instead of injecting into the guild
 *   rail. If you want it somewhere else (a long-press action sheet, a
 *   slash command, etc.) that's a different patch target — say the word.
 * - Store/method names were verified on-device via /eval:
 *     findByStoreName("GuildStore")      -> getGuilds()                          confirmed
 *     findByStoreName("ChannelStore")    -> getMutableGuildChannelsForGuild(id)  confirmed
 *     findByStoreName("ReadStateStore")  -> hasUnread(id), lastMessageId(id)     confirmed
 *     findByProps("getActiveJoinedThreadsForGuild")                              confirmed
 *   ChannelStore's map is flat (channelId -> channel), with no
 *   SELECTABLE/VOCAL split like desktop's GuildChannelStore, so we just
 *   check hasUnread() on every entry instead of filtering by category.
 * - FluxDispatcher resolution (findByProps("dispatch","subscribe")) is
 *   standard Vendetta-family convention but wasn't separately verified on
 *   this build — if BULK_ACK doesn't do anything, check that first.
 * - No JSX/imports: everything is resolved at runtime through
 *   window.vendetta's metro shim, matching what you found in your build.
 * - Per-server selection: NEW. Excluded servers persist via MMKV storage
 *   (vd.storage), same pattern your working AutoReact plugin uses for its
 *   blacklist, since vd.plugin.storage isn't populated at bundle scope here.
 */

const vd = window.vendetta;
const { findByProps, findByStoreName } = vd.metro;

// This build doesn't expose React/RN directly on window.vendetta, so pull
// them from the module registry.
const React = findByProps("createElement", "useState");
const RN = findByProps("View", "Text", "StyleSheet");
const { createElement: h, useState, useMemo } = React;
const { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } = RN;

const { showToast } = vd.ui.toasts;
const { getAssetIDByName } = vd.ui.assets;
const { createStorage, wrapSync, createMMKVBackend } = vd.storage;

// ---- module resolution -----------------------------------------------

const GuildStore = findByStoreName("GuildStore");
const ChannelStore = findByStoreName("ChannelStore");
const ReadStateStore = findByStoreName("ReadStateStore");
const FluxDispatcher = findByProps("dispatch", "subscribe");
const ThreadStore = findByProps("getActiveJoinedThreadsForGuild");

// ---- persisted settings -----------------------------------------------

const storage = wrapSync(createStorage(createMMKVBackend("ReadAllNotificationsButton")));

// List of guild ids to SKIP when Read All runs. Empty = every server included.
function getExcludedGuilds() {
    if (!storage["excludedGuilds"]) storage["excludedGuilds"] = [];
    return storage["excludedGuilds"];
}

function toggleGuild(guildId) {
    const excluded = getExcludedGuilds();
    const idx = excluded.indexOf(guildId);
    if (idx === -1) excluded.push(guildId);
    else excluded.splice(idx, 1);
}

// ---- core logic (ported from onClick in the original plugin) --------

function readAll() {
    if (!GuildStore || !ChannelStore || !ReadStateStore || !FluxDispatcher) {
        showToast("ReadAll: couldn't resolve required Discord modules — see console", getAssetIDByName?.("Small"));
        console.error("[ReadAllNotificationsButton]", {
            GuildStore: !!GuildStore,
            ChannelStore: !!ChannelStore,
            ReadStateStore: !!ReadStateStore,
            FluxDispatcher: !!FluxDispatcher
        });
        return;
    }

    const excluded = getExcludedGuilds();
    const channels = [];

    Object.values(GuildStore.getGuilds()).forEach(guild => {
        if (excluded.indexOf(guild.id) !== -1) return;

        // ChannelStore's map is flat (channelId -> channel), no
        // SELECTABLE/VOCAL split like desktop — hasUnread() alone decides
        // what counts, since voice channels won't report unread.
        const guildChannels = ChannelStore.getMutableGuildChannelsForGuild(guild.id) ?? {};

        Object.values(guildChannels).forEach(channel => {
            if (!channel?.id || !ReadStateStore.hasUnread(channel.id)) return;

            channels.push({
                channelId: channel.id,
                messageId: ReadStateStore.lastMessageId(channel.id),
                readStateType: 0
            });
        });

        // Joined threads, mirroring the original plugin's flatMap over
        // per-parent thread groups.
        if (ThreadStore) {
            const guildThreads = ThreadStore.getActiveJoinedThreadsForGuild(guild.id) ?? {};
            Object.values(guildThreads)
                .flatMap(threadChannels => Object.values(threadChannels))
                .forEach(c => {
                    const id = c?.channel?.id ?? c?.id;
                    if (!id || !ReadStateStore.hasUnread(id)) return;

                    channels.push({
                        channelId: id,
                        messageId: ReadStateStore.lastMessageId(id),
                        readStateType: 0
                    });
                });
        }
    });

    FluxDispatcher.dispatch({
        type: "BULK_ACK",
        context: "APP",
        channels
    });

    showToast(`Marked ${channels.length} channel${channels.length === 1 ? "" : "s"} as read`);
}

// ---- settings panel UI -------------------------------------------------

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#5865F2",
        alignItems: "center",
        marginTop: 8
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "600"
    },
    manageBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#2B2D31",
        alignItems: "center",
        marginTop: 10
    },
    manageBtnText: {
        color: "#00A8FC",
        fontWeight: "600"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ffffff14"
    },
    guildIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10
    },
    guildName: {
        flex: 1,
        fontSize: 15
    },
    backText: {
        color: "#00A8FC",
        fontWeight: "600",
        marginBottom: 10
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6
    },
    subtitle: {
        fontSize: 13,
        opacity: 0.6,
        marginBottom: 8
    }
});

// Screen listing every joined server with a toggle for whether Read All
// includes it. Toggle ON = included (not in the excluded list).
function ServerPicker({ onDone }) {
    const [tick, setTick] = useState(0);
    const refresh = () => setTick(n => n + 1);

    const guilds = useMemo(() => {
        const gs = GuildStore.getGuilds();
        return Object.values(gs).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    }, []);

    const excluded = getExcludedGuilds();

    return h(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 14 } },
        h(TouchableOpacity, { onPress: onDone },
            h(Text, { style: styles.backText }, "‹  Done")),
        h(Text, { style: styles.title }, "Servers"),
        h(Text, { style: styles.subtitle }, "Turn a server off to skip it when Read All runs."),
        guilds.map(g => {
            const included = excluded.indexOf(g.id) === -1;
            const iconUri = g.icon
                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${String(g.icon).indexOf("a_") === 0 ? "gif" : "png"}?size=64`
                : null;
            return h(View, { key: g.id, style: styles.row },
                iconUri
                    ? h(Image, { source: { uri: iconUri }, style: styles.guildIcon })
                    : h(View, { style: [styles.guildIcon, { backgroundColor: "#1e1f22", alignItems: "center", justifyContent: "center" }] },
                        h(Text, { style: { color: "#949ba4", fontWeight: "700" } }, (g.name || "?").charAt(0).toUpperCase())),
                h(Text, { style: styles.guildName, numberOfLines: 1 }, g.name),
                h(Switch, {
                    value: included,
                    onValueChange: () => { toggleGuild(g.id); refresh(); },
                    trackColor: { true: "#5865F2", false: "#1e1f22" }
                })
            );
        })
    );
}

function SettingsPanel() {
    const [busy, setBusy] = useState(false);
    const [managingServers, setManagingServers] = useState(false);
    const [tick, setTick] = useState(0);

    if (managingServers) {
        return h(ServerPicker, { onDone: () => { setManagingServers(false); setTick(n => n + 1); } });
    }

    const excludedCount = getExcludedGuilds().length;

    return h(View, { style: { padding: 14 } },
        h(Text, null, "Mark every unread channel as read, across every included server."),
        h(TouchableOpacity, {
            style: styles.button,
            disabled: busy,
            onPress: () => {
                setBusy(true);
                try {
                    readAll();
                } finally {
                    setBusy(false);
                }
            }
        },
            h(Text, { style: styles.buttonText }, busy ? "Reading..." : "Read All")
        ),
        h(TouchableOpacity, { style: styles.manageBtn, onPress: () => setManagingServers(true) },
            h(Text, { style: styles.manageBtnText },
                excludedCount > 0 ? `Manage servers (${excludedCount} excluded)` : "Manage servers")
        )
    );
}

// ---- plugin export -------------------------------------------------------
// Shape confirmed against your working AutoReact plugin: onLoad/onUnload/
// settings, exported via ES `export default` (not CommonJS module.exports).

const plugin = {
    onLoad() {
        // No global patch needed for the settings-panel version — nothing
        // to unpatch on unload either. If you switch to patching an action
        // sheet or a command instead, patcher unpatch functions go here.
    },
    onUnload() {},
    settings: SettingsPanel
};

export default plugin;
