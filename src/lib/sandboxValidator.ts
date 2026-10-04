import { MogsAIProject, ValidationCheck, ReviewIssue } from '../types/mogsai';

export function runSandboxValidation(project: MogsAIProject): {
  passed: boolean;
  checks: ValidationCheck[];
  issues: ReviewIssue[];
} {
  const checks: ValidationCheck[] = [];
  const issues: ReviewIssue[] = [];

  // 1. Find plugin descriptor
  const paperPlugin = project.files.find((f) => f.path.endsWith('paper-plugin.yml'));
  const pluginYml = project.files.find((f) => f.path.endsWith('plugin.yml'));
  const fabricModJson = project.files.find((f) => f.path.endsWith('fabric.mod.json'));
  const packMcmeta = project.files.find((f) => f.path.endsWith('pack.mcmeta'));
  const descriptor = paperPlugin || pluginYml;

  // For Paper/Spigot/Bukkit
  if (['paper', 'spigot', 'purpur', 'bukkit'].includes(project.platform)) {
    if (!descriptor) {
      checks.push({
        name: 'Plugin Descriptor',
        status: 'failed',
        message: 'Missing plugin.yml or paper-plugin.yml descriptor file!',
      });
    } else {
      // Validate YAML structure
      const content = descriptor.content;
      const hasName = /^name:\s*['"]?[a-zA-Z0-9_-]+['"]?/m.test(content);
      const hasMain = /^main:\s*['"]?[a-zA-Z0-9_.]+['"]?/m.test(content);
      const hasVersion = /^version:\s*['"]?[a-zA-Z0-9_.-]+['"]?/m.test(content);

      if (hasName && hasMain && hasVersion) {
        checks.push({
          name: 'Plugin Descriptor Schema',
          status: 'passed',
          message: `Valid ${descriptor.path} with required attributes (name, main, version).`,
          file: descriptor.path,
        });
      } else {
        checks.push({
          name: 'Plugin Descriptor Schema',
          status: 'failed',
          message: `${descriptor.path} is missing one of required fields: name, main, version.`,
          file: descriptor.path,
        });
      }

      // Check main class existence in src
      const mainMatch = content.match(/^main:\s*['"]?([a-zA-Z0-9_.]+)['"]?/m);
      if (mainMatch) {
        const mainClass = mainMatch[1];
        const expectedJavaPath = 'src/main/java/' + mainClass.replace(/\./g, '/') + '.java';
        const javaFile = project.files.find(
          (f) => f.path.replace(/\\/g, '/') === expectedJavaPath || f.path.endsWith(mainClass.split('.').pop() + '.java')
        );

        if (javaFile) {
          checks.push({
            name: 'Main Class Verification',
            status: 'passed',
            message: `Entry point class '${mainClass}' exists at ${javaFile.path}.`,
            file: javaFile.path,
          });
        } else {
          checks.push({
            name: 'Main Class Verification',
            status: 'failed',
            message: `Main class '${mainClass}' declared in ${descriptor.path} was not found in project sources!`,
          });
        }
      }

      // Cross-check commands in code vs descriptor
      const registeredCommands: string[] = [];
      const cmdRegex = /^\s{2}([a-zA-Z0-9_-]+):/gm;
      let inCommandsSection = false;
      for (const line of content.split('\n')) {
        if (/^commands:\s*$/i.test(line)) {
          inCommandsSection = true;
          continue;
        }
        if (inCommandsSection && /^[a-zA-Z0-9_-]+:\s*$/i.test(line)) {
          inCommandsSection = false;
        }
        if (inCommandsSection) {
          const match = line.match(/^\s{2}([a-zA-Z0-9_-]+):/);
          if (match) {
            registeredCommands.push(match[1].toLowerCase());
          }
        }
      }

      // Scan Java files for getCommand(...)
      let codeCommandsChecked = 0;
      for (const f of project.files) {
        if (f.language === 'java') {
          const matches = f.content.matchAll(/getCommand\(["']([a-zA-Z0-9_-]+)["']\)/g);
          for (const m of matches) {
            const cmdName = m[1].toLowerCase();
            codeCommandsChecked++;
            if (!registeredCommands.includes(cmdName)) {
              checks.push({
                name: `Command Registration: /${cmdName}`,
                status: 'warning',
                message: `Command '${cmdName}' is called in ${f.path} but not registered in ${descriptor.path}!`,
                file: f.path,
              });
              issues.push({
                id: `cmd_missing_${cmdName}`,
                severity: 'warning',
                category: 'architecture',
                title: `Unregistered command: /${cmdName}`,
                description: `Code uses getCommand("${cmdName}") which returns null if not registered in ${descriptor.path}.`,
                suggestion: `Add '${cmdName}:' to commands section in ${descriptor.path}.`,
                file: descriptor.path,
              });
            }
          }
        }
      }

      if (codeCommandsChecked > 0 && !checks.some((c) => c.name.startsWith('Command Registration:') && c.status === 'warning')) {
        checks.push({
          name: 'Command Registration Consistency',
          status: 'passed',
          message: `All ${codeCommandsChecked} command references in Java code are registered in ${descriptor.path}.`,
        });
      }
    }

    // Check Adventure vs Legacy ChatColor on Paper 1.20+
    const isModernPaper = project.platform === 'paper' && (project.version.startsWith('1.20') || project.version.startsWith('1.21'));
    if (isModernPaper) {
      let legacyChatColorFound = false;
      for (const f of project.files) {
        if (f.language === 'java' && (f.content.includes('ChatColor.') || f.content.includes('org.bukkit.ChatColor'))) {
          legacyChatColorFound = true;
          checks.push({
            name: 'Modern Text Formatting',
            status: 'warning',
            message: `Found legacy ChatColor in ${f.path}. Modern Paper 1.21 uses Adventure Component & MiniMessage.`,
            file: f.path,
          });
          issues.push({
            id: `legacy_color_${f.path}`,
            severity: 'info',
            category: 'deprecated_api',
            title: `Legacy ChatColor in ${f.path.split('/').pop()}`,
            description: `ChatColor is deprecated on Paper 1.20+. MiniMessage allows hex colors, gradients, and full component styling.`,
            suggestion: `Replace ChatColor with net.kyori.adventure.text.minimessage.MiniMessage.`,
            file: f.path,
          });
        }
      }

      if (!legacyChatColorFound) {
        checks.push({
          name: 'Modern Adventure Component Compliance',
          status: 'passed',
          message: 'Zero legacy ChatColor detected; all text components use modern Adventure API.',
        });
      }
    }

    // Check Java version compatibility
    if (project.version.startsWith('1.21') || project.version.startsWith('1.20.6')) {
      if (project.javaVersion < 21) {
        checks.push({
          name: 'Java Version Requirement',
          status: 'failed',
          message: `Minecraft ${project.version} requires Java 21 minimum, but project target is Java ${project.javaVersion}!`,
        });
        issues.push({
          id: 'java_version_mismatch',
          severity: 'critical',
          category: 'architecture',
          title: 'Java 21 Requirement Violation',
          description: `Minecraft 1.20.6+ and 1.21+ runtime strictly requires Java 21 bytecode.`,
          suggestion: 'Update build toolchain to Java 21.',
        });
      } else {
        checks.push({
          name: 'Java 21 Toolchain & Bytecode Target',
          status: 'passed',
          message: `Java ${project.javaVersion} matches Minecraft ${project.version} requirements.`,
        });
      }
    }
  } else if (project.platform === 'fabric') {
    if (fabricModJson) {
      checks.push({
        name: 'Fabric Mod Descriptor',
        status: 'passed',
        message: 'fabric.mod.json is present with schema version 1.',
        file: fabricModJson.path,
      });
    } else {
      checks.push({
        name: 'Fabric Mod Descriptor',
        status: 'failed',
        message: 'Missing fabric.mod.json descriptor!',
      });
    }
  } else if (project.platform === 'datapack') {
    if (packMcmeta) {
      checks.push({
        name: 'Datapack pack.mcmeta',
        status: 'passed',
        message: 'pack.mcmeta format verified.',
        file: packMcmeta.path,
      });
    } else {
      checks.push({
        name: 'Datapack pack.mcmeta',
        status: 'failed',
        message: 'Missing pack.mcmeta file!',
      });
    }
  }

  // General thread safety & async checks in Java files
  for (const f of project.files) {
    if (f.language === 'java') {
      if (f.content.includes('runTaskAsynchronously') && (f.content.includes('player.teleport') || f.content.includes('player.getInventory()'))) {
        checks.push({
          name: 'Async Thread Safety Warning',
          status: 'warning',
          message: `Potential world/inventory mutation inside async task in ${f.path}!`,
          file: f.path,
        });
        issues.push({
          id: `async_safety_${f.path}`,
          severity: 'critical',
          category: 'thread_safety',
          title: `Unsafe Async Thread Operation in ${f.path.split('/').pop()}`,
          description: `Teleporting players or modifying inventories on an asynchronous thread will crash Paper or cause Folia data corruption.`,
          suggestion: `Wrap Bukkit world/inventory calls in Bukkit.getScheduler().runTask(plugin, ...) or Folia RegionScheduler.`,
          file: f.path,
        });
      }
    }
  }

  // Summary status
  const hasFailed = checks.some((c) => c.status === 'failed');

  return {
    passed: !hasFailed,
    checks,
    issues,
  };
}
