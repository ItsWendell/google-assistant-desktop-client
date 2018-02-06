<template>
	<div
		id="conversation"
		class="conversation">
		<div class="intro__bubble">
			<div class="intro__bubble molecule">
				<img
					src="static/molecule.svg"
					style="max-width: 12rem"/>
			</div>
			<div class="conversation__bubble is-active conversation__bubble--assistant">
				<div class="bubble is-active bubble--assistant">
					Hi, how can I help?
				</div>
			</div>
		</div>
		<div
			v-for="message in messages"
			:key="message.id"
			class="conversation__line">
			<v-slide-y-transition mode="out-in">
				<v-card
					v-if="message.url != null"
					class="elevation-3 info-card">
					<v-card-media
						v-if="message.url.image"
						:src="message.url.image"
						height="150px"
					/>
					<v-card-text>
						{{ message.text }}
					</v-card-text>
					<v-divider/>
					<v-card-actions class="white">
						<h3 class="action-title">{{ message.url.title }}</h3>
						<a
							target="_blank"
							:href="message.url.url">https://{{ message.url.domain }}</a>
					</v-card-actions>
				</v-card>
				<div
					v-else
					class="conversation__bubble is-active"
					transition="slide-y-reverse-transition"
					:class="{
						'conversation__bubble--user': message.type === 'outgoing',
						'conversation__bubble--assistant': message.type === 'incoming'}"
					data-offset="0">
					<div
						v-if="message.type === 'incoming'"
						class="conversation__molecule">
						<img
							src="static/molecule.svg"
							style="max-width: 12rem"
						/>
					</div>
					<div
						class="bubble is-active"
						:class="{
							'bubble--user': message.type === 'outgoing',
							'bubble--assistant': message.type === 'incoming'}"
						v-html="message.text" />
				</div>
			</v-slide-y-transition>
		</div>
		<div
			v-if="status === 'waiting'"
			class="conversation__bubble is-active conversation__bubble--assistant">
			<div class="bubble is-active bubble--assistant">
				<div class="conversation__molecule">
					<div class="molecule"/>
				</div>
				<img
					class="loading-icon"
					src="static/waiting.svg"
					style="max-height: 50px" />
			</div>
		</div>
		<div
			v-if="speechTextBuffer.length"
			class="conversation__bubble is-active conversation__bubble--user">
			<div class="bubble is-active bubble--user">
				<div
					v-for="speechText in speechTextBuffer"
					:key="speechText.key"
					:class="{
						'speech-result--stable': speechText.stability >= 0.7,
						'speech-result--unstable': speechText.stability < 0.7}">
					{{ speechText.transcript }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Conversation',
	components: { },
	data: () => ({

	}),
	computed: {
		/** Assistant status in store */
		status: () => Window.Store.state.assistant.status,
		/** Messages in store for conversation */
		messages: () => {
			if (Window.Store) {
				return Window.Store.state.assistant.messages;
			}
			return [];
		},
		/** Buffer for partial speech */
		speechTextBuffer: () => Window.Store.state.assistant.speechTextBuffer,
	},
	updated() {
		/** Scroll chat window when element is updated */
		const conversation = Window.App.$el.querySelector('.main-card');
		if (conversation) {
			conversation.scrollTop = conversation.clientHeight + 100000000;
		}
	},
};
</script>

<style>

.intro__bubble .bubble:before {
    content: "\A";
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 11px solid rgb(224, 224, 224);
    position: fixed;
    top: 0px;
}

  .loading-icon {
	max-height: 46px;
    margin: -20px 13px;
    vertical-align: middle;
  }

  .state-image {
    max-width: 35%;
  }

  .speech-result--unstable {
    opacity: 0.35;
  }

  /** From Google */

  .conversation {
    text-align: left;
    overflow: hidden;
    overflow-x: hidden;
  }
  .conversation__bubble { display: block; position: relative; -ms-transform: translateY(700px); transform: translateY(700px); transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.5s; will-change: transform; }

.conversation__bubble.conversation__bubble__intl { -ms-transform: translateY(210px); transform: translateY(210px); transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.5s; }

.conversation__bubble.conversation__bubble__intl.is-active { -ms-transform: translateY(0); transform: translateY(0); }

.conversation__bubble.conversation__bubble__intl.is-active .conversation__molecule { opacity: 1; }

.conversation__bubble--user, .conversation__bubble--user2 { text-align: right; z-index: 1; }

.conversation__bubble--user .bubble, .conversation__bubble--user2 .bubble { margin-right: 10px; text-align: left; }

@media only screen and (max-width: 400px) { .conversation__bubble--user .bubble, .conversation__bubble--user2 .bubble { margin-right: 0; } }

.homepage .conversation__bubble--user .bubble, .homepage .conversation__bubble--user2 .bubble { margin-right: 0; }

@media only screen and (min-width: 1140px) { .homepage .conversation__bubble--user .bubble, .homepage .conversation__bubble--user2 .bubble { margin-right: 20px; } }

.conversation__bubble--user2 { text-align: left; }

.conversation__bubble--assistant .bubble { margin-left: 75px; }

@media only screen and (min-width: 1140px) { .conversation__bubble--assistant .bubble { margin-left: 70px; top: 0; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 65px; } }

@media only screen and (max-width: 800px) { .conversation__bubble--assistant .bubble { margin-left: 60px; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 42px; } }

@media only screen and (max-width: 400px) { .conversation__bubble--assistant .bubble { margin-left: 46px; }
  .homepage .conversation__bubble--assistant .bubble { margin-left: 32px; } }

