const swaggerAutogen = require('swagger-autogen')();
const path = require('path');
const fs = require('fs');

function extractSchemas(modelDir) {
  const schemas = {};
  const modelFiles = getAllFiles(modelDir);

  modelFiles.forEach((filePath) => {
    try {
      const modelModule = require(path.resolve(filePath));
      const modelName = path.basename(filePath, '.js');

      // Tambahkan logging untuk debugging  
      console.log(`Processing model: ${modelName}`, modelModule);

      // Coba berbagai strategi ekstraksi skema  
      let schema = null;

      // Strategi 1: Cek properti schema langsung  
      if (modelModule.schema) {
        schema = modelModule.schema;
      }
      // Strategi 2: Cek properti attributes (untuk Sequelize)  
      else if (modelModule.rawAttributes) {
        schema = {
          type: 'object',
          properties: Object.keys(modelModule.rawAttributes).reduce((acc, key) => {
            const attr = modelModule.rawAttributes[key];
            acc[key] = {
              type: mapSequelizeType(attr.type),
              description: attr.comment || ''
            };
            return acc;
          }, {})
        };
      }
      // Strategi 3: Cek struktur Mongoose  
      else if (modelModule.default && modelModule.default.schema) {
        schema = {
          type: 'object',
          properties: Object.keys(modelModule.default.schema.obj || {}).reduce((acc, key) => {
            acc[key] = {
              type: mapMongooseType(modelModule.default.schema.obj[key].type)
            };
            return acc;
          }, {})
        };
      }
      // Strategi 4: Coba ekstrak dari objek utama  
      else if (modelModule.obj) {
        schema = {
          type: 'object',
          properties: Object.keys(modelModule.obj).reduce((acc, key) => {
            acc[key] = { type: 'string' };
            return acc;
          }, {})
        };
      }
      // Strategi 5: Fallback generik  
      else {
        schema = {
          type: 'object',
          properties: Object.keys(modelModule).reduce((acc, key) => {
            // Hindari metode dan fungsi  
            if (typeof modelModule[key] !== 'function') {
              acc[key] = {
                type: typeof modelModule[key]
              };
            }
            return acc;
          }, {})
        };
      }

      // Simpan skema jika berhasil diekstrak  
      if (schema) {
        schemas[modelName] = schema;
      }
    } catch (error) {
      console.error(`Error processing model file ${filePath}:`, error);
    }
  });

  return schemas;
}

// Utility untuk mapping tipe data  
function mapSequelizeType(type) {
  const typeMap = {
    'STRING': 'string',
    'TEXT': 'string',
    'INTEGER': 'integer',
    'BIGINT': 'integer',
    'FLOAT': 'number',
    'DOUBLE': 'number',
    'DECIMAL': 'number',
    'DATE': 'string',
    'BOOLEAN': 'boolean'
  };
  return typeMap[type.key] || 'string';
}

function mapMongooseType(type) {
  const typeMap = {
    'String': 'string',
    'Number': 'number',
    'Date': 'string',
    'Boolean': 'boolean',
    'ObjectId': 'string'
  };
  return typeMap[type.name] || 'string';
}

// Fungsi lainnya tetap sama seperti sebelumnya  
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (path.extname(file) === '.js') {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function extractTags(controllerDir) {
  const tags = [];
  const controllerFiles = getAllFiles(controllerDir);

  controllerFiles.forEach((filePath) => {
    const controllerName = path.basename(filePath, '.js').replace('Controller', '');
    tags.push({
      name: controllerName,
      description: `Endpoints untuk ${controllerName}`
    });
  });

  return tags;
}

// Konfigurasi Swagger
const doc = {
  info: {
    title: 'DT-Api Documentation',
    description: 'Dokumentasi API untuk Dastrevas',
    version: '1.0.0',
  },
  host: process.env.HOST || 'api.gaspollmanagementcenter.com',
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT Authorization header'
    }
  },
  security: [{ bearerAuth: [] }],
  components: {
    schemas: extractSchemas('./src/models')
  },
  tags: extractTags('./src/controllers')
};

// Tentukan file output
const outputFile = './swagger-output.json';

// Tentukan routes
const routes = ['./src/routes.js'];

// Generate Swagger
swaggerAutogen(outputFile, routes, doc);
