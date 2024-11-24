/**
 * Quest Data
 */

const questData = {
    collect_herbs: {
        name: "Collect Herbs",
        description: "The innkeeper would like some fresh herbs for her newest drinks.",
        objectives: [
            {
                id: "collect_herbs",
                description: "Gather an herb from the Whispering Woods",
                required: 1,
                current: 0
            }
        ],
        rewards: {
            experience: 50,
            gold: 10
        }
    }
}

module.exports = questData;