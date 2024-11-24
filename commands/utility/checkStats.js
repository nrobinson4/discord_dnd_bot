/**
 * This file contains the slash command for checking the user's character stats.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Users } = require('../../database.js');

// Exports the slash command and the execute function for the /check_stats command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_stats')
        .setDescription('Check your character stats!'),

    async execute(interaction) {
        try {
            const user = await Users.findOne({
                where: { userId: interaction.user.id }
            });

            if (!user) {
                await interaction.reply({
                    content: 'You haven\'t created a character yet! Use `/character_choice` to create one.',
                    ephemeral: true
                });
                return;
            }

            // Creates an embed with the user's character stats from the database
            const statsEmbed = new EmbedBuilder()
                .setTitle(`${user.name}'s Character Stats`)
                // Capitalize the first letter of the class name
                .setDescription(`Class: ${user.characterClass.charAt(0).toUpperCase() + user.characterClass.slice(1)}`)
                .addFields(
                    { name: 'Strength', value: `${user.strengthStat}`, inline: true },
                    { name: 'Dexterity', value: `${user.dexterityStat}`, inline: true },
                    { name: 'Intelligence', value: `${user.intelligenceStat}`, inline: true },
                    { name: 'Charisma', value: `${user.charismaStat}`, inline: true },
                    { name: 'Level', value: `${user.characterLevel}`, inline: true },
                    { name: 'Current Health', value: `${user.currentHealth}`, inline: true },
                )
                .setColor('#0099ff');

            await interaction.reply({ embeds: [statsEmbed] });

        } catch (error) {
            console.error('Error checking stats:', error);
            await interaction.reply({
                content: 'There was an error checking your stats.',
                ephemeral: true
            });
        }
    },
};