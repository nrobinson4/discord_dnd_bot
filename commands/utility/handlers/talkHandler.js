// Description: Handles the talk menu interaction.

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { storyContent } = require('../storyData.js');

// Handles the talk menu interaction
async function handleTalkMenu(interaction, user) {
    const location = storyContent.locations[user.currentLocation];
    // Filter out the actions that start with 'talk_to_'
    const talkActions = location.availableActions.filter(action => action.startsWith('talk_to_'));
    
    if (talkActions.length === 0) {
        return interaction.reply('There\'s no one here to talk to.');
    }

    // Create a button for each talk action
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Who would you like to talk to?');

    // Create a button for each talk action
    const row = new ActionRowBuilder();
    talkActions.forEach(action => {
        // Convert the action name to a readable NPC name, e.g. talk_to_elder -> Elder
        const npcName = action.replace('talk_to_', '').split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        // Add a button for each NPC
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`talk_${action}`)
                .setLabel(npcName)
                .setStyle(ButtonStyle.Primary)
        );
    });

    // Send the message with the talk menu
    await interaction.reply({
        embeds: [embed],
        components: [row]
    });
}

module.exports = handleTalkMenu;