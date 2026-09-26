(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // external-global-plugin:@vendetta/patcher
  var require_patcher = __commonJS({
    "external-global-plugin:@vendetta/patcher"(exports, module) {
      module.exports = vendetta.patcher;
    }
  });

  // external-global-plugin:@vendetta/metro/common
  var require_common = __commonJS({
    "external-global-plugin:@vendetta/metro/common"(exports, module) {
      module.exports = vendetta.metro.common;
    }
  });

  // external-global-plugin:@vendetta/metro
  var require_metro = __commonJS({
    "external-global-plugin:@vendetta/metro"(exports, module) {
      module.exports = vendetta.metro;
    }
  });

  // external-global-plugin:@vendetta/ui/toasts
  var require_toasts = __commonJS({
    "external-global-plugin:@vendetta/ui/toasts"(exports, module) {
      module.exports = vendetta.ui.toasts;
    }
  });

  // external-global-plugin:@vendetta/ui/assets
  var require_assets = __commonJS({
    "external-global-plugin:@vendetta/ui/assets"(exports, module) {
      module.exports = vendetta.ui.assets;
    }
  });

  // external-global-plugin:@vendetta/plugin
  var require_plugin = __commonJS({
    "external-global-plugin:@vendetta/plugin"(exports, module) {
      module.exports = vendetta.plugin;
    }
  });

  // external-global-plugin:@vendetta/ui/components
  var require_components = __commonJS({
    "external-global-plugin:@vendetta/ui/components"(exports, module) {
      module.exports = vendetta.ui.components;
    }
  });

  // src/index.ts
  var import_patcher = __toESM(require_patcher());
  var import_common3 = __toESM(require_common());

  // src/ReadButton.tsx
  var import_common2 = __toESM(require_common());
  var import_metro2 = __toESM(require_metro());
  var import_toasts2 = __toESM(require_toasts());
  var import_assets2 = __toESM(require_assets());

  // src/Settings.ts
  var import_plugin = __toESM(require_plugin());
  var import_metro = __toESM(require_metro());
  var import_common = __toESM(require_common());
  var import_components = __toESM(require_components());
  var import_toasts = __toESM(require_toasts());
  var import_assets = __toESM(require_assets());
  var DEFAULT_SETTINGS = {
    allowedServers: []
  };
  var getSettings = () => {
    return { ...DEFAULT_SETTINGS, ...import_plugin.storage };
  };
  var saveSettings = (settings) => {
    Object.assign(import_plugin.storage, settings);
  };
  var addServerToAllowlist = (serverId) => {
    const settings = getSettings();
    if (!settings.allowedServers.includes(serverId)) {
      settings.allowedServers.push(serverId);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var removeServerFromAllowlist = (serverId) => {
    const settings = getSettings();
    const index = settings.allowedServers.indexOf(serverId);
    if (index > -1) {
      settings.allowedServers.splice(index, 1);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var isServerAllowed = (serverId) => {
    const settings = getSettings();
    return settings.allowedServers.includes(serverId);
  };
  var getServerName = (serverId) => {
    try {
      const GuildStore = (0, import_metro.findByStoreName)("GuildStore");
      const guild = GuildStore?.getGuild?.(serverId);
      return guild?.name || `Unknown Server (${serverId})`;
    } catch (e) {
      return `Unknown Server (${serverId})`;
    }
  };
  var clearAllowlist = () => {
    const settings = getSettings();
    settings.allowedServers = [];
    saveSettings(settings);
  };
  var getAllowlist = () => {
    const settings = getSettings();
    return settings.allowedServers.map((id) => ({
      id,
      name: getServerName(id)
    }));
  };
  function Settings() {
    const [input, setInput] = import_common.React.useState("");
    const [allowlist, setAllowlist] = import_common.React.useState(getAllowlist());
    const refresh = () => setAllowlist(getAllowlist());
    const handleAdd = () => {
      if (input.trim()) {
        const success = addServerToAllowlist(input.trim());
        if (success) {
          (0, import_toasts.showToast)("Server added", (0, import_assets.getAssetIDByName)("ic_check"));
          setInput("");
          refresh();
        } else {
          (0, import_toasts.showToast)("Server already added", (0, import_assets.getAssetIDByName)("ic_close_16px"));
        }
      }
    };
    const handleRemove = (serverId) => {
      removeServerFromAllowlist(serverId);
      (0, import_toasts.showToast)("Server removed", (0, import_assets.getAssetIDByName)("ic_check"));
      refresh();
    };
    const handleClearAll = () => {
      clearAllowlist();
      (0, import_toasts.showToast)("Allowlist cleared", (0, import_assets.getAssetIDByName)("ic_check"));
      refresh();
    };
    return import_common.React.createElement(
      import_common.React.Fragment,
      null,
      import_common.React.createElement(
        import_components.Forms.FormSection,
        { title: "Auto-Read Servers" },
        import_common.React.createElement(
          import_components.Forms.FormText,
          { style: { marginBottom: 10 } },
          "Only servers added here get their notifications cleared when you tap the button in your server list. DMs are never touched."
        ),
        import_common.React.createElement(import_components.Forms.FormInput, {
          placeholder: "Enter server ID (e.g., 1325923169164333178)",
          value: input,
          onChange: setInput,
          onSubmitEditing: handleAdd
        }),
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Add Server",
          onPress: handleAdd
        }),
        allowlist.map(
          (server) => import_common.React.createElement(import_components.Forms.FormRow, {
            key: server.id,
            label: server.name,
            subLabel: server.id,
            trailing: import_common.React.createElement(import_components.Forms.FormRow, {
              label: "Remove",
              style: { color: "#ff4757" },
              onPress: () => handleRemove(server.id)
            })
          })
        )
      ),
      import_common.React.createElement(
        import_components.Forms.FormSection,
        { title: "Actions" },
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Clear Allowlist",
          onPress: handleClearAll
        })
      )
    );
  }

  // src/ReadButton.tsx
  var { View, Pressable, StyleSheet, Image } = import_common2.ReactNative;
  var Haptic = (0, import_metro2.findByProps)("triggerHapticFeedback", "HapticFeedbackTypes");
  var TILE = 48;
  var MARGIN = 4;
  var getStores = () => ({
    GuildStore: (0, import_metro2.findByStoreName)("GuildStore"),
    GuildChannelStore: (0, import_metro2.findByStoreName)("GuildChannelStore") || (0, import_metro2.findByStoreName)("ChannelStore"),
    ChannelStore: (0, import_metro2.findByStoreName)("ChannelStore"),
    ReadStateStore: (0, import_metro2.findByStoreName)("ReadStateStore"),
    FluxDispatcher: (0, import_metro2.findByProps)("dispatch", "subscribe") || (0, import_metro2.findByStoreName)("Dispatcher")
  });
  var getUnreadServerChannels = () => {
    const { GuildStore, GuildChannelStore, ChannelStore, ReadStateStore } = getStores();
    if (!GuildStore || !ReadStateStore) return [];
    const channels = [];
    const guilds = GuildStore.getGuilds();
    Object.values(guilds).forEach((guild) => {
      if (!guild?.id || !isServerAllowed(guild.id)) return;
      try {
        let guildChannels = [];
        const channelStore = GuildChannelStore || ChannelStore;
        if (channelStore?.getChannels) {
          const channelData = channelStore.getChannels(guild.id);
          if (channelData?.SELECTABLE) guildChannels = guildChannels.concat(channelData.SELECTABLE);
          if (channelData?.VOCAL) guildChannels = guildChannels.concat(channelData.VOCAL);
        } else if (channelStore?.getMutableGuildChannelsForGuild) {
          guildChannels = Object.values(channelStore.getMutableGuildChannelsForGuild(guild.id) ?? {});
        }
        guildChannels.forEach((c) => {
          const channel = c?.channel || c;
          if (!channel?.id) return;
          if (ReadStateStore.hasUnread?.(channel.id)) {
            channels.push({
              channelId: channel.id,
              messageId: ReadStateStore.lastMessageId?.(channel.id) || null,
              readStateType: 0
            });
          }
        });
      } catch {
      }
    });
    return channels;
  };
  var executeClear = () => {
    const { FluxDispatcher } = getStores();
    const targetChannels = getUnreadServerChannels();
    if (targetChannels.length === 0) {
      (0, import_toasts2.showToast)("No unread notifications!", (0, import_assets2.getAssetIDByName)("Small"));
      return;
    }
    FluxDispatcher.dispatch({
      type: "BULK_ACK",
      context: "APP",
      channels: targetChannels
    });
    (0, import_toasts2.showToast)(`Cleared ${targetChannels.length} channel${targetChannels.length === 1 ? "" : "s"}!`, (0, import_assets2.getAssetIDByName)("Check"));
  };
  function ReadButton() {
    const handlePress = () => {
      Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
      executeClear();
    };
    return /* @__PURE__ */ import_common2.React.createElement(View, { style: st.row }, /* @__PURE__ */ import_common2.React.createElement(Pressable, { onPress: handlePress, accessibilityRole: "button", accessibilityLabel: "Read All (allowed servers)" }, /* @__PURE__ */ import_common2.React.createElement(View, { style: st.tile }, /* @__PURE__ */ import_common2.React.createElement(View, { style: st.circleBg }, /* @__PURE__ */ import_common2.React.createElement(
      Image,
      {
        source: (0, import_assets2.getAssetIDByName)("ic_eye"),
        style: { width: 24, height: 24, tintColor: "#DBDEE1" }
      }
    )))));
  }
  var st = StyleSheet.create({
    row: {
      alignSelf: "stretch",
      alignItems: "center",
      paddingTop: MARGIN,
      paddingBottom: MARGIN
    },
    tile: {
      width: TILE,
      height: TILE,
      borderRadius: 16,
      backgroundColor: "#111214",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    },
    circleBg: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#2B2D31",
      alignItems: "center",
      justifyContent: "center"
    }
  });

  // src/index.ts
  var { View: View2 } = import_common3.ReactNative;
  var TAG = "[ReadAll]";
  var TILE2 = 48;
  var MARGIN2 = 4;
  var unpatchers = [];
  var patchedObjects = /* @__PURE__ */ new WeakSet();
  var retryTimer;
  function isUseGuildsBarProps(exports) {
    return typeof exports?.default === "function" && exports.default.name === "useGuildsBarProps";
  }
  function patchFooter(ret) {
    const ldp = ret?.listDataProps;
    if (!ldp || patchedObjects.has(ldp)) return;
    if (typeof ldp.footerSize !== "function" || typeof ldp.renderFooter !== "function") return;
    const origFooterSize = ldp.footerSize;
    const origRenderFooter = ldp.renderFooter;
    const extra = TILE2 + 2 * MARGIN2;
    ldp.footerSize = () => origFooterSize.call(ldp) + extra;
    ldp.renderFooter = () => import_common3.React.createElement(
      View2,
      { style: { alignSelf: "stretch" }, collapsable: false },
      origRenderFooter.call(ldp),
      import_common3.React.createElement(ReadButton)
    );
    patchedObjects.add(ldp);
  }
  function scanRegistry() {
    const modules = globalThis?.modules;
    if (!modules) return 0;
    let patchedCount = 0;
    for (const id in modules) {
      const def = modules[id];
      if (!def?.isInitialized) continue;
      const exports = def.publicModule?.exports;
      if (!exports) continue;
      if (isUseGuildsBarProps(exports)) {
        try {
          unpatchers.push(
            (0, import_patcher.after)("default", exports, (_args, ret) => patchFooter(ret))
          );
          patchedCount++;
        } catch (e) {
          console.log(TAG, `Failed to patch module ${id}:`, e);
        }
      }
    }
    return patchedCount;
  }
  var src_default = {
    onLoad() {
      const count = scanRegistry();
      if (count === 0) {
        let ticks = 0;
        retryTimer = setInterval(() => {
          ticks++;
          const n = scanRegistry();
          if (n > 0 || ticks >= 30) {
            if (retryTimer) clearInterval(retryTimer);
            retryTimer = void 0;
          }
        }, 1e3);
      }
    },
    onUnload() {
      if (retryTimer) clearInterval(retryTimer);
      retryTimer = void 0;
      unpatchers.forEach((u) => u());
      unpatchers = [];
    },
    settings: Settings
  };
})();
