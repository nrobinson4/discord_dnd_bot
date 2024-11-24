/**
 * Handles dialogue interactions between the player and NPCs.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { storyContent } = require('../storyData.js');
const { Users } = require('../../../database.js');

// Handles the dialogue interactions with an NPC
async function handleDialogue(interaction, user, npcId) {
    // Gets list of dialogues from the specific NPC
    const dialogue = storyContent.dialogues[`talk_to_${npcId}`];
    const currentConversation = dialogue.conversations.find(conv =>
        !conv.condition || conv.condition(user)
    );

    // Creates an embed with the current conversation
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Talking to ${dialogue.npc}`)
        .setDescription(currentConversation.text);

    // Allows user to select dialogue options
    const row = new ActionRowBuilder();
    currentConversation.choices.forEach((choice, index) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`choice_${npcId}_${choice.action}`)
                .setLabel(choice.text)
                .setStyle(ButtonStyle.Secondary)
        );
    });

    await interaction.reply({
        embeds: [embed],
        components: [row]
    });
}

async function handleChoiceSelection(interaction, user) {
    try {
        await interaction.deferReply();

        const [_, npcId, action] = interaction.customId.split('_');

        const dialogue = storyContent.dialogues[`talk_to_${npcId}`];
        if (!dialogue) {
            return interaction.editReply('Error: Dialogue not found.');
        }

        const currentConversation = findValidConversation(dialogue, user);
        const selectedChoice = currentConversation.choices.find(c => c.action === action);

        if (!selectedChoice) {
            return interaction.editReply('Invalid choice selected.');
        }

        // Handle quest-related actions
        await updateQuestProgress(user, selectedChoice.questUpdate);

        // Handle item rewards
        await giveItemReward(user, selectedChoice.itemReward);

        const responseEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${dialogue.npc}'s Response`)
            .setDescription(selectedChoice.response);

        if (selectedChoice.questUpdate) {
            responseEmbed.addFields({
                name: 'Quest Updated',
                value: getQuestProgressText(selectedChoice.questUpdate, user.questProgress)
            });
        }

        await interaction.editReply({
            embeds: [responseEmbed],
            components: [] // Remove the choice buttons
        });

        // If this choice leads to a new conversation, handle it
        if (selectedChoice.nextConversation) {
            const newConversation = dialogue.conversations.find(c => c.id === selectedChoice.nextConversation);
            if (newConversation) {
                const newEmbed = buildDialogueEmbed(dialogue, newConversation, user);
                const newRow = buildChoiceButtons(npcId, newConversation.choices);

                await interaction.followUp({
                    embeds: [newEmbed],
                    components: [newRow]
                });
            }
        }
    } catch (error) {
        console.error('Error handling choice selection:', error);
        await interaction.editReply({
            content: 'An error occurred while processing your choice.',
            ephemeral: true
        });
    }
}

async function initializeQuestProgress(user) {
    if (!user.questProgress) {
        user.questProgress = {};
        await Users.update(
            { questProgress: {} },
            { where: { userId: user.userId } }
        );
    }
}

async function updateQuestProgress(user, questUpdate) {
    if (questUpdate) {
        const currentProgress = user.questProgress[questUpdate.quest] || {};

        user.questProgress[questUpdate.quest] = {
            ...currentProgress,
            status: questUpdate.status,
            currentObjective: questUpdate.objective,
            updatedAt: new Date().toISOString()
        };

        await Users.update(
            { questProgress: user.questProgress },
            { where: { userId: user.userId } }
        );
    }
}

async function giveItemReward(user, itemReward) {
    if (itemReward) {
        if (!user.inventory) {
            user.inventory = [];
        }

        user.inventory.push(itemReward);

        await Users.update(
            { inventory: user.inventory },
            { where: { userId: user.userId } }
        );
    }
}

function findValidConversation(dialogue, user) {
    // Check for quest-specific dialogue first
    for (const conv of dialogue.conversations) {
        if (conv.condition) {
            const result = evaluateCondition(conv.condition, user);
            if (result) return conv;
        }
    }

    // Return default conversation if no conditions met
    return dialogue.conversations.find(conv => !conv.condition);
}

function evaluateCondition(condition, user) {
    if (typeof condition === 'function') {
        return condition(user);
    }
    return false;
}

function buildDialogueEmbed(dialogue, conversation, user) {
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Talking to ${dialogue.npc}`)
        .setDescription(conversation.text);

    // Add quest-related information if applicable
    if (conversation.questInfo) {
        const questStatus = user.questProgress[conversation.questInfo.questId];
        if (questStatus) {
            embed.addFields({
                name: 'Quest Progress',
                value: getQuestProgressText(conversation.questInfo, questStatus)
            });
        }
    }

    return embed;
}

function buildChoiceButtons(npcId, choices) {
    const row = new ActionRowBuilder();

    choices.forEach((choice) => {
        const button = new ButtonBuilder()
            .setCustomId(`choice_${npcId}_${choice.action}`)
            .setLabel(choice.text)
            .setStyle(
                choice.action.includes('accept_quest') ? ButtonStyle.Success :
                choice.action.includes('complete_quest') ? ButtonStyle.Primary :
                ButtonStyle.Secondary
            );

        row.addComponents(button);
    });

    return row;
}

function getQuestProgressText(questInfo, questStatus) {
    if (questStatus.status === 'accepted') {
        return `Current Objective: ${questStatus.currentObjective}`;
    } else if (questStatus.status === 'completed') {
        return 'Quest Completed';
    }
    return 'Quest Available';
}

module.exports = handleDialogue;
module.exports.handleChoiceSelection = handleChoiceSelection;