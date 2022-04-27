const { Client, Intents } = require('discord.js')
const { quiLoL } = require('./quiLoL.js')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.once('ready', () => {
	console.log("Connecté !")
});

console.log(process.env.RIOT_API_KEY)

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
	.setName('lol')
	.setDescription('Est-ce qu\'il LoL ?')
	.addStringOption(option =>
		option.setName('summonername')
			.setDescription('le nom d\'invocateur')
			.setRequired(true));


(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
				body: [data]
		});

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'lol') {
		const summonerName = interaction.options.getString('summonername')
		const response = await quiLoL(summonerName)
		await interaction.reply({content : response});
	}
});

client.login(process.env.DISCORD_TOKEN);
