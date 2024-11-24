/**
 * This command allows users to select a character class for the game.
 */

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { Users } = require('../../database.js');

// Define base stats for each class
const CLASS_STATS = {
    barbarian: {
        strength: 18,
        dexterity: 14,
        intelligence: 10,
        charisma: 12
    },
    bard: {
        strength: 10,
        dexterity: 14,
        intelligence: 12,
        charisma: 18
    },
    paladin: {
        strength: 16,
        dexterity: 10,
        intelligence: 14,
        charisma: 14
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('character_choice')
        .setDescription('Pick your character class!'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Create an embed with character class options
            const embed = new EmbedBuilder()
                .setTitle('Character Classes')
                .setDescription('Choose your character class by clicking a button below!')
                .addFields(
                    { name: 'Barbarian', value: '**Stats:**\n- Strength: 18\n- Dexterity: 14\n- Intelligence: 10\n- Charisma: 8', inline: true },
                    { name: 'Bard', value: '**Stats:**\n- Strength: 10\n- Dexterity: 14\n- Intelligence: 12\n- Charisma: 18', inline: true },
                    { name: 'Paladin', value: '**Stats:**\n- Strength: 16\n- Dexterity: 12\n- Intelligence: 10\n- Charisma: 16', inline: true }
                )
                .setColor('#0099ff');

            // Create a row of buttons for each class
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('barbarian')
                        .setLabel('Barbarian')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('bard')
                        .setLabel('Bard')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('paladin')
                        .setLabel('Paladin')
                        .setStyle(ButtonStyle.Primary)
                );

            const message = await interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            });

            // Create a collector to listen for button interactions
            const collector = message.createMessageComponentCollector({ 
                time: 30000
            });

            // Handle button interactions
            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({ 
                        content: "This isn't your character selection!", 
                        ephemeral: true 
                    });
                    return;
                }

                // Get the class selected by the user
                const characterClass = buttonInteraction.customId;
                const userId = buttonInteraction.user.id;
                const username = buttonInteraction.user.username;

                try {
                    // Get stats for the selected class
                    const classStats = CLASS_STATS[characterClass];
                    
                    // Use upsert to create or update the user with class stats
                    const [user, created] = await Users.upsert({
                        userId: userId,
                        name: username,
                        characterClass: characterClass,
                        strengthStat: classStats.strength,
                        dexterityStat: classStats.dexterity,
                        intelligenceStat: classStats.intelligence,
                        charismaStat: classStats.charisma
                    }, {
                        returning: true
                    });

                    // Create a detailed response message
                    const responseEmbed = new EmbedBuilder()
                        .setTitle(`${username}'s Character`)
                        .setDescription(`You are now a ${characterClass.charAt(0).toUpperCase() + characterClass.slice(1)}!`)
                        .addFields(
                            { name: 'Strength', value: `${classStats.strength}`, inline: true },
                            { name: 'Dexterity', value: `${classStats.dexterity}`, inline: true },
                            { name: 'Intelligence', value: `${classStats.intelligence}`, inline: true },
                            { name: 'Charisma', value: `${classStats.charisma}`, inline: true }
                        )
                        .setColor('#00FF00');

                    await buttonInteraction.update({
                        content: created ? 'Character created successfully!' : 'Character updated successfully!',
                        embeds: [responseEmbed],
                        components: []
                    });

                    // Log the update for verification
                    console.log('Character updated:', {
                        userId,
                        class: characterClass,
                        stats: classStats
                    });

                } catch (error) {
                    console.error('Database error:', error);
                    await buttonInteraction.update({
                        content: 'There was an error saving your character choice. Please try again.',
                        embeds: [],
                        components: []
                    });
                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: "You did not choose a class in time!",
                        embeds: [],
                        components: []
                    }).catch(console.error);
                }
            });

        } catch (error) {
            console.error('Command error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while processing your choice.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'An error occurred while processing your choice.'
                });
            }
        }
    },
};