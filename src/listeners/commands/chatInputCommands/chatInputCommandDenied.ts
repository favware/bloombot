import { handleChatInputOrContextMenuCommandDenied } from '#utils/functions/deniedHelper';
import { Listener, type ChatInputCommandDeniedPayload, type Events, type UserError } from '@sapphire/framework';

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
		return handleChatInputOrContextMenuCommandDenied(error, payload);
	}
}
