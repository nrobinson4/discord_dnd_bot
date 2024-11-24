/**
 * Quest Handler Module
 * Manages quest-related functionality including tracking, updating, and displaying quest progress.
 * Handles the quest journal interface and quest completion logic for the RPG game.
 * 
*/
const { EmbedBuilder } = require('discord.js');
const { Users } = require('../../../database.js');
const { questData } = require('../questData.js');
async function handleQuest(interaction, user) {
    try {
        // Defer the reply to ensure the interaction doesn't time out
        await interaction.deferReply({ ephemeral: true });

        // Initialize questProgress if it doesn't exist
        if (!user.questProgress) {
            user.questProgress = {};
            await Users.update(
                { questProgress: {} },
                { where: { userId: user.userId } }
            );
        }

        const activeQuests = [];
        const completedQuests = [];
        const availableQuests = [];

        // Process all quests
        for (const [questId, questInfo] of Object.entries(questData)) {
            const userProgress = user.questProgress[questId];

            if (!userProgress) {
                // Quest hasn't been started yet
                availableQuests.push({
                    name: questInfo.name,
                    description: questInfo.description,
                    giver: questInfo.giver
                });
            } else if (userProgress.status === 'completed') {
                completedQuests.push({
                    name: questInfo.name,
                    rewards: questInfo.rewards
                });
            } else {
                // Quest is in progress
                const objectives = questInfo.objectives.map(obj => {
                    const progress = userProgress.objectives[obj.id] || 0;
                    return {
                        description: obj.description,
                        progress: `${progress}/${obj.required}`
                    };
                });

                activeQuests.push({
                    name: questInfo.name,
                    description: questInfo.description,
                    objectives: objectives,
                    rewards: questInfo.rewards
                });
            }
        }

        // Create the quest journal embed
        const questEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Quest Journal')
            .setDescription('Your current quest progress and available adventures.');

        // Add Active Quests field
        if (activeQuests.length > 0) {
            const activeQuestsText = activeQuests.map(quest => {
                const objectivesText = quest.objectives
                    .map(obj => `- ${obj.description}: ${obj.progress}`)
                    .join('\n');
                
                return `**${quest.name}**\n${quest.description}\n\nObjectives:\n${objectivesText}\n\nRewards:\n- ${quest.rewards.gold} gold\n- ${quest.rewards.exp} exp\n- ${quest.rewards.items.join(', ')}`;
            }).join('\n\n');

            questEmbed.addFields({
                name: '📋 Active Quests',
                value: activeQuestsText
            });
        } else {
            questEmbed.addFields({
                name: '📋 Active Quests',
                value: 'No active quests.'
            });
        }

        // Add Available Quests field
        if (availableQuests.length > 0) {
            const availableQuestsText = availableQuests.map(quest => 
                `**${quest.name}**\n${quest.description}\nGiven by: ${quest.giver}`
            ).join('\n\n');

            questEmbed.addFields({
                name: '❗ Available Quests',
                value: availableQuestsText
            });
        }

        // Add Completed Quests field
        if (completedQuests.length > 0) {
            const completedQuestsText = completedQuests.map(quest =>
                `**${quest.name}**`
            ).join('\n');

            questEmbed.addFields({
                name: '✅ Completed Quests',
                value: completedQuestsText
            });
        } else {
            questEmbed.addFields({
                name: '✅ Completed Quests',
                value: 'No completed quests.'
            });
        }

        await interaction.editReply({
            embeds: [questEmbed],
            ephemeral: true
        });

    } catch (error) {
        console.error('Error handling quest check:', error);
        if (interaction.deferred) {
            await interaction.editReply({
                content: 'An error occurred while checking your quests.',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: 'An error occurred while checking your quests.',
                ephemeral: true
            });
        }
    }
}

// Helper function to update quest progress
async function updateQuestProgress(user, questId, objectiveId, progress) {
    try {
        if (!user.questProgress[questId]) {
            user.questProgress[questId] = {
                status: 'in_progress',
                objectives: {}
            };
        }

        user.questProgress[questId].objectives[objectiveId] = progress;

        // Check if all objectives are completed
        const quest = questData[questId];
        const allCompleted = quest.objectives.every(obj => 
            (user.questProgress[questId].objectives[obj.id] || 0) >= obj.required
        );

        if (allCompleted) {
            user.questProgress[questId].status = 'completed';
        }

        await Users.update(
            { questProgress: user.questProgress },
            { where: { userId: user.userId } }
        );

        return allCompleted;
    } catch (error) {
        console.error('Error updating quest progress:', error);
        throw error;
    }
}

module.exports = {
    handleQuest,
    updateQuestProgress,
    questData
};