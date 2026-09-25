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

  // external-global-plugin:@vendetta/commands
  var require_commands = __commonJS({
    "external-global-plugin:@vendetta/commands"(exports, module) {
      module.exports = vendetta.commands;
    }
  });

  // external-global-plugin:@vendetta/plugin
  var require_plugin = __commonJS({
    "external-global-plugin:@vendetta/plugin"(exports, module) {
      module.exports = vendetta.plugin;
    }
  });

  // external-global-plugin:@vendetta/metro/common
  var require_common = __commonJS({
    "external-global-plugin:@vendetta/metro/common"(exports, module) {
      module.exports = vendetta.metro.common;
    }
  });

  // external-global-plugin:@vendetta/ui/components
  var require_components = __commonJS({
    "external-global-plugin:@vendetta/ui/components"(exports, module) {
      module.exports = vendetta.ui.components;
    }
  });

  // src/index.ts
  var import_metro2 = __toESM(require_metro());
  var import_toasts = __toESM(require_toasts());
  var import_assets = __toESM(require_assets());
  var import_commands = __toESM(require_commands());

  // src/Allowlist.ts
  var import_plugin = __toESM(require_plugin());
  var import_metro = __toESM(require_metro());
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
      const GuildStore2 = (0, import_metro.findByStoreName)("GuildStore");
      const guild = GuildStore2?.getGuild?.(serverId);
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

  // src/index.ts
  var import_common = __toESM(require_common());
  var import_components = __toESM(require_components());
  var GuildStore;
  var GuildChannelStore;
  var ActiveJoinedThreadsStore;
  var ReadStateStore;
  var FluxDispatcher;
  var ChannelStore;
  var readCommandUnregister = null;
  var lastUsed = 0;
  var COOLDOWN_MS = 6e4;
  var initModules = () => {
    GuildStore = (0, import_metro2.findByStoreName)("GuildStore");
    GuildChannelStore = (0, import_metro2.findByStoreName)("GuildChannelStore") || (0, import_metro2.findByStoreName)("ChannelStore");
    ChannelStore = (0, import_metro2.findByStoreName)("ChannelStore");
    ReadStateStore = (0, import_metro2.findByStoreName)("ReadStateStore");
    ActiveJoinedThreadsStore = (0, import_metro2.findByStoreName)("ActiveJoinedThreadsStore") || (0, import_metro2.findByProps)("getActiveJoinedThreadsForGuild");
    FluxDispatcher = (0, import_metro2.findByProps)("dispatch", "subscribe") || (0, import_metro2.findByStoreName)("Dispatcher");
  };
  var getServerChannels = () => {
    if (!GuildStore || !ReadStateStore) return [];
    const channels = [];
    const guilds = GuildStore.getGuilds();
    Object.values(guilds).forEach((guild) => {
      if (!guild?.id) return;
      if (!isServerAllowed(guild.id)) return;
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
        if (ActiveJoinedThreadsStore?.getActiveJoinedThreadsForGuild) {
          try {
            const threads = ActiveJoinedThreadsStore.getActiveJoinedThreadsForGuild(guild.id);
            const threadChannels = Object.values(threads).flatMap((threadGroup) => Object.values(threadGroup || {}));
            guildChannels = guildChannels.concat(threadChannels);
          } catch (e) {
          }
        }
        guildChannels.forEach((c) => {
          const channel = c?.channel || c;
          if (!channel?.id) return;
          try {
            if (ReadStateStore.hasUnread && ReadStateStore.hasUnread(channel.id)) {
              channels.push({
                channelId: channel.id,
                messageId: ReadStateStore.lastMessageId?.(channel.id) || null,
                readStateType: 0
              });
            }
          } catch (e) {
          }
        });
      } catch (e) {
      }
    });
    return channels;
  };
  var bulkAckNotifications = () => {
    if (!GuildStore || !ReadStateStore || !FluxDispatcher) return false;
    const channels = getServerChannels();
    if (channels.length === 0) {
      (0, import_toasts.showToast)("No unread notifications found!", (0, import_assets.getAssetIDByName)("ic_message_edit"));
      return true;
    }
    FluxDispatcher.dispatch({
      type: "BULK_ACK",
      context: "APP",
      channels
    });
    (0, import_toasts.showToast)(`Cleared ${channels.length} unread notification${channels.length === 1 ? "" : "s"}!`, (0, import_assets.getAssetIDByName)("ic_message_edit"));
    return true;
  };
  var readAllNotifications = () => {
    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    if (timeSinceLastUse < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastUse) / 1e3);
      (0, import_toasts.showToast)(`Please wait ${remainingSeconds}s before using again`, (0, import_assets.getAssetIDByName)("ic_close_16px"));
      return;
    }
    lastUsed = now;
    bulkAckNotifications();
  };
  var Configure = () => {
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
          "Only servers added here get their notifications cleared by Read All. DMs are never touched."
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
          label: "Read All Now",
          onPress: readAllNotifications
        }),
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Clear Allowlist",
          onPress: handleClearAll
        })
      )
    );
  };
  var src_default = {
    onLoad: () => {
      initModules();
      try {
        readCommandUnregister = (0, import_commands.registerCommand)({
          name: "read",
          description: "Clear unread notifications in your allowed servers",
          applicationId: "-1",
          execute: () => {
            readAllNotifications();
            return;
          }
        });
      } catch (e) {
      }
    },
    onUnload: () => {
      if (readCommandUnregister) {
        try {
          readCommandUnregister();
          readCommandUnregister = null;
        } catch (e) {
        }
      }
    },
    settings: Configure
  };
})();
