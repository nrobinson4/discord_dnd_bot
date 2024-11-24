/**
 * This file contains the handler for the look command in the story aspect of the game.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Users } = require('../../../database.js');
const { storyContent } = require('../storyData.js');

// Handles the look command
async function handleLook(interaction, user) {
    const location = storyContent.locations[user.currentLocation];
    
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(location.name)
        .setDescription(location.description);

    // Creates a button for each available action in the location
    const actionRows = [];
    const buttons = location.availableActions.map(action => {
        const actionName = action.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return new ButtonBuilder()
            .setCustomId(`action_${action}`)
            .setLabel(actionName)
            .setStyle(ButtonStyle.Primary);
    });

    // Splits the buttons into rows of 5
    for (let i = 0; i < buttons.length; i += 5) {
        const row = new ActionRowBuilder()
            .addComponents(buttons.slice(i, i + 5));
        actionRows.push(row);
    }

    await interaction.reply({ 
        embeds: [embed],
        components: actionRows
    });
}

module.exports = handleLook;