const fs = require('fs');

const requiredVariables = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
if (missingVariables.length > 0) {
  throw new Error(
    `Variáveis obrigatórias ausentes para o build: ${missingVariables.join(', ')}`
  );
}

// Cria a pasta de ambientes antes de escrever a configuração usada no build.
const targetDir = './src/environments';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Usa as variáveis do deploy para configurar a conexão com o Supabase em produção.
const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}'
};
`;

// O arquivo precisa existir antes de o Angular resolver os imports do ambiente.
fs.writeFileSync(`${targetDir}/environment.ts`, envConfigFile);
console.log('Arquivo environment.ts gerado dinamicamente com sucesso.');