const fs = require('fs');

const requiredVariables = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
if (missingVariables.length > 0) {
  throw new Error(
    `Variáveis obrigatórias ausentes para o build: ${missingVariables.join(', ')}`
  );
}

// Garante que o diretório de ambientes exista antes da geração do arquivo.
const targetDir = './src/environments';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Monta o ambiente de produção com as credenciais fornecidas pela plataforma de deploy.
const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}'
};
`;

// Persiste o arquivo antes que o compilador Angular resolva os imports de ambiente.
fs.writeFileSync(`${targetDir}/environment.ts`, envConfigFile);
console.log('Arquivo environment.ts gerado dinamicamente com sucesso.');