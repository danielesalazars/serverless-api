const fs = require('fs-extra');
const path = require('path');

// Carpeta de salida de la compilación de TypeScript (definida en tsconfig.json)
const outputDir = path.join(__dirname, '../dist');

async function prepareFunctionsForAzure() {
  console.log('Iniciando preparación de funciones para Azure Functions v4...');

  // 1. Copiar host.json a la raíz de 'dist'
  const hostJsonSourcePath = path.join(__dirname, '../host.json');
  const hostJsonDestPath = path.join(outputDir, 'host.json');
  if (await fs.pathExists(hostJsonSourcePath)) {
    await fs.copy(hostJsonSourcePath, hostJsonDestPath);
    console.log('host.json copiado a dist.');
  } else {
    console.warn(
      'Advertencia: host.json no encontrado en la raíz. Asegúrate de que existe.',
    );
  }

  // Opcional: Si tienes un local.settings.json en la raíz del proyecto, cópialo también.
  const localSettingsJsonSourcePath = path.join(
    __dirname,
    '../local.settings.json',
  );
  const localSettingsJsonDestPath = path.join(outputDir, 'local.settings.json');
  if (await fs.pathExists(localSettingsJsonSourcePath)) {
    await fs.copy(localSettingsJsonSourcePath, localSettingsJsonDestPath);
    console.log('local.settings.json copiado a dist.');
  }

  console.log(
    'Preparación de funciones completada. Azure Functions Core Tools generarán los function.json.',
  );
}

prepareFunctionsForAzure().catch((err) => {
  console.error('Error durante la preparación de archivos de función:', err);
  process.exit(1);
});
