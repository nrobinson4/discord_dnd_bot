const { EmbedBuilder } = require('discord.js');

function createLocationEmbed(location) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(location.name)
        .setDescription(location.description);
}

function createDialogueEmbed(npcName, text) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Talking to ${npcName}`)
        .setDescription(text);
}

function createTalkMenuEmbed() {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Who would you like to talk to?');
}

function createQuestEmbed(activeQuests, completedQuests) {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Quest Journal')
        .addFields(
            {
                name: 'Active Quests',
                value: activeQuests.length > 0 ? 
                    activeQuests.map(quest => 
                        `**${quest.name}**\nStatus: ${quest.status}`
                    ).join('\n\n') : 
                    'No active quests.'
            },
            {
                name: 'Completed Quests',
                value: completedQuests.length > 0 ? 
                    completedQuests.map(quest => 
                        `**${quest.name}**`
                    ).join('\n') : 
                    'No completed quests.'
            }
        );
}

function createTravelEmbed() {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Where would you like to go?');
}

function createErrorEmbed(errorMessage) {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Error')
        .setDescription(errorMessage);
}

module.exports = {
    createLocationEmbed,
    createDialogueEmbed,
    createTalkMenuEmbed,
    createQuestEmbed,
    createTravelEmbed,
    createErrorEmbed
};