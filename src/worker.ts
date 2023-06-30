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
			const answer = this.getAnswer(update.message?.text);
			if (answer) return Response.json({
				method: "sendMessage",
				chat_id: update.message?.chat.id,
				text: answer,
			});
		} catch (error: any) {
			return new Response(error, { status: 422 })
		}
		return new Response();
	},

	getAnswer(input: string | undefined): string | undefined {
		return input
			?.split("\n")
			.map(s => s.trim())
			.filter(s => s && !(s === "/start" || s === "/start@tebakgenderbot"))
			.map(name => {
				const { gender, confidence } = tebakgender(name);
				return `${name}: ${gender === "L" ? "laki-laki" : "perempuan"}   (${Math.round(100 * confidence)}% yakin)`;
			})
			.join("\n");
	}
};
