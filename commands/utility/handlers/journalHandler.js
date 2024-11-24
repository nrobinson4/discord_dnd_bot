/**
 * Handles the journal command when called by the user.
 */

const { EmbedBuilder } = require('discord.js');

// Handles the journal command 
async function handleJournal(interaction, user) {
    try {
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });

        // Check if user or journal data exists
        if (!user || !user.journal) {
            return await interaction.editReply({
                content: 'Your journal is empty.',
                ephemeral: true
            });
        }

        // Ensure journal properties exist
        const journal = {
            entries: user.journal.entries || [],
            rumors: user.journal.rumors || []
        };

        // Create embed only if there's content to show
        if (journal.entries.length === 0 && journal.rumors.length === 0) {
            return await interaction.editReply({
                content: 'Your journal is empty.',
                ephemeral: true
            });
        }

        const journalEmbed = new EmbedBuilder()
            .setTitle(`${user.name}'s Journal`)
            .setColor('#0099ff')
            .setDescription('Check what you\'ve written down so far!');

        // Add rumors field only if there are rumors
        if (journal.rumors.length > 0) {
            journalEmbed.addFields({
                name: 'Rumors Collected',
                value: journal.rumors.join('\n').slice(0, 1024) // Discord's field value limit
            });
        }

        // Add entries field only if there are entries
        if (journal.entries.length > 0) {
            journalEmbed.addFields({
                name: 'Journal Entries',
                value: journal.entries.join('\n').slice(0, 1024)
            });
        }

        return await interaction.editReply({
            embeds: [journalEmbed],
            ephemeral: true
        });

    } catch (error) {
        console.error('Error in handleJournal:', error);
        
        // Check if the interaction is still valid before attempting to reply
        if (interaction.deferred) {
            await interaction.editReply({
                content: 'There was an error displaying your journal. Please try again.',
                ephemeral: true
            }).catch(console.error);
        } else if (!interaction.replied) {
            await interaction.reply({
                content: 'There was an error displaying your journal. Please try again.',
                ephemeral: true
            }).catch(console.error);
        }
    }
}

module.exports = handleJournal;