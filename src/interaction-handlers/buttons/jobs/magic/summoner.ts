import { BloombotEmojis } from '#lib/util/emojis';
import { formatJobUpdateMessage } from '#lib/util/functions/formatJobUpdateMessage';
import { handleJobOrRoleButtonClick } from '#lib/util/functions/handleJobOrRoleButtonClick';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>) {
		return interaction.editReply({
			content: formatJobUpdateMessage(BloombotEmojis.Summoner, $Enums.Jobs.Summoner)
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith('job-summoner')) return this.none();

		await handleJobOrRoleButtonClick(interaction, $Enums.Roles.MagicRangedDPS, $Enums.Jobs.Summoner);

		return this.some();
	}
}
