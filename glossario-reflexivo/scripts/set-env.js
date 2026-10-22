const fs = require('fs');

// Verifica se a pasta existe, se não, cria
const targetDir = './src/environments';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Monta o arquivo com as variáveis injetadas do sistema operacional (Vercel)
const envConfigFile = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}'
};
`;

// Escreve o arquivo fisicamente antes do Angular compilar
fs.writeFileSync(`${targetDir}/environment.ts`, envConfigFile);
console.log('Arquivo environment.ts gerado dinamicamente com sucesso.');