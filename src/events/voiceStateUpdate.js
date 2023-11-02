import { getVoiceConnection } from "@discordjs/voice";

export default async function voiceStateUpdate(client, oldState, newState) {
    if (oldState.member.id === client.user.id && !newState.channel) {
        const connection = getVoiceConnection(oldState.guild.id);
        if (connection) {
            connection.destroy();
        }
    }
}
