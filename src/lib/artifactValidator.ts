import JSZip from 'jszip';
import { MogsAIProject } from '../types/mogsai';

export interface BytecodeValidationResult {
  valid: boolean;
  error?: string;
  className?: string;
  superClassName?: string;
  majorVersion?: number;
  minorVersion?: number;
  byteLength: number;
}

export interface ArtifactValidationResult {
  valid: boolean;
  status: 'valid' | 'corrupt_bytecode' | 'truncated_placeholder' | 'missing_descriptor' | 'invalid_descriptor' | 'missing_main_class' | 'empty_archive';
  errors: string[];
  warnings: string[];
  inspectedClasses: { name: string; size: number; valid: boolean; error?: string }[];
  descriptorInfo?: {
    name?: string;
    version?: string;
    mainClass?: string;
    type: 'paper-plugin.yml' | 'plugin.yml';
  };
}

/**
 * Genuine Java .class binary bytecode parser and validator according to the JVM Specification.
 * Rejects empty, truncated, or fabricated 8-byte placeholder files (e.g. CAFEBABE 00000041).
 */
export function validateJavaClassBytecode(bytes: Uint8Array, expectedClassName?: string): BytecodeValidationResult {
  const byteLength = bytes.length;

  // 1. Minimum valid Java class file length check
  // A minimal valid Java class (even empty Object subclass) requires constant pool, interfaces, fields, methods, attributes.
  // It is mathematically impossible for a valid compiled class to be only 8 bytes.
  if (byteLength < 32) {
    return {
      valid: false,
      error: `Truncated / placeholder .class file (${byteLength} bytes). Valid Java classes require a compiled constant pool, class references, methods, and attributes (minimum ~40 bytes).`,
      byteLength,
    };
  }

  // 2. Validate magic number: 0xCAFEBABE
  if (bytes[0] !== 0xca || bytes[1] !== 0xfe || bytes[2] !== 0xba || bytes[3] !== 0xbe) {
    return {
      valid: false,
      error: `Invalid magic header: expected 0xCAFEBABE, got 0x${bytes[0]?.toString(16)}${bytes[1]?.toString(16)}${bytes[2]?.toString(16)}${bytes[3]?.toString(16)}.`,
      byteLength,
    };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 4;

  const minorVersion = view.getUint16(offset);
  offset += 2;
  const majorVersion = view.getUint16(offset);
  offset += 2;

  // Validate major version (Java 8 = 52, Java 11 = 55, Java 17 = 61, Java 21 = 65, Java 22 = 66)
  if (majorVersion < 45 || majorVersion > 70) {
    return {
      valid: false,
      error: `Unrecognized Java major version: ${majorVersion}. Expected between 45 and 70.`,
      majorVersion,
      minorVersion,
      byteLength,
    };
  }

  // Check constant pool count
  if (offset + 2 > byteLength) {
    return {
      valid: false,
      error: 'Truncated class file: EOF while reading constant_pool_count.',
      majorVersion,
      minorVersion,
      byteLength,
    };
  }

  const cpCount = view.getUint16(offset);
  offset += 2;

  if (cpCount <= 1) {
    return {
      valid: false,
      error: `Invalid constant pool count: ${cpCount}. A valid class must declare entries.`,
      majorVersion,
      minorVersion,
      byteLength,
    };
  }

  // Parse constant pool entries
  interface CpEntry {
    tag: number;
    strValue?: string;
    nameIndex?: number;
    classIndex?: number;
  }
  const cp: (CpEntry | null)[] = new Array(cpCount).fill(null);

  try {
    for (let i = 1; i < cpCount; i++) {
      if (offset >= byteLength) {
        return {
          valid: false,
          error: `Truncated constant pool at index #${i}/${cpCount}.`,
          majorVersion,
          minorVersion,
          byteLength,
        };
      }

      const tag = bytes[offset++];
      switch (tag) {
        case 1: { // CONSTANT_Utf8
          if (offset + 2 > byteLength) throw new Error('EOF in UTF8 length');
          const len = view.getUint16(offset);
          offset += 2;
          if (offset + len > byteLength) throw new Error('EOF in UTF8 bytes');
          const utf8Bytes = bytes.subarray(offset, offset + len);
          offset += len;
          const strValue = new TextDecoder('utf-8', { fatal: false }).decode(utf8Bytes);
          cp[i] = { tag, strValue };
          break;
        }
        case 7: { // CONSTANT_Class
          if (offset + 2 > byteLength) throw new Error('EOF in Class info');
          const nameIndex = view.getUint16(offset);
          offset += 2;
          cp[i] = { tag, nameIndex };
          break;
        }
        case 8: { // CONSTANT_String
          offset += 2;
          cp[i] = { tag };
          break;
        }
        case 3: // CONSTANT_Integer
        case 4: { // CONSTANT_Float
          offset += 4;
          cp[i] = { tag };
          break;
        }
        case 5: // CONSTANT_Long
        case 6: { // CONSTANT_Double
          offset += 8;
          cp[i] = { tag };
          // 8-byte constants take two CP slots
          i++;
          break;
        }
        case 9: // CONSTANT_Fieldref
        case 10: // CONSTANT_Methodref
        case 11: // CONSTANT_InterfaceMethodref
        case 12: { // CONSTANT_NameAndType
          offset += 4;
          cp[i] = { tag };
          break;
        }
        case 15: { // CONSTANT_MethodHandle
          offset += 3;
          cp[i] = { tag };
          break;
        }
        case 16: // CONSTANT_MethodType
        case 19: // CONSTANT_Module
        case 20: { // CONSTANT_Package
          offset += 2;
          cp[i] = { tag };
          break;
        }
        case 17: // CONSTANT_Dynamic
        case 18: { // CONSTANT_InvokeDynamic
          offset += 4;
          cp[i] = { tag };
          break;
        }
        default:
          return {
            valid: false,
            error: `Corrupt bytecode: unknown constant pool tag ${tag} at index #${i}.`,
            majorVersion,
            minorVersion,
            byteLength,
          };
      }
    }

    // After constant pool: access_flags (2), this_class (2), super_class (2)
    if (offset + 6 > byteLength) {
      return {
        valid: false,
        error: 'Truncated class file: missing class header access_flags/this_class/super_class.',
        majorVersion,
        minorVersion,
        byteLength,
      };
    }

    const accessFlags = view.getUint16(offset);
    offset += 2;
    const thisClassIndex = view.getUint16(offset);
    offset += 2;
    const superClassIndex = view.getUint16(offset);
    offset += 2;

    // Resolve this_class name
    let className = 'unknown';
    const thisClassEntry = cp[thisClassIndex];
    if (thisClassEntry && thisClassEntry.tag === 7 && thisClassEntry.nameIndex) {
      const utf8 = cp[thisClassEntry.nameIndex];
      if (utf8 && utf8.strValue) {
        className = utf8.strValue.replace(/\//g, '.');
      }
    }

    let superClassName = 'java.lang.Object';
    if (superClassIndex > 0) {
      const superEntry = cp[superClassIndex];
      if (superEntry && superEntry.tag === 7 && superEntry.nameIndex) {
        const utf8 = cp[superEntry.nameIndex];
        if (utf8 && utf8.strValue) {
          superClassName = utf8.strValue.replace(/\//g, '.');
        }
      }
    }

    if (expectedClassName && className !== 'unknown') {
      const normalizedExpected = expectedClassName.replace(/\//g, '.').replace(/\.class$/, '');
      if (className !== normalizedExpected && !className.endsWith(normalizedExpected)) {
        return {
          valid: false,
          error: `Class name mismatch: expected '${normalizedExpected}', but bytecode defines '${className}'.`,
          className,
          superClassName,
          majorVersion,
          minorVersion,
          byteLength,
        };
      }
    }

    return {
      valid: true,
      className,
      superClassName,
      majorVersion,
      minorVersion,
      byteLength,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Bytecode structure parsing error: ${err.message}`,
      majorVersion,
      minorVersion,
      byteLength,
    };
  }
}

/**
 * Validates a packaged JAR artifact archive by reopening it with JSZip and verifying:
 * 1. Valid ZIP structure.
 * 2. Presence of valid descriptor (paper-plugin.yml or plugin.yml).
 * 3. Declared main class exists inside the JAR.
 * 4. Every single .class file inside the archive is genuine, non-truncated compiled bytecode.
 */
export async function validateJarArtifact(
  jarData: Blob | ArrayBuffer | Uint8Array,
  project?: MogsAIProject
): Promise<ArtifactValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const inspectedClasses: ArtifactValidationResult['inspectedClasses'] = [];

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(jarData);
  } catch (e: any) {
    return {
      valid: false,
      status: 'empty_archive',
      errors: [`Failed to open JAR as valid ZIP archive: ${e.message}`],
      warnings: [],
      inspectedClasses: [],
    };
  }

  const fileEntries = Object.keys(zip.files);
  if (fileEntries.length === 0) {
    return {
      valid: false,
      status: 'empty_archive',
      errors: ['JAR archive is completely empty.'],
      warnings: [],
      inspectedClasses: [],
    };
  }

  // 1. Locate and parse descriptor
  const paperPluginEntry = zip.file('paper-plugin.yml');
  const spigotPluginEntry = zip.file('plugin.yml');
  const descriptorEntry = paperPluginEntry || spigotPluginEntry;

  let descriptorInfo: ArtifactValidationResult['descriptorInfo'];

  if (!descriptorEntry) {
    errors.push('Missing plugin descriptor (neither paper-plugin.yml nor plugin.yml found in JAR root).');
  } else {
    try {
      const descriptorText = await descriptorEntry.async('string');
      const isPaper = descriptorEntry === paperPluginEntry;

      const nameMatch = descriptorText.match(/^name:\s*['"]?([a-zA-Z0-9_-]+)['"]?/m);
      const versionMatch = descriptorText.match(/^version:\s*['"]?([^'"\n\r]+)['"]?/m);
      const mainMatch = descriptorText.match(/^main:\s*['"]?([a-zA-Z0-9_.]+)['"]?/m);

      descriptorInfo = {
        name: nameMatch?.[1],
        version: versionMatch?.[1],
        mainClass: mainMatch?.[1],
        type: isPaper ? 'paper-plugin.yml' : 'plugin.yml',
      };

      if (!descriptorInfo.name) {
        errors.push(`Invalid descriptor ${descriptorInfo.type}: missing 'name:' attribute.`);
      }
      if (!descriptorInfo.mainClass) {
        errors.push(`Invalid descriptor ${descriptorInfo.type}: missing 'main:' class declaration.`);
      }
    } catch (e: any) {
      errors.push(`Failed to read plugin descriptor: ${e.message}`);
    }
  }

  // 2. Inspect all .class files
  const classFileNames = fileEntries.filter((f) => f.endsWith('.class') && !zip.files[f].dir);

  if (classFileNames.length === 0) {
    errors.push('No compiled .class files found in JAR archive.');
  }

  for (const classPath of classFileNames) {
    const classFile = zip.file(classPath);
    if (!classFile) continue;

    const bytes = await classFile.async('uint8array');
    const classResult = validateJavaClassBytecode(bytes);

    inspectedClasses.push({
      name: classPath,
      size: bytes.length,
      valid: classResult.valid,
      error: classResult.error,
    });

    if (!classResult.valid) {
      errors.push(`Bytecode verification failed for '${classPath}' (${bytes.length} bytes): ${classResult.error}`);
    }
  }

  // 3. Verify main class file specifically exists and is valid
  if (descriptorInfo?.mainClass) {
    const expectedClassPath = descriptorInfo.mainClass.replace(/\./g, '/') + '.class';
    const mainClassEntry = inspectedClasses.find(
      (c) => c.name === expectedClassPath || c.name.replace(/\\/g, '/') === expectedClassPath
    );

    if (!mainClassEntry) {
      errors.push(
        `Main class '${descriptorInfo.mainClass}' declared in ${descriptorInfo.type} was not found inside the JAR at '${expectedClassPath}'.`
      );
    } else if (!mainClassEntry.valid) {
      errors.push(`Declared main class '${descriptorInfo.mainClass}' is corrupted or truncated: ${mainClassEntry.error}`);
    }
  }

  let status: ArtifactValidationResult['status'] = 'valid';
  if (errors.length > 0) {
    if (errors.some((e) => e.includes('Truncated / placeholder') || e.includes('8 bytes'))) {
      status = 'truncated_placeholder';
    } else if (errors.some((e) => e.includes('Bytecode verification failed'))) {
      status = 'corrupt_bytecode';
    } else if (errors.some((e) => e.includes('Missing plugin descriptor'))) {
      status = 'missing_descriptor';
    } else if (errors.some((e) => e.includes('Main class'))) {
      status = 'missing_main_class';
    } else {
      status = 'invalid_descriptor';
    }
  }

  return {
    valid: errors.length === 0,
    status,
    errors,
    warnings,
    inspectedClasses,
    descriptorInfo,
  };
}
