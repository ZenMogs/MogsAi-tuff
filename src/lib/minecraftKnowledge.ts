import { KnowledgeDoc, MinecraftPlatform } from '../types/mogsai';

export interface VersionInfo {
  version: string;
  javaVersion: number;
  apiLevel: string;
  releaseDate: string;
  keyFeatures: string[];
  adventureSupport: 'native' | 'legacy' | 'none';
  datapackFormat: number;
}

export const MINECRAFT_VERSIONS: Record<string, VersionInfo> = {
  '1.21.4': {
    version: '1.21.4',
    javaVersion: 21,
    apiLevel: '1.21',
    releaseDate: '2024-12',
    keyFeatures: ['Java 21 requirement', 'Pale Garden & Creaking', 'Data-driven enchantments', 'Components v2'],
    adventureSupport: 'native',
    datapackFormat: 61,
  },
  '1.21.1': {
    version: '1.21.1',
    javaVersion: 21,
    apiLevel: '1.21',
    releaseDate: '2024-08',
    keyFeatures: ['Java 21 requirement', 'Trial Chambers & Breeze', 'Mace weapon', 'Modern Paper-plugin loader'],
    adventureSupport: 'native',
    datapackFormat: 48,
  },
  '1.20.6': {
    version: '1.20.6',
    javaVersion: 21,
    apiLevel: '1.20',
    releaseDate: '2024-04',
    keyFeatures: ['Java 21 minimum', 'Item components replace NBT', 'Armadillo & Wolf variants'],
    adventureSupport: 'native',
    datapackFormat: 41,
  },
  '1.20.4': {
    version: '1.20.4',
    javaVersion: 17,
    apiLevel: '1.20',
    releaseDate: '2023-12',
    keyFeatures: ['Java 17', 'Copper bulbs & Crafter', 'Modern PDC storage', 'Adventure components'],
    adventureSupport: 'native',
    datapackFormat: 26,
  },
  '1.19.4': {
    version: '1.19.4',
    javaVersion: 17,
    apiLevel: '1.19',
    releaseDate: '2023-03',
    keyFeatures: ['Java 17', 'paper-plugin.yml intro', 'Display entities', 'Interaction entities'],
    adventureSupport: 'native',
    datapackFormat: 12,
  },
  '1.18.2': {
    version: '1.18.2',
    javaVersion: 17,
    apiLevel: '1.18',
    releaseDate: '2022-02',
    keyFeatures: ['Java 17 requirement', 'World height -64 to 320', 'Deep dark & caves'],
    adventureSupport: 'native',
    datapackFormat: 9,
  },
  '1.16.5': {
    version: '1.16.5',
    javaVersion: 11,
    apiLevel: '1.16',
    releaseDate: '2021-01',
    keyFeatures: ['Java 8/11/16', 'Nether update', 'RGB Hex color support intro'],
    adventureSupport: 'legacy',
    datapackFormat: 6,
  },
};

export const PLATFORM_SPECS: Record<
  MinecraftPlatform,
  {
    name: string;
    description: string;
    descriptorFile: string;
    recommendedBuild: 'gradle' | 'maven' | 'none';
    keyPackages: string[];
    documentationUrl: string;
  }
