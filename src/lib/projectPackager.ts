import JSZip from 'jszip';
import { MogsAIProject } from '../types/mogsai';
import { validateJarArtifact, ArtifactValidationResult } from './artifactValidator';

export async function exportProjectZip(project: MogsAIProject): Promise<Blob> {
  const zip = new JSZip();

  for (const file of project.files) {
    zip.file(file.path, file.content);
  }

  // Generate ZIP file as Blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Packages a JAR artifact ONLY if genuine, validated compiled .class files exist.
 * NEVER creates fake or truncated 8-byte placeholder class files.
 * Re-opens and validates the final produced JAR before returning.
 */
export async function exportCompiledJar(project: MogsAIProject): Promise<Blob> {
  const zip = new JSZip();

  // 1. Create standard Java JAR MANIFEST.MF
  const mainClass = project.projectMap.entryPoint || '';
  const manifest = [
    'Manifest-Version: 1.0',
    'Created-By: MogsAI Compiler & Packaging Engine',
    mainClass ? `Main-Class: ${mainClass}` : '',
    'Built-By: MogsAI',
    `Build-Jdk: ${project.javaVersion}`,
    '',
  ].filter(Boolean).join('\r\n') + '\r\n';

  zip.folder('META-INF')?.file('MANIFEST.MF', manifest);

  // 2. Copy resources to root of JAR (paper-plugin.yml, plugin.yml, config.yml, etc.)
  for (const file of project.files) {
    if (file.path.startsWith('src/main/resources/')) {
      const relative = file.path.replace('src/main/resources/', '');
      zip.file(relative, file.content);
    } else if (file.path === 'plugin.yml' || file.path === 'paper-plugin.yml' || file.path === 'config.yml') {
      zip.file(file.path, file.content);
    }
  }

  // 3. Only package genuine compiled .class files present in the project workspace
  // NEVER synthesize fake 8-byte headers!
  const compiledClassFiles = project.files.filter((f) => f.path.endsWith('.class'));

  for (const classFile of compiledClassFiles) {
    // If stored as base64 or binary text
    zip.file(classFile.path, classFile.content);
  }

  const jarBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
  });

  // 4. Re-open and strictly validate the final JAR artifact before allowing download
  const jarArrayBuffer = await jarBlob.arrayBuffer();
  const validation = await validateJarArtifact(jarArrayBuffer, project);

  if (!validation.valid) {
    const errorSummary = validation.errors.join('; ');
    throw new Error(
      `Artifact validation failed for '${project.name}.jar': ${errorSummary}. A deployable JAR cannot be produced without verified compiled bytecode.`
    );
  }

  return jarBlob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
