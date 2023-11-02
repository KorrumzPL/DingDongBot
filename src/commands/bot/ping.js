import {
    SlashCommandBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { TiktokDL } from "@tobyg74/tiktok-api-dl";
import {
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
} from "@discordjs/voice";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping"),

    async execute(client, interaction) {
        await interaction.reply({ content: `Ping: \`${client.ws.ping}ms\``})
    },
};
