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
 * - Wrapped in an IIFE, NOT `export default` at the top level — confirmed
 *   via /eval that this loader executes plugin code as a plain script
 *   (SyntaxError: 'export' statement requires module mode).
 * - ESM interop shape: exports `.default` + `__esModule`, NOT the plugin
 *   object directly. Confirmed by inspecting a working reference plugin's
 *   compiled (esbuild) output — its `export default {...}` compiles to
 *   exactly this shape, and the loader appears to read `result.default`,
 *   not `result` itself. Returning the plugin object at the top level
 *   (plain CommonJS) meant onLoad/settings were never actually picked up
 *   by the loader, even though the plugin "started" with no error.
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

    // ---- debug log capture ----
    // Since the gear tap fails with no visible error, capture whatever
    // happens at the JS level (console.error + RN's uncaught-error path)
    // during this session, so it can be pulled out via a command without
    // needing the (currently unreachable) settings screen.
    const debugLog = [];
    function pushLog(entry) {
        debugLog.push(`[${new Date().toISOString()}] ${entry}`);
        if (debugLog.length > 200) debugLog.shift();
    }

    let consoleErrorUnpatch = null;
    let consoleWarnUnpatch = null;
    let prevGlobalHandler = null;
    const ErrorUtils = findByProps("setGlobalHandler", "getGlobalHandler");

    function installDebugHooks() {
        try {
            const { before } = vd.patcher;
            consoleErrorUnpatch = before("error", console, args => {
                try { pushLog("console.error: " + args.map(a => { try { return typeof a === "string" ? a : JSON.stringify(a); } catch (e) { return String(a); } }).join(" ")); } catch (e) { /* ignore */ }
            });
            consoleWarnUnpatch = before("warn", console, args => {
                try { pushLog("console.warn: " + args.map(a => { try { return typeof a === "string" ? a : JSON.stringify(a); } catch (e) { return String(a); } }).join(" ")); } catch (e) { /* ignore */ }
            });
        } catch (e) {
            pushLog("Failed to hook console: " + (e?.message ?? String(e)));
        }

        try {
            if (ErrorUtils?.getGlobalHandler && ErrorUtils?.setGlobalHandler) {
                prevGlobalHandler = ErrorUtils.getGlobalHandler();
                ErrorUtils.setGlobalHandler((error, isFatal) => {
                    try { pushLog(`GLOBAL ERROR (fatal=${isFatal}): ${error?.message ?? String(error)} | ${error?.stack ?? "no stack"}`); } catch (e) { /* ignore */ }
                    if (prevGlobalHandler) prevGlobalHandler(error, isFatal);
                });
            }
        } catch (e) {
            pushLog("Failed to hook ErrorUtils: " + (e?.message ?? String(e)));
        }
    }

    function removeDebugHooks() {
        try { consoleErrorUnpatch && consoleErrorUnpatch(); } catch (e) { /* ignore */ }
        try { consoleWarnUnpatch && consoleWarnUnpatch(); } catch (e) { /* ignore */ }
        try { if (prevGlobalHandler && ErrorUtils?.setGlobalHandler) ErrorUtils.setGlobalHandler(prevGlobalHandler); } catch (e) { /* ignore */ }
    }

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
    // as the function name to avoid churn, but its meaning here is
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

    // ---- slash commands (best effort) ----
    let unregisterFns = [];
    function registerCommands() {
        try {
            if (!vd.commands?.registerCommand) return;
            unregisterFns.push(vd.commands.registerCommand({
                name: "read", description: "Clear all unread server notifications", applicationId: "-1",
                execute: () => readAll()
            }));
            unregisterFns.push(vd.commands.registerCommand({
                name: "read debug", description: "Copy plugin debug info to clipboard", applicationId: "-1",
                execute: () => copyDebugInfo()
            }));
        } catch (e) {
            console.warn("[ReadAll] command registration failed:", e);
        }
    }
    function unregisterCommands() {
        unregisterFns.forEach(fn => { try { fn && fn(); } catch (e) { /* ignore */ } });
        unregisterFns = [];
    }

    function copyDebugInfo() {
        try {
            const rec = window.vendetta.plugins.plugins["https://prueba74848-wq.github.io/readallkettu/"];
            let shapeInfo = "could not re-eval";
            try {
                const result = (0, eval)(rec.js);
                shapeInfo = `typeof result=${typeof result}, has .default=${!!result?.default}, typeof .default.settings=${typeof result?.default?.settings}, typeof .settings=${typeof result?.settings}`;
            } catch (e) {
                shapeInfo = "re-eval threw: " + (e?.message ?? String(e));
            }

            const report = [
                "=== ReadAll Debug Report ===",
                "Plugin record keys: " + Object.keys(rec).join(", "),
                "enabled: " + rec.enabled,
                "manifest: " + JSON.stringify(rec.manifest),
                "shape check: " + shapeInfo,
                "getSettings(id): " + typeof window.vendetta.plugins.getSettings?.("https://prueba74848-wq.github.io/readallkettu/"),
                "",
                "=== Captured log (" + debugLog.length + " entries) ===",
                ...debugLog
            ].join("\n");

            const Clipboard = findByProps("setString", "getString");
            if (Clipboard?.setString) {
                Clipboard.setString(report);
                showToast("Debug info copied to clipboard");
            } else {
                console.error("[ReadAll] Clipboard module not found. Report:\n" + report);
                showToast("Clipboard not found — check console/logcat instead");
            }
        } catch (e) {
            showToast("Debug copy failed: " + (e?.message ?? String(e)));
        }
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
        primaryTxt: { color: "#fff", fontWeight: "700" },
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
                    : h(Text, { style: [styles.sub, { fontStyle: "italic" }] }, "No servers added yet \u2014 Read All will do nothing until you add at least one."),
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
            installDebugHooks();
            registerCommands();
        },
        onUnload() {
            unregisterCommands();
            removeDebugHooks();
        },
        settings: Configure
    };

    // ESM interop shape — matches esbuild's compiled `export default {...}`
    // output exactly (confirmed by inspecting the working apexteampl "Read
    // All" plugin's bundled code). Returning the plugin object directly at
    // the top level (plain CommonJS) is very likely why settings/onLoad
    // never got picked up: the loader appears to read `result.default`,
    // not `result` itself.
    module.exports.default = plugin;
    Object.defineProperty(module.exports, "__esModule", { value: true });

    return module.exports;
})();
