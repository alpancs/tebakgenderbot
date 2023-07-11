import tebakgender from 'tebakgender';

const genderToText: { [key: string]: string } = { L: "laki-laki 👨", P: "perempuan 👩" };

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
		if (input === "/start" || input === "/start@tebakgenderbot")
			return "Langsung aja ketik nama-nama orang yang mau ditebak gendernya.";
		return input
			?.split(/(?:\n|,)+/)
			.map(s => s.trim())
			.filter(s => s)
			.map(name => {
				const { gender, confidence } = tebakgender(name);
				return `${name}: ${genderToText[gender]}\t(${(100 * confidence).toFixed(1).replace(/\.0+$/, "")}% yakin)`;
			})
			.join("\n");
	},
};
