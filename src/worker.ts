import tebakgender from 'tebakgender';

export default {
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (request.method == "POST" && pathname == "/webhook/telegram")
			return this.handleWebhookTelegram(request);
		return new Response(undefined, { status: 404 });
	},

	async handleWebhookTelegram(request: Request): Promise<Response> {
		try {
			const update = await request.json<Update>();
			return update.message?.text ? Response.json({
				method: "sendMessage",
				chat_id: update.message.chat.id,
				text: this.getAnswer(update.message?.text),
			}) : new Response();
		} catch (error: any) {
			return new Response(error, { status: 422 })
		}
	},

	getAnswer(input: string): string {
		return input
			.split("\n")
			.map(s => s.trim())
			.filter(s => s)
			.map(name => {
				const { gender, confidence } = tebakgender(name);
				return `${name}: ${gender} (${Math.round(100 * confidence)}% yakin)`;
			})
			.join("\n");
	}
};
