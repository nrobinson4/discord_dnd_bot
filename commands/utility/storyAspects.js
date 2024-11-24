// This file contains the slash command for the story aspects of the game.

const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../database.js');
const handleLook = require('./handlers/lookHandler');
const handleTalkMenu = require('./handlers/talkHandler');
const handleQuest = require('./handlers/questHandler');
const handleGoMenu = require('./handlers/goHandler');
const handleButtonInteraction = require('./handlers/buttonHandler');
const handleJournal = require('./handlers/journalHandler');

// Exports the slash command and the execute function for the /story command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('story')
        .setDescription('Story Commands')
        // Each subcommand corresponds to a different story aspect
        .addSubcommand(subcommand =>
            subcommand
                .setName('look')
                .setDescription('Examine your surroundings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('talk')
                .setDescription('Talk to someone'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('go')
                .setDescription('Travel to a new location'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventory')
                .setDescription('Check your inventory'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quest')
                .setDescription('Check your quest progress'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('journal')
                .setDescription('View your journal')),

    // Handles the interaction when the /story command is used
    execute: async function (interaction) {
        const subcommand = interaction.options.getSubcommand();
        // Find the user in the database
        const user = await Users.findOne({ where: { userId: interaction.user.id } });

        if (!user) {
            return interaction.reply('You need to register first! Use /character_choice to create a character.');
        }

        // Based on the subcommand, call the appropriate handler
        switch (subcommand) {
            case 'look':
                await handleLook(interaction, user);
                break;
            case 'talk':
                await handleTalkMenu(interaction, user);
                break;
            case 'go':
                await handleGoMenu(interaction, user);
                break;
            case 'quest':
                await handleQuest(interaction, user);
                break;
            case 'journal':
                await handleJournal(interaction, user);
                break;
        }
    },

    handleButtonInteraction
};