import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { center, copyToDocument, prune } from '@gltf-transform/functions';

const source = process.argv[2];
const destination = fileURLToPath(new URL('../public/media/razer.glb', import.meta.url));
if (!source || resolve(source) === destination) {
  throw new Error('Provide the original GLB path; the source must be separate from public/media/razer.glb.');
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const original = await io.read(source);
const assemblies = original.getRoot().listNodes().filter(node => node.getMesh() && node.getName().startsWith('Razer Enclosure'));
if (assemblies.length !== 1 || !assemblies[0].getMesh()) {
  throw new Error('Expected one colored Razer enclosure assembly. The website model was not changed.');
}

// Copy the requested colored assembly and its materials, leaving the source export untouched.
const prepared = new Document();
for (const extension of original.getRoot().listExtensionsUsed()) {
  prepared.createExtension(extension.constructor).setRequired(extension.isRequired());
}
const copies = copyToDocument(prepared, original, assemblies);
const scene = prepared.createScene('Razer enclosure').addChild(copies.get(assemblies[0]));
prepared.getRoot().setDefaultScene(scene);
await prepared.transform(prune(), center({ pivot: 'below' }));
await io.write(destination, prepared);
console.log(`Prepared colored enclosure: ${(await stat(destination)).size} bytes (original: ${(await stat(source)).size} bytes).`);