.conversation__bubble--replay { margin-top: 80px; opacity: 0; text-align: center; -ms-transform: none; transform: none; }

@media only screen and (max-width: 800px) { .conversation__bubble--replay { display: none; } }

.conversation__bubble--replay.is-active { opacity: 1; }

.conversation__bubble.is-active { -ms-transform: translateY(0); transform: translateY(0); }

.conversation__bubble.is-active .conversation__molecule { opacity: 1; }

.conversation__bubble.has-gap { margin-top: 75px; }

.conversation__bubble.is-leaving { opacity: .5; }

@media only screen and (max-width: 800px) { .conversation__bubble.is-leaving { opacity: 1; } }

.conversation__bubble .bubble { vertical-align: middle; }

.conversation__bubble .at-google { color: #858585; }

.conversation__card { border-radius: 2px; display: block; margin-top: 0; opacity: 0; -ms-transform: translateY(700px); transform: translateY(700px); transition: opacity 1.2s, transform 1s cubic-bezier(0.2, 0, 0.2, 1); width: auto; }

.conversation__card.conversation__card__intl { -ms-transform: translateY(210px) !important; transform: translateY(210px) !important; }

@media only screen and (min-width: 1140px) { .conversation__card { width: auto; } }

@media only screen and (max-width: 800px) { .conversation__card { width: 250px; } }

@media only screen and (max-width: 400px) { .conversation__card { width: 203px; } }

.conversation__card.is-active { opacity: 1; -ms-transform: translateY(0); transform: translateY(0); width: 100%; }

@media only screen and (min-width: 1140px) { .homepage .conversation__card.is-active { margin-left: -17px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card.is-active { width: 270px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card { margin-top: 0; } }

@media only screen and (max-width: 1139px) { .homepage .conversation__card { margin-top: 20px; } }

@media only screen and (max-width: 800px) { .homepage .conversation__card { margin-top: 0; } }

.conversation__card--multi { box-shadow: none; font-size: 0; }

.conversation__card--multi img { box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18); display: inline-block; width: 30%; }

.conversation__card--multi img:nth-child(2) { margin: 0 5%; }

.conversation__face { display: inline-block; margin-right: 10px; opacity: 0; transition: opacity .75s; vertical-align: middle; }

@media only screen and (min-width: 1700px) { .conversation__face { margin-left: 13px; margin-right: 25px; } }

@media only screen and (max-width: 800px) { .conversation__face { margin-right: 1px; } }

.help-bubbles__bubble.is-active .conversation__face { opacity: 1; }

.conversation__face img { height: 50px; width: 50px; }

.conversation__annotation { color: #8c8c8c; font-size: 12px; font-style: italic; font-weight: 300; margin-bottom: 5px; margin-left: 55px; opacity: 0; text-align: right; transition: opacity .75s .3s; width: 305.063px; }

@media only screen and (max-width: 800px) { .conversation__annotation { margin-left: 48px; width: 249.597px; } }

@media only screen and (min-width: 1700px) { .conversation__annotation { margin-left: 92px; width: 374.3955px; } }

@media only screen and (max-width: 400px) { .conversation__annotation { margin-left: 32px; width: 194.131px; } }

.help-bubbles__bubble.is-active .conversation__annotation { opacity: 1; }

.conversation__molecule { display: inline-block; height: 105px; left: -18px; opacity: 0; position: absolute; top: -18px; transition: opacity .75s; vertical-align: middle; width: 105px; z-index: -1; }

@media only screen and (min-width: 1140px) { .conversation__molecule { top: -24px; } }

@media only screen and (max-width: 800px) { .conversation__molecule { height: 85px; left: -16px; margin-top: 10px; top: -24px; width: 85px; } }

@media only screen and (max-width: 400px) { .conversation__molecule { height: 65px; left: -12px; top: -18px; width: 65px; } }

.conversation__molecule { height: 65px; left: 0; top: 10px; width: 65px; }

@media only screen and (min-width: 1140px) { .conversation__molecule { left: -15px; } }

@media only screen and (max-width: 800px) { .conversation__molecule { height: 40px; left: 0; top: 0; width: 40px; } }

@media only screen and (max-width: 400px) { .conversation__molecule { left: -5px; } }

.conversation__molecule .molecule { background-color: #fff; background-image: url(/static/molecule.svg); background-position: center; background-repeat: no-repeat; background-size: 115%; border-radius: 100px; height: 100%; margin: 0; position: absolute; width: 100%; }

@media only screen and (min-width: 1140px) { .conversation__molecule .molecule { background-size: 90%; } }

.conversation__molecule .molecule { background-size: 115%; }

.bubble {
    background: #fff;
    border: 1.1px solid #e0e0e0;
    border-radius: 16.5px;
    color: #212121;
    display: inline-block;
    font-family: "Product Sans", sans-serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: .5px;
    line-height: 24px;
    margin: 10px 0;
    max-width: 268px;
    padding: 10px 15px;
    transition: opacity .75s;
}

.bubble {
    word-break: break-word;
}

.card__actions {
	-webkit-app-region: no-drag;
}

.bubble--filled, .bubble--user, .bubble--user2 {
    background: #e0e0e0;
}

.info-card {
    margin: 0.5rem;
    border-radius: 0.5rem;
}

.info-card .card__actions {
    display: block;
    padding: 1rem;
}

.info-card a {
    color: #ea4335;
    text-decoration: none;
}

.conversation-card {
    height: 100% !important;
}
</style>
