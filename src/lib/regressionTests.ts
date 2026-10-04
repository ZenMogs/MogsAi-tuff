import JSZip from 'jszip';
import { validateJavaClassBytecode, validateJarArtifact, ArtifactValidationResult } from './artifactValidator';

export interface RegressionTestReport {
  testName: string;
  passed: boolean;
  message: string;
  details?: string;
}

/**
 * Runs the automated regression test suite specifically targeting the HealPlugin
 * 8-byte placeholder class failure and corrupt artifact detection.
 */
export async function runHealPluginRegressionTests(): Promise<{
  allPassed: boolean;
  reports: RegressionTestReport[];
}> {
  const reports: RegressionTestReport[] = [];

  // TEST 1: Detect and reject the exact 8-byte placeholder class file:
  // [0xCA, 0xFE, 0xBA, 0xBE, 0x00, 0x00, 0x00, 0x41]
  const fakeEightByteClass = new Uint8Array([0xca, 0xfe, 0xba, 0xbe, 0x00, 0x00, 0x00, 0x41]);
  const result1 = validateJavaClassBytecode(fakeEightByteClass, 'com.mogsai.heal.HealPlugin');
  if (!result1.valid && result1.error?.includes('Truncated / placeholder .class file (8 bytes)')) {
    reports.push({
      testName: 'Reject 8-Byte Truncated Class (CAFEBABE 00000041)',
      passed: true,
      message: 'Successfully caught and rejected the 8-byte placeholder class bytecode.',
      details: result1.error,
    });
  } else {
    reports.push({
      testName: 'Reject 8-Byte Truncated Class (CAFEBABE 00000041)',
      passed: false,
      message: 'Failed to reject 8-byte placeholder class file!',
    });
  }

  // TEST 2: Inspect a mock corrupt HealPlugin JAR that contains the fake 8-byte classes
  const corruptZip = new JSZip();
  corruptZip.file(
    'paper-plugin.yml',
    `name: HealPlugin\nversion: '1.0.0'\nmain: com.mogsai.heal.HealPlugin\napi-version: '1.21'\n`
  );
  corruptZip.file('config.yml', `prefix: "[Heal]"\n`);
  corruptZip.file('com/mogsai/heal/HealPlugin.class', fakeEightByteClass);
  corruptZip.file('com/mogsai/heal/command/HealCommand.class', fakeEightByteClass);

  const corruptJarBuffer = await corruptZip.generateAsync({ type: 'uint8array' });
  const jarResult = await validateJarArtifact(corruptJarBuffer);

  if (!jarResult.valid && jarResult.status === 'truncated_placeholder') {
    reports.push({
      testName: 'Reject Corrupt HealPlugin JAR Artifact',
      passed: true,
      message: 'JAR validation correctly refused to mark the artifact deployable due to placeholder bytecode.',
      details: jarResult.errors.join('; '),
    });
  } else {
    reports.push({
      testName: 'Reject Corrupt HealPlugin JAR Artifact',
      passed: false,
      message: 'Corrupt HealPlugin JAR was incorrectly accepted!',
    });
  }

  // TEST 3: Reject JAR missing declared main class
  const missingMainZip = new JSZip();
  missingMainZip.file(
    'paper-plugin.yml',
    `name: MissingMainPlugin\nversion: '1.0.0'\nmain: com.mogsai.missing.MissingMain\n`
  );
  missingMainZip.file('config.yml', `key: value\n`);
  // Has some other class, but not MissingMain.class
  const missingMainBuffer = await missingMainZip.generateAsync({ type: 'uint8array' });
  const missingResult = await validateJarArtifact(missingMainBuffer);

  if (!missingResult.valid && missingResult.errors.some((e) => e.includes('MissingMain') || e.includes('No compiled .class files'))) {
    reports.push({
      testName: 'Reject JAR with Missing Main Class File',
      passed: true,
      message: 'Successfully detected missing main class file inside archive.',
    });
  } else {
    reports.push({
      testName: 'Reject JAR with Missing Main Class File',
      passed: false,
      message: 'Failed to flag missing main class in archive.',
    });
  }

  // TEST 4: Reject JAR missing plugin descriptor
  const noDescZip = new JSZip();
  noDescZip.file('META-INF/MANIFEST.MF', 'Manifest-Version: 1.0\n');
  const noDescBuffer = await noDescZip.generateAsync({ type: 'uint8array' });
  const noDescResult = await validateJarArtifact(noDescBuffer);

  if (!noDescResult.valid && noDescResult.status === 'missing_descriptor') {
    reports.push({
      testName: 'Reject JAR with Missing Plugin Descriptor',
      passed: true,
      message: 'Successfully detected missing paper-plugin.yml or plugin.yml.',
    });
  } else {
    reports.push({
      testName: 'Reject JAR with Missing Plugin Descriptor',
      passed: false,
      message: 'Failed to reject JAR missing descriptor.',
    });
  }

  const allPassed = reports.every((r) => r.passed);
  return { allPassed, reports };
}