> = {
  paper: {
    name: 'PaperMC',
    description: 'High performance Minecraft server software with rich modern Adventure API and paper-plugin.yml.',
    descriptorFile: 'paper-plugin.yml',
    recommendedBuild: 'gradle',
    keyPackages: ['io.papermc.paper', 'net.kyori.adventure'],
    documentationUrl: 'https://docs.papermc.io/paper',
  },
  purpur: {
    name: 'PurpurMC',
    description: 'Drop-in Paper replacement focused on extreme configurability and gameplay customization.',
    descriptorFile: 'paper-plugin.yml',
    recommendedBuild: 'gradle',
    keyPackages: ['org.purpurmc.purpur', 'io.papermc.paper'],
    documentationUrl: 'https://purpurmc.org/docs',
  },
  spigot: {
    name: 'SpigotMC',
    description: 'Traditional Spigot API server software compatible with standard plugin.yml.',
    descriptorFile: 'plugin.yml',
    recommendedBuild: 'maven',
    keyPackages: ['org.spigotmc', 'org.bukkit'],
    documentationUrl: 'https://hub.spigotmc.org/javadocs/spigot/',
  },
  bukkit: {
    name: 'Bukkit',
    description: 'Classic Bukkit API foundation.',
    descriptorFile: 'plugin.yml',
    recommendedBuild: 'maven',
    keyPackages: ['org.bukkit'],
    documentationUrl: 'https://hub.spigotmc.org/javadocs/bukkit/',
  },
  fabric: {
    name: 'Fabric',
    description: 'Lightweight, modular modding toolchain with fast version updates and Mixin support.',
    descriptorFile: 'fabric.mod.json',
    recommendedBuild: 'gradle',
    keyPackages: ['net.fabricmc.fabric.api', 'net.fabricmc.api'],
    documentationUrl: 'https://fabricmc.net/wiki/',
  },
  neoforge: {
    name: 'NeoForge',
    description: 'Modern community-driven fork of MinecraftForge for 1.20.4+ and 1.21+.',
    descriptorFile: 'neoforge.mods.toml',
    recommendedBuild: 'gradle',
    keyPackages: ['net.neoforged.fml', 'net.neoforged.neoforge'],
    documentationUrl: 'https://docs.neoforged.net/',
  },
  kotlin: {
    name: 'Kotlin Plugin (Paper)',
    description: 'Paper plugin powered by Kotlin stdlib, Kotlin coroutines, and idiomatic DSLs.',
    descriptorFile: 'paper-plugin.yml',
    recommendedBuild: 'gradle',
    keyPackages: ['io.papermc.paper', 'kotlinx.coroutines'],
    documentationUrl: 'https://docs.papermc.io/',
  },
  skript: {
    name: 'Skript Scripting',
    description: 'Human-readable event-driven scripting for Minecraft server mechanics.',
    descriptorFile: 'scripts/script.sk',
    recommendedBuild: 'none',
    keyPackages: ['ch.njol.skript'],
    documentationUrl: 'https://skripthub.net/',
  },
  datapack: {
    name: 'Minecraft Datapack',
    description: 'Vanilla Minecraft datapack with pack.mcmeta, mcfunctions, tags, and predicates.',
    descriptorFile: 'pack.mcmeta',
    recommendedBuild: 'none',
    keyPackages: ['data/minecraft/functions'],
    documentationUrl: 'https://minecraft.wiki/w/Data_pack',
  },
  resourcepack: {
    name: 'Resource Pack',
    description: 'Minecraft client resource pack with textures, custom models, and sound mappings.',
    descriptorFile: 'pack.mcmeta',
    recommendedBuild: 'none',
    keyPackages: ['assets/minecraft/textures'],
    documentationUrl: 'https://minecraft.wiki/w/Resource_pack',
  },
};

