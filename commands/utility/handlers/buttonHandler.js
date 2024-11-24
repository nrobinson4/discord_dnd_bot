/**
 * Discord.js Button Interaction Handler for Story Game
 * Manages all button-based interactions in the game, including movement,
 * dialogue choices, actions, and quest updates.
 */

const { EmbedBuilder } = require('discord.js');
const { Users } = require('../../../database.js');
const { storyContent } = require('../storyData.js');
const handleDialogue = require('./dialogueHandler');
const handleLook = require('./lookHandler');

/**
 * Main handler function for all button interactions in the game
 * @param {Interaction} interaction - The Discord.js interaction object
 */
async function handleButtonInteraction(interaction) {
    // Fetch user data from database
    const user = await Users.findOne({ where: { userId: interaction.user.id } });
    // Split the customId into action and parameters
    const [action, ...params] = interaction.customId.split('_');

    switch (action) {
        case 'action':
            const actionName = params.join('_');
            const location = storyContent.locations[user.currentLocation];

            // Handle resting action
            if (actionName === 'rest') {
                // Validate resting location
                if (user.currentLocation !== 'home') {
                    return interaction.reply('You can only rest at home.');
                }

                // Get current health data
                const userData = await Users.findOne({ 
                    where: { userId: user.userId },
                    attributes: ['currentHealth', 'maxHealth']
                });
                
                // Check if healing is needed
                const currentHealth = userData.currentHealth;
                if (currentHealth >= userData.maxHealth) {
                    return interaction.reply('You are already at full health.');
                } else {
                    // Calculate and apply health restoration
                    const restorationAmount = Math.floor(currentHealth * 0.5);
                    await Users.update(
                        { currentHealth: currentHealth + restorationAmount },
                        { where: { userId: user.userId } }
                    );
                    return interaction.reply(`You have rested and restored ${restorationAmount} health points.`);
                }
            }

            // Handle NPC dialogue interactions
            if (actionName.startsWith('talk_to_')) {
                const npcId = actionName.replace('talk_to_', '');
                await handleDialogue(interaction, user, npcId);
                return;
            }

            // Handle rumor listening functionality
            if (actionName.startsWith('listen_to_')) {
                // Validate location for rumors
                if (user.currentLocation !== 'village_tavern') {
                    return interaction.reply('There are no rumors to listen to here.');
                }

                // Initialize or retrieve user's journal
                const journal = user.journal || { entries: [], rumors: [] };
                
                // Filter for unheard rumors
                const rumors = storyContent.rumors;
                const unheardRumors = rumors.filter(rumor => !journal.rumors.includes(rumor));

                if (unheardRumors.length === 0) {
                    return interaction.reply('You have already heard all the rumors.');
                }

                // Select and record new rumor
                const newRumor = unheardRumors[Math.floor(Math.random() * unheardRumors.length)];
                journal.rumors.push(newRumor);
                await Users.update(
                    { journal },
                    { where: { userId: user.userId } }
                );
                return interaction.reply(`You managed to overhear: ${newRumor}`);
            }

            // Handle movement between locations
            const isMovementAction = actionName.startsWith('enter_') ||
                actionName.startsWith('visit_') ||
                actionName.startsWith('return_');

            if (isMovementAction) {
                try {
                    // Extract destination from action name
                    const destinationId = actionName.replace(/(enter_|visit_|return_)/, '');
                    const newLocation = storyContent.locations[destinationId];

                    // Validate destination
                    if (!newLocation) {
                        console.error(`Invalid destination: ${destinationId}`);
                        return interaction.reply('Cannot travel to that location.');
                    }

                    // Update user location and display new location
                    await Users.update(
                        { currentLocation: destinationId },
                        { where: { userId: user.userId } }
                    );

                    user.currentLocation = destinationId;
                    await handleLook(interaction, user);
                } catch (error) {
                    console.error('Error updating location:', error);
                    await interaction.reply('An error occurred while traveling. Please try again.');
                }
            } else {
                // Handle examine actions for location objects
                const actionResult = location.examineText[actionName];
                if (!actionResult) {
                    console.log(`Warning: No examine text found for action "${actionName}" in location "${user.currentLocation}"`);
                    await interaction.reply('You perform the action, but nothing notable happens.');
                } else {
                    await interaction.reply(actionResult);
                }
            }
            break;

        case 'choice':
            try {
                // Process dialogue choice selections
                const npcID = params[0];
                const choiceAction = params.slice(1).join('_');
                
                const dialogue = storyContent.dialogues[`talk_to_${npcID}`];

                // Find applicable conversation based on user conditions
                const conversation = dialogue.conversations.find(conv =>
                    !conv.condition || conv.condition(user)
                );

                if (!conversation) {
                    return interaction.reply('Error: No valid conversation found.');
                }

                // Find selected choice
                const choice = conversation.choices.find(c => c.action === choiceAction);
                if (!choice) {
                    return interaction.reply('Error: Invalid choice.');
                }
    
                // Update quest progress if choice affects quests
                if (choice.questUpdate) {
                    await Users.update(
                        {
                            questProgress: {
                                ...user.questProgress,
                                [choice.questUpdate.quest]: choice.questUpdate.status
                            }
                        },
                        { where: { userId: user.userId } }
                    );
                }

                // Handle item rewards from dialogue choices
                if (choice.itemReward) {
                    let responseText = choice.response;
                    responseText += `\n\nReceived: ${choice.itemReward}`;
                    await interaction.reply(responseText);
                } else {
                    await interaction.reply(choice.response);
                }
            } catch (error) {
                console.error('Error handling dialogue choice:', error);
                await interaction.reply('An error occurred while processing your choice.');
            }
            break;

        case 'talk':
            // Direct dialogue handler
            await handleDialogue(interaction, user, params[1]);
            break;

        case 'go':
            try {
                // Alternative movement handler
                const actionName = params.join('_');
                const destinationId = actionName.replace(/(visit_|enter_|return_)/, '');
                const newLocation = storyContent.locations[destinationId];

                // Update user location
                await Users.update(
                    { currentLocation: destinationId },
                    { where: { userId: user.userId } }
                );

                user.currentLocation = destinationId;
                await handleLook(interaction, user);
            } catch (error) {
                console.error('Error updating location:', error);
                await interaction.reply('An error occurred while traveling. Please try again.');
            }
            break;
    }
}

module.exports = handleButtonInteraction;