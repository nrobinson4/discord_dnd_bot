/**
 * This file contains the data structure for the story content in the text adventure game.
 */


const nlp = require('compromise');

nlp.extend({
    words: {
        forge: 'Location',
        shop: 'Location',
        market: 'Location',
        tavern: 'Location',
        smith: 'Profession',
        merchant: 'Profession',
        guard: 'Profession',
        weapons: 'Item',
        armor: 'Item',
        tools: 'Item',
        anvil: 'Tool',
        hammer: 'Tool',
        gold: 'Currency',
        coins: 'Currency'
    }
});

const storyContent = {
    locations: {
        home: {
            id: 'home',
            name: 'Hearthfire',
            description: 'Your humble abode sits at the edge of Whiterun. A small cottage with a warm hearth and familiar comforts. Through the window, you can see the bustling village square in the distance.',
            availableActions: ['rest', 'enter_village_square', 'look_in_mirror', 'read_journal'],
            examineText: {
                enter_village_square: "You gather yourself and step outside, happily greated by the townspeople of Whiterun.",
                rest: 'You rest by the warm hearth, restoring your health and vigor.',
                look_in_mirror: 'You see your reflection - a promising adventurer ready to make their mark on the world.',
                read_journal: 'Your journal contains your thoughts and quest notes. Perhaps it\'s time to add new tales to its pages.'
            }
        },
        village_square: {
            id: 'village_square',
            name: 'Whiterun, Home of the Nords',
            description: 'The heart of Whiterun bustles with life. Merchants hawk their wares from wooden stalls, while guards patrol with watchful eyes. The legendary Bannered Mare tavern stands proudly to the north, its sign creaking in the wind. To the east, a path disappears into the mysterious Whispering Woods.',
            availableActions: ['talk_to_elder', 'enter_village_tavern', 'enter_forest_path', 'return_home', 'observe_guards', 'browse_merchant'],
            examineText: {
                observe_guards: 'The guards stand vigilant, their steel armor gleaming in the sunlight. One of them catches your eye and nods respectfully.',
                browse_merchant: 'The merchant\'s stall is filled with curiosities from distant lands - herbs, trinkets, and mysterious scrolls.',
                talk_to_elder: 'You approach Elder Olava, she seems to be lost in her thoughts about something... How ',
                enter_forest_path: 'You are drawn into the allure of the dense trees, your stomach tenses in anticipation as your boot strikes the firm earth.'
            }
        },
        village_tavern: {
            id: 'village_tavern',
            name: 'The Bannered Mare',
            description: 'The steady-beating heart of Whiterun. A place for adventurers, sorcerers, thieves, and warriors alike. Laughter and clashing cups fill the air, and it appears the innkeeper, Lillith, is ecstatic to see you. A bard plays a familiar tune in the corner.',
            availableActions: ['talk_to_innkeeper', 'listen_to_rumors', 'enjoy_a_mead', 'return_village_square', 'talk_to_bard', 'watch_bar_fight'],
            examineText: {
                enjoy_a_mead: 'The sweet taste of Nordic mead warms your belly. The innkeeper gives you a knowing wink.',
                listen_to_rumors: 'You lean in closer to hear the whispered conversations around you...',
                watch_bar_fight: 'Two patrons are engaged in a heated argument over the last bottle of Black-Briar Reserve.'
            }
        },
        forest_path: {
            id: 'forest_path',
            name: 'The Whispering Woods',
            description: 'Ancient trees loom overhead, their branches weaving a dark canopy that filters the sunlight into eerie patterns. The wind carries whispers that seem almost intelligible, speaking of secrets buried in time. Mysterious mushrooms glow faintly along the path.',
            availableActions: ['investigate_sounds', 'return_village_square', 'follow_lights', 'inspect_mushrooms'],
            examineText: {
                investigate_sounds: 'The whispers grow stronger as you focus... they seem to be calling your name.',
                inspect_mushrooms: 'The mushrooms pulse with an otherworldly blue light. They seem to respond to your presence.',
                follow_lights: 'Strange wisps of light dance between the trees, beckoning you deeper into the woods.'
            }
        },
    },
    dialogues: {
        talk_to_elder: {
            npc: 'Olava the Feeble',
            conversations: [
                {
                    condition: (user) => !user.questProgress.mainQuest,
                    text: "Ah, child... I've been expecting you. The whispers in the woods grow stronger each day. They speak of an ancient evil stirring beneath the earth. Will you help us uncover the truth?",
                    choices: [
                        {
                            text: "I'll help you, Elder Olava",
                            action: 'accept_main_quest',
                            response: "The fates smile upon us. Begin by investigating the Whispering Woods - but beware, not all whispers lead to wisdom.",
                            questUpdate: {
                                quest: 'mainQuest',
                                status: 'accepted',
                                objective: 'Investigate the source of the whispers in the Whispering Woods'
                            }
                        },
                        {
                            text: "What evil do you speak of?",
                            action: 'ask_more',
                            response: "The ancient texts speak of a sealed evil, bound by the first settlers of Whiterun. The whispers... they are its attempts to break free."
                        },
                        {
                            text: "I'm not ready for this task",
                            action: 'decline_quest',
                            response: "The paths of destiny are many, but all must be walked in their own time. Return when you feel ready."
                        }
                    ]
                },
                {
                    condition: (user) => user.questProgress.mainQuest === 'accepted',
                    text: "The whispers grow stronger with each passing day. Have you discovered anything in the woods?",
                    choices: [
                        {
                            text: "I'm still investigating",
                            action: 'quest_progress',
                            response: "Time grows short. Listen carefully in the woods - the whispers speak of ancient runes and hidden pathways."
                        },
                        {
                            text: "I found strange mushrooms",
                            action: 'report_mushrooms',
                            response: "Ah! The Luminous Caps! They grow strongest where ancient magic lingers. Follow their glow, they may lead you to what we seek."
                        }
                    ]
                }
            ]
        },
        talk_to_innkeeper: {
            npc: 'Lillith the Innkeeper',
            conversations: [
                {
                    text: "Welcome to the Bannered Mare! What can I get for you, friend?",
                    choices: [
                        {
                            text: "What's the latest news?",
                            action: 'ask_news',
                            response: "Well, strange lights have been seen in the Whispering Woods lately. And Old Olava's been more restless than usual, muttering about ancient evils."
                        },
                        {
                            text: "I'll have a mead",
                            action: 'order_drink',
                            response: "Here's our finest Black-Briar Reserve. Watch yourself though - it's got quite the kick!",
                            itemReward: "Black-Briar Mead"
                        },
                        {
                            text: "Tell me about Whiterun",
                            action: 'ask_about_town',
                            response: "Ah, Whiterun! Been here all my life. We're the heart of Skyrim, you know. Trade, warriors, mages - all sorts pass through here. Though lately..."
                        }
                    ]
                }
            ]
        },
        talk_to_bard: {
            npc: 'Mikael the Bard',
            conversations: [
                {
                    text: "Ah, a new face! Care to hear a tale of heroes and legends?",
                    choices: [
                        {
                            text: "Sing me a song",
                            action: 'request_song',
                            response: "🎵 In the time of ancient gods, warriors and kings, a tale was whispered of a power untold... 🎵"
                        },
                        {
                            text: "Tell me about the woods",
                            action: 'ask_about_woods',
                            response: "The Whispering Woods? Many songs speak of its mysteries. Some say the whispers are the voices of those who wandered too deep..."
                        }
                    ]
                }
            ]
        }
    },
    rumors: [
        "They say the glowing mushrooms in the Whispering Woods only appear to those marked by destiny...",
        "I heard Old Olava hasn't slept in days, constantly muttering about 'the seals weakening'...",
        "Strange lights were seen dancing in the woods last night. Some say they formed ancient runes...",
        "The guards found another adventurer wandering out of the woods, speaking in tongues...",
        "They say there's an ancient chamber beneath Whiterun, sealed since the time of the first settlers..."
    ]
};


module.exports = {
    storyContent
};