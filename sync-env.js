const fs = require('fs');
const path = require('path');

const rootEnvPath = path.resolve(__dirname, '.env'); // Updated to reference .env in the same directory
const frontendEnvPath = path.resolve(__dirname, './uvluate/.env.local');

if (!fs.existsSync(rootEnvPath)) {
    console.error('Error: Root .env file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(rootEnvPath, 'utf8');
const reactAppVars = envContent
    .split('\n')
    .filter(line => line.startsWith('REACT_APP_'))
    .join('\n');

fs.writeFileSync(frontendEnvPath, reactAppVars);

console.log('Environment variables synced to frontend/.env.local');
