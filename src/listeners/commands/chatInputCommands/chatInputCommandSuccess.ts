import { handleChatInputOrContextMenuCommandSuccess } from '#utils/functions/successHelper';
import { Listener, LogLevel, type ChatInputCommandSuccessPayload, type Events } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';

export class ChatInputCommandSuccess extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override run(payload: ChatInputCommandSuccessPayload) {
		return handleChatInputOrContextMenuCommandSuccess(payload);
	}

	public override onLoad() {
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}
}
