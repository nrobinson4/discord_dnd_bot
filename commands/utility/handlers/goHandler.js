/**
 * This file contains the handler for the go subcommand of the story command.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { storyContent } = require('../storyData.js');

// Handles the go subcommand
async function handleGoMenu(interaction, user) {
    // Get the current location of the user
    const location = storyContent.locations[user.currentLocation];
    if (!location) {
        return interaction.reply('Error: Invalid current location');
    }

    // Filter the available actions to only include travel actions
    const travelActions = location.availableActions.filter(action => {
        const isTravel = action.startsWith('visit_') ||
            action.startsWith('enter_') ||
            action.startsWith('return_');

        if (!isTravel) return false;

        // These are the prefixes for the different types of travel actions
        const prefix = /(visit_|enter_|return_)/;
        // Get the destination ID from the action
        const destinationId = action.replace(prefix, '');
        // Check if the destination exists and returns
        return storyContent.locations[destinationId] !== undefined;
    });

    if (travelActions.length === 0) {
        return interaction.reply('There\'s nowhere to go from here.');
    }

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Where would you like to go?');

    // Create action rows with buttons for each destination
    const actionRows = [];
    const buttons = travelActions.map(action => {
        const prefix = /(visit_|enter_|return_)/;
        const destinationId = action.replace(prefix, '');
        const destinationLocation = storyContent.locations[destinationId];

        return new ButtonBuilder()
            .setCustomId(`go_${action}`)
            .setLabel(destinationLocation.name)
            .setStyle(ButtonStyle.Primary);
    });

    // Split the buttons into rows of 5 since there is a limit of 5 buttons per row
    for (let i = 0; i < buttons.length; i += 5) {
        const row = new ActionRowBuilder()
            .addComponents(buttons.slice(i, Math.min(i + 5, buttons.length)));
        actionRows.push(row);
    }

    if (actionRows.length > 0) {
        await interaction.reply({
            embeds: [embed],
            components: actionRows
        });
    } else {
        await interaction.reply('Error: No valid destinations available.');
    }
}

module.exports = handleGoMenu;