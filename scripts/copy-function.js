const fs = require('fs-extra');
const path = require('path');

const outputDir = path.join(__dirname, '../dist'); // Carpeta de salida de la compilación
const sourceFunctionsDir = path.join(__dirname, '../src/users/functions'); // Donde están tus archivos .function.ts

async function copyFunctions() {
  console.log(
    'Iniciando preparación de funciones para el build (versión genérica)...',
  );

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

  // 2. Descubrir funciones automáticamente y procesarlas
  const functionFiles = await fs.readdir(sourceFunctionsDir);
  const functionsToProcess = functionFiles.filter((file) =>
    file.endsWith('.function.ts'),
  );

  if (functionsToProcess.length === 0) {
    console.warn(
      'No se encontraron archivos *.function.ts en src/users/functions/. No se crearon funciones.',
    );
    return;
  }

  for (const functionFileName of functionsToProcess) {
    const funcName = path.basename(functionFileName, '.function.ts'); // Ej: 'create-user'
    const functionFolder = path.join(outputDir, funcName);
    await fs.ensureDir(functionFolder); // Asegura que la carpeta de la función exista

    // Copiar el archivo JS compilado
    const compiledJsSourcePath = path.join(
      outputDir,
      'src',
      'users',
      'functions',
      `${funcName}.function.js`,
    );
    const compiledJsDestPath = path.join(functionFolder, 'index.js'); // Renombrar a index.js para Azure Functions

    if (await fs.pathExists(compiledJsSourcePath)) {
      await fs.copy(compiledJsSourcePath, compiledJsDestPath);
      console.log(
        `Copiado ${funcName}.function.js a ${functionFolder}/index.js`,
      );
    } else {
      console.error(
        `Error: Archivo compilado no encontrado para ${funcName} en ${compiledJsSourcePath}`,
      );
      throw new Error(
        `Compilación fallida o archivo no encontrado para ${funcName}.`,
      );
    }

    // Determinar el método HTTP y la ruta para function.json basado en el nombre
    let method = 'post';
    let route = 'users';

    if (funcName.startsWith('get-')) {
      method = 'get';
      route = 'users/{id}'; // Convención para GET por ID
    } else if (funcName.startsWith('update-')) {
      method = 'put';
      route = 'users/{id}'; // Convención para PUT por ID
    } else if (funcName.startsWith('delete-')) {
      method = 'delete';
      route = 'users/{id}'; // Convención para DELETE por ID
    } else if (funcName === 'create-user') {
      method = 'post';
      route = 'users'; // Convención para crear (POST)
    }
    // Puedes añadir más lógica para otras convenciones si las tienes

    const functionJson = {
      scriptFile: 'index.js', // Apunta al archivo index.js dentro de la misma carpeta
      bindings: [
        {
          authLevel: 'function', // O "anonymous" para pruebas más sencillas
          type: 'httpTrigger',
          direction: 'in',
          name: 'req',
          methods: [method],
          route: `api/${route}`, // La ruta API que tus clientes usarán (ej. /api/users, /api/users/{id})
        },
        {
          type: 'http',
          direction: 'out',
          name: 'res',
        },
      ],
    };

    await fs.writeJson(
      path.join(functionFolder, 'function.json'),
      functionJson,
      { spaces: 2 },
    );
    console.log(
      `function.json para ${funcName} creado en ${functionFolder}/function.json`,
    );
  }

  console.log('Preparación de funciones completada.');
}

copyFunctions().catch((err) => {
  console.error('Error durante la preparación de archivos de función:', err);
  process.exit(1);
});
