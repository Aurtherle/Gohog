const { Aki } = require('aki-api');

const games = {}; // Store active Akinator games with user IDs as keys

const handler = async (m, { conn }) => {
    const command = m.text.trim().toLowerCase();

    if (command === 'المارد') {
        if (!games[m.sender]) {
            const region = 'ar'; // You can change the region if needed
            const aki = new Aki({ region });

            await aki.start();

            const question = aki.question;
            const answers = aki.answers;

            games[m.sender] = { aki };

            const questionText = `*سؤال:* ${question}\n\n*خيارات:*\n\n`;
            const optionsText = answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n");

            m.reply(`${questionText}${optionsText}`);
        } else {
            m.reply("لديك لعبة نشطة بالفعل!");
        }
    } else {
        if (!games[m.sender]) return; // No active game for the user

        // Check if the input is a valid number between 1 and 5
        if (!/^[1-5]$/i.test(m.text)) {
            m.reply("الرجاء اختيار رقم صحيح بين 1 و 5 للإجابة على السؤال.");
            return;
        }

        const guess = m.text;
        const game = games[m.sender];
        const aki = game.aki;

        // Convert the number to an index
        const index = parseInt(guess) - 1;

        await aki.step(index); // Pass the index to the Akinator API

        if (aki.progress >= 90) {
            const guessedCharacter = await aki.win();
            const guesses = guessedCharacter.guesses;
            const guessCount = guessedCharacter.guessCount;

            // Loop through the guesses to find a valid name and picture
            let characterName, characterImageUrl;
            for (const guess of guesses) {
                if (guess.name && guess.picture_path) {
                    characterName = guess.name;
                    characterImageUrl = guess.absolute_picture_path;
                    break; // Found a valid name and picture, exit the loop
                }
            }

            if (characterName && characterImageUrl) {
                // Send picture with caption
                const buttonMessage = {
                    image: {
                        url: characterImageUrl,
                    },
                    caption: `
                        *اييييزي!* 
                        الشخصية اللي تفكر فيها هي:
                        *${characterName}*
                    `,
                    headerType: 4,
                };

                m.reply(buttonMessage);
            } else {
                m.reply("عجزت اعرف، من كنت تفكر فيه؟");
            }

            delete games[m.sender]; // Delete the game
            return;
        } else {
            const question = aki.question;
            const answers = aki.answers;

            const questionText = `*سؤال:* ${question}\n\n*خيارات:*\n\n`;
            const optionsText = answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n");

            m.reply(`${questionText}${optionsText}`);
        }
    }
};

handler.command = /^(الماارد)$/i;
handler.tags = ['game'];

module.exports = handler;
