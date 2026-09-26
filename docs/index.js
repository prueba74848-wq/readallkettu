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

  // src/Settings.ts
  var import_plugin = __toESM(require_plugin());
  var import_metro = __toESM(require_metro());
  var DEFAULT_SETTINGS = {
    excludedServers: [],
    excludedDMs: []
  };
  var getSettings = () => {
    return { ...DEFAULT_SETTINGS, ...import_plugin.storage };
  };
  var saveSettings = (settings) => {
    Object.assign(import_plugin.storage, settings);
  };
  var addServerException = (serverId) => {
    const settings = getSettings();
    if (!settings.excludedServers.includes(serverId)) {
      settings.excludedServers.push(serverId);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var removeServerException = (serverId) => {
    const settings = getSettings();
    const index = settings.excludedServers.indexOf(serverId);
    if (index > -1) {
      settings.excludedServers.splice(index, 1);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var addDMException = (channelId) => {
    const settings = getSettings();
    if (!settings.excludedDMs.includes(channelId)) {
      settings.excludedDMs.push(channelId);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var removeDMException = (channelId) => {
    const settings = getSettings();
    const index = settings.excludedDMs.indexOf(channelId);
    if (index > -1) {
      settings.excludedDMs.splice(index, 1);
      saveSettings(settings);
      return true;
    }
    return false;
  };
  var isServerExcluded = (serverId) => {
    const settings = getSettings();
    return settings.excludedServers.includes(serverId);
  };
  var isDMExcluded = (channelId) => {
    const settings = getSettings();
    return settings.excludedDMs.includes(channelId);
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
  var getDMName = (channelId) => {
    try {
      const ChannelStore2 = (0, import_metro.findByStoreName)("ChannelStore");
      const channel = ChannelStore2?.getChannel?.(channelId);
      if (channel) {
        if (channel.name) {
          return channel.name;
        } else if (channel.recipients && channel.recipients.length > 0) {
          const UserStore = (0, import_metro.findByStoreName)("UserStore");
          const user = UserStore?.getUser?.(channel.recipients[0]);
          return user?.username ? `@${user.username}` : `Unknown User (${channelId})`;
        }
      }
      return `Unknown DM (${channelId})`;
    } catch (e) {
      return `Unknown DM (${channelId})`;
    }
  };
  var clearAllExceptions = () => {
    const settings = getSettings();
    settings.excludedServers = [];
    settings.excludedDMs = [];
    saveSettings(settings);
  };
  var getAllExceptions = () => {
    const settings = getSettings();
    return {
      servers: settings.excludedServers.map((id) => ({
        id,
        name: getServerName(id)
      })),
      dms: settings.excludedDMs.map((id) => ({
        id,
        name: getDMName(id)
      }))
    };
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
  var readAllCommandUnregister = null;
  var readServerCommandUnregister = null;
  var readDMCommandUnregister = null;
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
  var getDMChannels = () => {
    const dmChannels = [];
    const channelStore = ChannelStore || GuildChannelStore;
    if (!channelStore) return dmChannels;
    if (channelStore.getPrivateChannels) {
      try {
        const privateChannels = channelStore.getPrivateChannels();
        if (privateChannels && typeof privateChannels === "object") {
          Object.values(privateChannels).forEach((channel) => {
            if (channel && channel.id) dmChannels.push(channel);
          });
        }
      } catch (e) {
      }
    }
    if (dmChannels.length === 0 && channelStore.getSortedPrivateChannels) {
      try {
        const sortedPrivateChannels = channelStore.getSortedPrivateChannels();
        if (Array.isArray(sortedPrivateChannels)) {
          sortedPrivateChannels.forEach((channel) => {
            if (channel && channel.id) dmChannels.push(channel);
          });
        }
      } catch (e) {
      }
    }
    if (dmChannels.length === 0 && channelStore.getChannels) {
      try {
        const meChannels = channelStore.getChannels("@me");
        if (meChannels && meChannels.SELECTABLE) {
          meChannels.SELECTABLE.forEach((c) => {
            const channel = c.channel || c;
            if (channel && channel.id) dmChannels.push(channel);
          });
        }
      } catch (e) {
      }
    }
    if (dmChannels.length === 0 && channelStore.getChannel && ReadStateStore?.getAllReadStates) {
      try {
        const allReadStates = ReadStateStore.getAllReadStates();
        Object.keys(allReadStates).forEach((channelId) => {
          try {
            const channel = channelStore.getChannel(channelId);
            if (channel) {
              const isDM = channel.type === 1 || channel.type === 3 || !channel.guild_id && !channel.guildId;
              if (isDM) dmChannels.push(channel);
            }
          } catch (e) {
          }
        });
      } catch (e) {
      }
    }
    return dmChannels;
  };
  var getServerChannels = () => {
    if (!GuildStore || !ReadStateStore) return [];
    const channels = [];
    const guilds = GuildStore.getGuilds();
    Object.values(guilds).forEach((guild) => {
      if (!guild?.id) return;
      try {
        let guildChannels = [];
        const channelStore = GuildChannelStore || ChannelStore;
        if (channelStore?.getChannels) {
          const channelData = channelStore.getChannels(guild.id);
          if (channelData?.SELECTABLE) guildChannels = guildChannels.concat(channelData.SELECTABLE);
          if (channelData?.VOCAL) guildChannels = guildChannels.concat(channelData.VOCAL);
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
          if (isServerExcluded(guild.id)) return;
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
  var getDMUnreadChannels = () => {
    const channels = [];
    const dmChannels = getDMChannels();
    dmChannels.forEach((channel) => {
      if (!channel?.id) return;
      if (isDMExcluded(channel.id)) return;
      try {
        let hasUnread = false;
        if (ReadStateStore.hasUnread) {
          hasUnread = ReadStateStore.hasUnread(channel.id);
        }
        if (!hasUnread && ReadStateStore.getAllReadStates) {
          const allReadStates = ReadStateStore.getAllReadStates();
          const readState = allReadStates[channel.id];
          if (readState) {
            hasUnread = readState.mentionCount && readState.mentionCount > 0 || readState._unreadCount && readState._unreadCount > 0 || readState.unreadCount && readState.unreadCount > 0;
          }
        }
        if (hasUnread) {
          channels.push({
            channelId: channel.id,
            messageId: ReadStateStore.lastMessageId?.(channel.id) || null,
            readStateType: 0
          });
        }
      } catch (e) {
      }
    });
    return channels;
  };
  var bulkAckNotifications = (type = "all") => {
    if (!GuildStore || !ReadStateStore || !FluxDispatcher) return false;
    let channels = [];
    let typeLabel = "";
    switch (type) {
      case "server":
        channels = getServerChannels();
        typeLabel = "server";
        break;
      case "dm":
        channels = getDMUnreadChannels();
        typeLabel = "DM";
        break;
      case "all":
      default:
        channels = [...getServerChannels(), ...getDMUnreadChannels()];
        typeLabel = "";
        break;
    }
    if (channels.length === 0) {
      const message2 = type === "all" ? "No unread notifications found!" : `No unread ${typeLabel} notifications found!`;
      (0, import_toasts.showToast)(message2, (0, import_assets.getAssetIDByName)("ic_message_edit"));
      return true;
    }
    FluxDispatcher.dispatch({
      type: "BULK_ACK",
      context: "APP",
      channels
    });
    const message = type === "all" ? `Cleared ${channels.length} unread notifications!` : `Cleared ${channels.length} unread ${typeLabel} notifications!`;
    (0, import_toasts.showToast)(message, (0, import_assets.getAssetIDByName)("ic_message_edit"));
    return true;
  };
  var readMainNotifications = () => {
    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    if (timeSinceLastUse < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastUse) / 1e3);
      (0, import_toasts.showToast)(`Please wait ${remainingSeconds}s before using again`, (0, import_assets.getAssetIDByName)("ic_close_16px"));
      return;
    }
    lastUsed = now;
    bulkAckNotifications("all");
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
    bulkAckNotifications("server");
  };
  var readServerNotifications = () => {
    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    if (timeSinceLastUse < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastUse) / 1e3);
      (0, import_toasts.showToast)(`Please wait ${remainingSeconds}s before using again`, (0, import_assets.getAssetIDByName)("ic_close_16px"));
      return;
    }
    lastUsed = now;
    bulkAckNotifications("server");
  };
  var readDMNotifications = () => {
    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    if (timeSinceLastUse < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastUse) / 1e3);
      (0, import_toasts.showToast)(`Please wait ${remainingSeconds}s before using again`, (0, import_assets.getAssetIDByName)("ic_close_16px"));
      return;
    }
    lastUsed = now;
    bulkAckNotifications("dm");
  };
  var SettingsComponent = () => {
    const [serverInput, setServerInput] = import_common.React.useState("");
    const [dmInput, setDMInput] = import_common.React.useState("");
    const [exceptions, setExceptions] = import_common.React.useState(getAllExceptions());
    const refreshExceptions = () => {
      setExceptions(getAllExceptions());
    };
    const handleAddServer = () => {
      if (serverInput.trim()) {
        const success = addServerException(serverInput.trim());
        if (success) {
          (0, import_toasts.showToast)(`Added server to exceptions`, (0, import_assets.getAssetIDByName)("ic_check"));
          setServerInput("");
          refreshExceptions();
        } else {
          (0, import_toasts.showToast)("Server already in exceptions", (0, import_assets.getAssetIDByName)("ic_close_16px"));
        }
      }
    };
    const handleAddDM = () => {
      if (dmInput.trim()) {
        const success = addDMException(dmInput.trim());
        if (success) {
          (0, import_toasts.showToast)(`Added DM to exceptions`, (0, import_assets.getAssetIDByName)("ic_check"));
          setDMInput("");
          refreshExceptions();
        } else {
          (0, import_toasts.showToast)("DM already in exceptions", (0, import_assets.getAssetIDByName)("ic_close_16px"));
        }
      }
    };
    const handleRemoveServer = (serverId) => {
      removeServerException(serverId);
      (0, import_toasts.showToast)("Server removed from exceptions", (0, import_assets.getAssetIDByName)("ic_check"));
      refreshExceptions();
    };
    const handleRemoveDM = (channelId) => {
      removeDMException(channelId);
      (0, import_toasts.showToast)("DM removed from exceptions", (0, import_assets.getAssetIDByName)("ic_check"));
      refreshExceptions();
    };
    const handleClearAll = () => {
      clearAllExceptions();
      (0, import_toasts.showToast)("All exceptions cleared", (0, import_assets.getAssetIDByName)("ic_check"));
      refreshExceptions();
    };
    return import_common.React.createElement(
      import_common.React.Fragment,
      null,
      import_common.React.createElement(
        import_components.Forms.FormSection,
        { title: "Server Exceptions" },
        import_common.React.createElement(
          import_components.Forms.FormText,
          { style: { marginBottom: 10 } },
          "Add server IDs to exclude from notification clearing:"
        ),
        import_common.React.createElement(import_components.Forms.FormInput, {
          placeholder: "Enter server ID (e.g., 1325923169164333178)",
          value: serverInput,
          onChange: setServerInput,
          onSubmitEditing: handleAddServer
        }),
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Add Server",
          onPress: handleAddServer
        }),
        exceptions.servers.map(
          (server, index) => import_common.React.createElement(import_components.Forms.FormRow, {
            key: server.id,
            label: server.name,
            subLabel: server.id,
            trailing: import_common.React.createElement(import_components.Forms.FormRow, {
              label: "Remove",
              style: { color: "#ff4757" },
              onPress: () => handleRemoveServer(server.id)
            })
          })
        )
      ),
      import_common.React.createElement(
        import_components.Forms.FormSection,
        { title: "DM Exceptions" },
        import_common.React.createElement(
          import_components.Forms.FormText,
          { style: { marginBottom: 10 } },
          "Add channel IDs to exclude from notification clearing:"
        ),
        import_common.React.createElement(import_components.Forms.FormInput, {
          placeholder: "Enter channel ID (e.g., 1258452286682697890)",
          value: dmInput,
          onChange: setDMInput,
          onSubmitEditing: handleAddDM
        }),
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Add DM",
          onPress: handleAddDM
        }),
        exceptions.dms.map(
          (dm, index) => import_common.React.createElement(import_components.Forms.FormRow, {
            key: dm.id,
            label: dm.name,
            subLabel: dm.id,
            trailing: import_common.React.createElement(import_components.Forms.FormRow, {
              label: "Remove",
              style: { color: "#ff4757" },
              onPress: () => handleRemoveDM(dm.id)
            })
          })
        )
      ),
      import_common.React.createElement(
        import_components.Forms.FormSection,
        { title: "Actions" },
        import_common.React.createElement(import_components.Forms.FormRow, {
          label: "Clear All Exceptions",
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
          description: "Clear all unread notifications",
          applicationId: "-1",
          execute: () => {
            readMainNotifications();
            return;
          }
        });
        readAllCommandUnregister = (0, import_commands.registerCommand)({
          name: "read all",
          description: "Clear server unread notifications only",
          applicationId: "-1",
          execute: () => {
            readAllNotifications();
            return;
          }
        });
        readServerCommandUnregister = (0, import_commands.registerCommand)({
          name: "read server",
          description: "Clear server unread notifications only",
          applicationId: "-1",
          execute: () => {
            readServerNotifications();
            return;
          }
        });
        readDMCommandUnregister = (0, import_commands.registerCommand)({
          name: "read dm",
          description: "Clear DM unread notifications only",
          applicationId: "-1",
          execute: () => {
            readDMNotifications();
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
      if (readAllCommandUnregister) {
        try {
          readAllCommandUnregister();
          readAllCommandUnregister = null;
        } catch (e) {
        }
      }
      if (readServerCommandUnregister) {
        try {
          readServerCommandUnregister();
          readServerCommandUnregister = null;
        } catch (e) {
        }
      }
      if (readDMCommandUnregister) {
        try {
          readDMCommandUnregister();
          readDMCommandUnregister = null;
        } catch (e) {
        }
      }
    },
    settings: SettingsComponent
  };
})();
