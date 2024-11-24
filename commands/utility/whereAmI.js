/**
 * Contains the slash command for finding out the user's current location.
 */
const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../database.js');

// Exports the slash command and the execute function for the /whereami command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('whereami')
        .setDescription('Find out your current location'),

    // Handles the interaction when the /whereami command is used
    async execute(interaction) {
        try {
            const user = await Users.findOne({
                where: { userId: interaction.user.id }
            });

            if (!user) {
                return interaction.reply('You are not registered! Use /character_choice first.');
            }
            // Display the user's current location from the database
            await interaction.reply({
                content: `Current status:\nLocation: ${user.currentLocation}`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Status check error:', error);
            await interaction.reply('Error checking status. Please try again.');
        }
    }
};