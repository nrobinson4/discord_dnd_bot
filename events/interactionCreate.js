const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Handle button interactions
            if (interaction.isButton()) {
                // Import the handleButtonInteraction function from your story command file
                const { handleButtonInteraction } = require('../commands/utility/storyAspects.js');
                await handleButtonInteraction(interaction);
                return;
            }

            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                await command.execute(interaction);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            
            const errorMessage = {
                content: 'There was an error while executing this command!',
                ephemeral: true
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (e) {
                console.error('Error sending error message:', e);
            }
        }
    },
};