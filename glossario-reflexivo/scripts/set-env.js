const fs = require('fs');

const requiredVariables = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
if (missingVariables.length > 0) {
  throw new Error(
    `Variáveis obrigatórias ausentes para o build: ${missingVariables.join(', ')}`
  );
}

// Cria a pasta de ambientes se ela ainda não existir.
const targetDir = './src/environments';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Gera a configuração de produção com as variáveis do deploy.
const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}'
};
`;

// Salva o arquivo antes da compilação do Angular.
fs.writeFileSync(`${targetDir}/environment.ts`, envConfigFile);
console.log('Arquivo environment.ts gerado dinamicamente com sucesso.');