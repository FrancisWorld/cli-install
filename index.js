import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';

import { exec, execSync } from 'child_process';

import color from 'picocolors';

const s = p.spinner();

async function allQuestions() {
	const group = await p.group(
		{
			system: () => p.select({
				message: 'Qual o seu sistema operacional?',
				options: [
					{ value: 'Windows', label: 'Windows' },
					{ value: 'Linux', label: 'Linux' },
					{ value: 'MacOS', label: 'MacOS' },
				],
			}),
			install: ({ results }) => {
				if (results.system === 'Windows') {
					return p.confirm({ message: 'Deseja instalar algum pacote?' });
				}
			},
			packages: ({ results }) => {
				if (results.install) {
					return p.multiselect({
						message: "Selecione os pacotes que deseja instalar:",
						options: [
							{ value: "VSCode", label: "Visual Studio Code", hint: "Developer Tools" },
							{ value: "Git.Git", label: "Git", hint: "Developer Tools" },
							{ value: "Discord.Discord", label: "Discord", hint: "ChatApp Electron" },
							{ value: "Google.Chrome", label: "Google Chrome", hint: "Navegador Web" },
						],
					});
				}
			},
		},
		{
			onCancel: ({ results }) => {
				p.cancel('Operação cancelada.');
				process.exit(0);
			},
		}
	);
	
	if (group.install) {
        for (const pack of group.packages) {
            await installPacks(pack).catch(() => {});
        }
    }

	const instalarMais = await p.confirm({ message: 'Deseja instalar mais algum pacote?' });

    if (instalarMais) {
        await allQuestions();
    }
}

async function installPacks(pack) {
	s.start(color.inverse(`Instalando ${pack} via winget`));
    return new Promise((resolve, reject) => {
        const command = `winget install ${pack}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                s.stop(color.bgRed(`Erro ao instalar ${pack}: ${error.message}`));
                reject(error);
            } else {
                s.stop(color.blue(`Pacote: ${pack} `) + color.bgGreen(`instalado com sucesso!`));
                resolve();
            }
        });
    });
}

async function main() {
	p.intro(color.inverse(`Bem vindo ao - Instalador Chico`));

	const continuar = await p.confirm({ message: 'Iniciar instalador chico?' })
	await allQuestions();

	if (!continuar) {
		p.cancel('Instalador Chico - Cancelado');
		process.exit(0);
	}

	p.outro("Finalizado.");
	process.exit(0);
}

main();
