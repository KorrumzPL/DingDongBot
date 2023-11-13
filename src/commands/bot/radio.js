import {
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";
import cheerio from "cheerio";

export default {
    data: new SlashCommandBuilder()
        .setName("radio")
        .setDescription("Play radio on voice channel")
        .addStringOption((option) =>
            option.setName("radio").setDescription("Radio station/City name").setRequired(true).setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        const url = `https://radio.garden/api/search?q=${focusedValue}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "accept: application/json"
            }
        })
        const json = await response.json();

        let data = []
        for (let i in json.hits.hits) {
            data.push(`${json.hits.hits[i]._source.title}-${json.hits.hits[i]._source.url.split("/")[3]}`)
        }

        await interaction.respond(
            data.map(choice => ({ name: choice, value: choice })),
        )
    },
    async execute(client, interaction) {
        const id = interaction.options.getString("radio").split("-")[1];
        console.log("id", id)
        const url = `https://radio.garden/api/ara/content/channel/${id}`;

        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel) {
            return await interaction.reply(
                `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`,
            );
        }

        const fetchStation = await fetch(url, {
                method: "GET",
                headers: {
                    "accept": "application/json"
                }
            });

        const json = await fetchStation.json();
        console.log("Json", json)


        if (json.error === "Not found") return interaction.reply("❌ | Station not found!");

        const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;
        const resource = createAudioResource(resourceUrl, {
            inlineVolume: true,
        });

        const player = createAudioPlayer();

        const connection = joinVoiceChannel({
            channelId: memberChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
        player.play(resource);

        const embed = new EmbedBuilder()
            .setTitle(`✅ Playing radio "${json.data.title} 🎶"`)
            .setDescription(`🌐 | **Country:** ${json.data.country.title} || 🗺️ | **Place:** ${json.data.place.title}`)
            .setFooter({ text: `🖥️ | Radio website: ${json.data.website}`})
            .setTimestamp()
            .setColor("Green")

        await interaction.reply({ embeds: [embed] })
    },
};