export const KNOWLEDGE_DATABASE: KnowledgeDoc[] = [
  {
    id: 'adventure_minimessage',
    title: 'Modern Paper Text Formatting: Adventure & MiniMessage',
    category: 'api_changes',
    applicableVersions: ['1.20.x', '1.21.x'],
    summary: 'Replace legacy ChatColor with Adventure Component and MiniMessage tags for hex colors and gradients.',
    content: `In modern Paper (1.19+ and especially 1.21.x), legacy ChatColor (§a, &a) is deprecated in favor of Kyori Adventure Components.
MiniMessage provides a human-friendly tag system supporting RGB hex colors, gradients, click events, and hover events without fragile color code stripping.`,
    codeSnippet: `import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;

public class MessageUtil {
    private static final MiniMessage MM = MiniMessage.miniMessage();

    public static Component format(String message) {
        return MM.deserialize(message);
    }
    
    // Example usage:
    // player.sendMessage(MessageUtil.format("<gradient:#00ff88:#00b4d8><bold>MogsAI</bold></gradient> <gray>Kit claimed!</gray>"));
}`,
  },
  {
    id: 'persistent_data_container',
    title: 'PersistentDataContainer (PDC) vs Legacy NBT',
    category: 'best_practices',
    applicableVersions: ['1.14+', '1.20.x', '1.21.x'],
    summary: 'Store type-safe custom metadata on Items, Entities, and TileEntities without fragile NBT reflection.',
    content: `Since Minecraft 1.14 and standard across Paper 1.21, the PersistentDataContainer API allows plugins to store persistent data on ItemMeta, Entities, and Chunks safely using NamespacedKeys.`,
    codeSnippet: `import org.bukkit.NamespacedKey;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

public class KitItemStorage {
    private final NamespacedKey kitKey;

    public KitItemStorage(Plugin plugin) {
        this.kitKey = new NamespacedKey(plugin, "kit_id");
    }

    public ItemStack tagItem(ItemStack item, String kitId) {
        ItemMeta meta = item.getItemMeta();
        if (meta != null) {
            meta.getPersistentDataContainer().set(kitKey, PersistentDataType.STRING, kitId);
            item.setItemMeta(meta);
        }
        return item;
    }
}`,
  },
  {
    id: 'folia_thread_safety',
    title: 'Folia & Multi-Threaded Server Safety Guidelines',
    category: 'folia',
    applicableVersions: ['1.19.4', '1.20.x', '1.21.x'],
    summary: 'Avoid Bukkit.getScheduler() when building for Folia or modern multi-threaded architectures.',
    content: `Folia splits the world into independent regional tick loops. Calling world modification methods or player teleports asynchronously will throw IllegalStateException.
Plugins should use RegionScheduler or fallback to standard BukkitScheduler depending on server runtime detection.`,
    codeSnippet: `// Thread-safe dispatch pattern
public void dispatchSync(Runnable task) {
    if (isFolia()) {
        Bukkit.getGlobalRegionScheduler().run(plugin, t -> task.run());
    } else {
        Bukkit.getScheduler().runTask(plugin, task);
    }
}`,
  },
  {
    id: 'custom_gui_holder',
    title: 'InventoryHolder Pattern for Secure Custom GUIs',
    category: 'gui',
    applicableVersions: ['1.16+', '1.20.x', '1.21.x'],
    summary: 'Never check inventory by title string alone. Use a dedicated InventoryHolder class to prevent item duplication exploits.',
    content: `Checking inventory titles using e.getView().getTitle() is fragile and exploitable by renaming chests with anvils.
Always create an InventoryHolder implementation so e.getInventory().getHolder() instanceof KitGUI is 100% exploit-proof.`,
    codeSnippet: `public class KitInventoryHolder implements InventoryHolder {
    private Inventory inventory;

    @Override
    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }
}

// In Listener:
@EventHandler
public void onInventoryClick(InventoryClickEvent event) {
    if (event.getInventory().getHolder() instanceof KitInventoryHolder) {
        event.setCancelled(true); // Stop players stealing GUI items
        // Handle slot click
    }
}`,
  },
  {
    id: 'vault_economy_integration',
    title: 'Vault Economy Integration with ServiceManager',
    category: 'integrations',
    applicableVersions: ['1.12.x', '1.16.x', '1.20.x', '1.21.x'],
    summary: 'Hook into Vault economy using RegisteredServiceProvider without hard crashes if Vault is missing.',
    content: `Always declare 'softdepend: [Vault]' in plugin.yml and check if Vault is present before accessing RegisteredServiceProvider to avoid ClassNotFoundException.`,
    codeSnippet: `import net.milkbowl.vault.economy.Economy;
import org.bukkit.plugin.RegisteredServiceProvider;

public boolean setupEconomy(Plugin plugin) {
    if (plugin.getServer().getPluginManager().getPlugin("Vault") == null) {
        return false;
    }
    RegisteredServiceProvider<Economy> rsp = plugin.getServer().getServicesManager().getRegistration(Economy.class);
    if (rsp == null) {
        return false;
    }
    this.econ = rsp.getProvider();
    return this.econ != null;
}`,
  },
  {
    id: 'paper_plugin_yml_modern',
    title: 'Paper 1.21 Modern paper-plugin.yml Configuration',
    category: 'platforms',
    applicableVersions: ['1.20.x', '1.21.x'],
    summary: 'How paper-plugin.yml enables modern dependency declaration, loaders, and bootstrappers.',
    content: `Paper 1.19.3+ introduced paper-plugin.yml. It supports direct declaration of server dependencies, library loader dependencies (auto-resolving Maven artifacts at runtime!), and explicit permission trees.`,
    codeSnippet: `name: MogsKitPlugin
version: '1.0.0'
main: com.mogsai.kits.KitPlugin
api-version: '1.21'
author: MogsAI
dependencies:
  server:
    Vault:
      load: BEFORE
      required: false`,
  },
];

export function getRecommendedJava(mcVersion: string): number {
  const info = MINECRAFT_VERSIONS[mcVersion];
  return info ? info.javaVersion : 21;
}

export function searchKnowledge(query: string): KnowledgeDoc[] {
  const q = query.toLowerCase().trim();
  if (!q) return KNOWLEDGE_DATABASE;
  return KNOWLEDGE_DATABASE.filter(
    (doc) =>
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q)
  );
}
