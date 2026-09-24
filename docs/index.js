/*
 * ReadAll — Kettu plugin
 * Rebuilt from a user-provided reference implementation, adapted to this
 * Kettu build's window.vendetta runtime.
 *
 * SCOPE: server notifications only. DMs are never touched by design.
 *
 * NOTES:
 * - Settings screen title -> "Configure"
 * - "Auto-Read Servers" is an ALLOWLIST: only servers added to this list
 *   get their notifications cleared. Servers not in the list are left
 *   untouched (not the other way around).
 * - @vendetta/* imports + Forms components -> window.vendetta lookups +
 *   plain RN primitives, matching what's confirmed to work on this device
 * - Wrapped in an IIFE returning module.exports, NOT `export default` —
 *   confirmed via /eval that this loader executes plugin code as a plain
 *   script (SyntaxError: 'export' statement requires module mode)
 * - Slash command (`/read`) is registered defensively in a try/catch;
 *   vd.commands.registerCommand's exact signature hasn't been separately
 *   verified on this build. If registration fails, the settings-screen
 *   button still works regardless.
 */

(function () {
    var module = { exports: {} };

    const vd = window.vendetta;
    const { findByProps, findByStoreName } = vd.metro;
    const React = findByProps("createElement", "useState");
    const RN = findByProps("View", "Text", "StyleSheet");
    const { createElement: h, useState } = React;
    const { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } = RN;
    const { showToast } = vd.ui.toasts;

    // ---- storage: allowlist of guild IDs to auto-read (MMKV, same pattern
    // as your AutoReact plugin's blacklist, just inverted semantics) ----
    const { createStorage, wrapSync, createMMKVBackend } = vd.storage;
    const storage = wrapSync(createStorage(createMMKVBackend("ReadAllConfigure")));
    function getBlacklist() {
        if (!storage["allowlist"]) storage["allowlist"] = [];
        return storage["allowlist"];
    }

    // ---- module resolution — confirmed on-device via /eval ----
    const GuildStore = findByStoreName("GuildStore");
    const ChannelStore = findByStoreName("ChannelStore");
    const ReadStateStore = findByStoreName("ReadStateStore");
    const FluxDispatcher = findByProps("dispatch", "subscribe");
    const ThreadStore = findByProps("getActiveJoinedThreadsForGuild");

    let lastUsed = 0;
    const COOLDOWN_MS = 60000; // matches the reference implementation's rate-limit guard

    // Renamed for clarity: this is now an ALLOWLIST. getBlacklist() is kept
    // as the storage key name to avoid a migration, but its meaning here is
    // inverted — only guilds IN this list get auto-read.
    function getServerChannels() {
        const allowlist = getBlacklist();
        const channels = [];

        Object.values(GuildStore.getGuilds()).forEach(guild => {
            if (allowlist.indexOf(guild.id) === -1) return;

            const guildChannels = ChannelStore.getMutableGuildChannelsForGuild(guild.id) ?? {};
            Object.values(guildChannels).forEach(channel => {
                if (!channel?.id || !ReadStateStore.hasUnread(channel.id)) return;
                channels.push({
                    channelId: channel.id,
                    messageId: ReadStateStore.lastMessageId(channel.id),
                    readStateType: 0
                });
            });

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

        return channels;
    }

    function bulkAck() {
        if (!GuildStore || !ChannelStore || !ReadStateStore || !FluxDispatcher) {
            showToast("ReadAll: required modules missing, check console");
            console.error("[ReadAll] missing modules", {
                GuildStore: !!GuildStore, ChannelStore: !!ChannelStore,
                ReadStateStore: !!ReadStateStore, FluxDispatcher: !!FluxDispatcher
            });
            return;
        }

        const channels = getServerChannels();

        if (!channels.length) {
            showToast("No unread notifications found");
            return;
        }

        FluxDispatcher.dispatch({ type: "BULK_ACK", context: "APP", channels });
        showToast(`Cleared ${channels.length} unread notification${channels.length === 1 ? "" : "s"}`);
    }

    function cooldownGuard(fn) {
        return () => {
            const now = Date.now();
            if (now - lastUsed < COOLDOWN_MS) {
                const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
                showToast(`Please wait ${remaining}s before using again`);
                return;
            }
            lastUsed = now;
            fn();
        };
    }

    const readAll = cooldownGuard(() => bulkAck());

    // ---- slash command (best effort) ----
    let unregisterFns = [];
    function registerCommands() {
        try {
            if (!vd.commands?.registerCommand) return;
            unregisterFns.push(vd.commands.registerCommand({
                name: "read", description: "Clear all unread server notifications", applicationId: "-1",
                execute: () => readAll()
            }));
        } catch (e) {
            console.warn("[ReadAll] command registration failed:", e);
        }
    }
    function unregisterCommands() {
        unregisterFns.forEach(fn => { try { fn && fn(); } catch (e) { /* ignore */ } });
        unregisterFns = [];
    }

    // ---- Configure screen ----
    const styles = StyleSheet.create({
        heading: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#fff" },
        subHeading: { fontSize: 14, fontWeight: "700", marginTop: 4, marginBottom: 8, color: "#fff" },
        sub: { fontSize: 13, opacity: 0.6, marginBottom: 10, color: "#dbdee1" },
        section: { marginTop: 16 },
        row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
        input: { flex: 1, borderWidth: 1, borderColor: "#3f4147", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: "#fff", marginRight: 8 },
        addBtn: { backgroundColor: "#5865F2", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center" },
        addBtnTxt: { color: "#fff", fontWeight: "700" },
        chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#2b2d31", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6 },
        chipTxt: { flex: 1, color: "#dbdee1" },
        chipX: { color: "#f23f43", fontWeight: "700", marginLeft: 8 },
        primary: { backgroundColor: "#5865F2", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 14 },
        primaryAlt: { backgroundColor: "#2b2d31", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
        primaryTxt: { color: "#fff", fontWeight: "700" },
        primaryAltTxt: { color: "#dbdee1", fontWeight: "700" },
        clearBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 4, borderWidth: 1, borderColor: "#f23f43" },
        clearTxt: { color: "#f23f43", fontWeight: "700" }
    });

    function guildName(id) {
        try { return GuildStore?.getGuild?.(id)?.name || id; } catch (e) { return id; }
    }

    function Configure() {
        const [, setTick] = useState(0);
        const refresh = () => setTick(n => n + 1);
        const [input, setInput] = useState("");

        function addToBlacklist() {
            const id = input.trim();
            if (!id) return;
            const bl = getBlacklist();
            if (bl.indexOf(id) === -1) bl.push(id);
            setInput("");
            refresh();
        }
        function removeFromBlacklist(id) {
            const bl = getBlacklist();
            const idx = bl.indexOf(id);
            if (idx !== -1) bl.splice(idx, 1);
            refresh();
        }
        function clearBlacklist() {
            getBlacklist().length = 0;
            refresh();
        }

        const bl = getBlacklist();

        return h(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 14, paddingBottom: 48 } },
            h(Text, { style: styles.heading }, "Configure"),
            h(Text, { style: styles.sub }, "Marks unread channels as read, but only in servers you add below. Everything else is left alone. DMs are never touched."),

            h(View, { style: styles.section },
                h(Text, { style: styles.subHeading }, "Auto-Read Servers"),
                h(View, { style: styles.row },
                    h(TextInput, {
                        style: styles.input, value: input, onChangeText: setInput,
                        placeholder: "Server ID", placeholderTextColor: "#87898c", keyboardType: "numeric"
                    }),
                    h(TouchableOpacity, { style: styles.addBtn, onPress: addToBlacklist },
                        h(Text, { style: styles.addBtnTxt }, "Add"))
                ),
                bl.length
                    ? bl.map(id => h(View, { key: id, style: styles.chip },
                        h(Text, { style: styles.chipTxt }, guildName(id) + " (" + id + ")"),
                        h(TouchableOpacity, { onPress: () => removeFromBlacklist(id) },
                            h(Text, { style: styles.chipX }, "\u2715"))
                    ))
                    : h(Text, { style: [styles.sub, { fontStyle: "italic" }] }, "No servers added yet — Read All will do nothing until you add at least one."),
                bl.length
                    ? h(TouchableOpacity, { style: styles.clearBtn, onPress: clearBlacklist },
                        h(Text, { style: styles.clearTxt }, "Remove all"))
                    : null
            ),

            h(TouchableOpacity, { style: styles.primary, onPress: readAll },
                h(Text, { style: styles.primaryTxt }, "Read All"))
        );
    }

    const plugin = {
        onLoad() {
            registerCommands();
        },
        onUnload() {
            unregisterCommands();
        },
        settings: Configure
    };

    module.exports = plugin;
    return module.exports;
})();
