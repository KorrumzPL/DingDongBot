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
    .setName("play")
    .setDescription("Play")
    .addStringOption((option) =>
      option.setName("url").setDescription("Tiktok url").setRequired(true),
    ),

  async execute(client, interaction) {
    await interaction.deferReply();
    const tiktok_url = interaction.options.getString("url");

    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
      return await interaction.reply(
        "You must be in a voice channel to use this command.",
      );
    }
    const result = await TiktokDL(tiktok_url, {
      version: "v3",
    });

    if (result && result.result && result.result.video2) {
      const response = await fetch(result.result.video2);
      if (!response) {
        return await interaction.editReply(
          `❌ | Something has gone terribly wrong! Probably you provided the wrong song URL! (url: ${tiktok_url})`,
        );
      }

      const audio = response.body;

      const resource = await createAudioResource(audio, {
        inlineVolume: true,
      });

      const player = createAudioPlayer();

      player.on("idle", async () => {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
          connection.destroy();

          const customId =
            result.result.video2.length <= 100
              ? `play_again=${result.result.video2}`
              : "play_again";

          const playAgain = new ButtonBuilder()
            .setCustomId(customId)
            .setLabel("Play again")
            .setStyle(ButtonStyle.Success);

          const downloadMP3 = new ButtonBuilder()
            .setLabel("Download mp3")
            .setURL(result.result.video2)
            .setStyle(ButtonStyle.Link);

          const row = new ActionRowBuilder().addComponents(
            playAgain,
            downloadMP3,
          );

          const endedPlaying = new EmbedBuilder()
            .setTitle(`✅ | Ended playing`)
            .setDescription(`🎶 | [sound](${tiktok_url})`)
            .setColor("Green");

          if (customId.length > 100) return row.components[0].setDisabled(true);
          await interaction.editReply({
            embeds: [endedPlaying],
            components: [row],
          });
        }
      });

      const connection = await joinVoiceChannel({
        channelId: memberChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);
      player.play(resource);

      const addedToQueue = new EmbedBuilder()
        .setTitle(`✅ Sound playing!`)
        .setDescription(`🎶 | [sound](${tiktok_url})`)
        .setColor("Blurple");

      await interaction.editReply({ embeds: [addedToQueue] });
    } else {
      return await interaction.editReply(
        `❌ | Invalid Tiktok URL provided: ${tiktok_url}`,
      );
    }
  },
};
