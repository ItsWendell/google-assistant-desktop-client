<template>
	<div id="app">
		<v-app light>
			<v-slide-y-transition mode="out-in">
				<assistant />
			</v-slide-y-transition>
		</v-app>
	</div>
</template>

<script>
import Assistant from '@/components/Assistant';

export default {
	name: 'GaDesktop',
	components: { Assistant },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,700|Material+Icons");

	#app .conversation-card {
		margin: 0.35rem;
	}


  .centered
  {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo
  {
    max-width: 14rem;
  }

  .link-btn
  {
    width: 150px;
  }

  .app-info {
    padding-top: 0px;
  }

  .hero h1 {
    margin: 0 auto;
    max-width: 880px;
    font-size: 42px;
    font-weight: 100;
  }

  .hero p {
    font-size: 20px;
    line-height: 32px;
    max-width: 430px;
    margin: 15px auto;
    font-weight: 300;
  }

#app,
.application--wrap {

	background-color: rgba(0, 0, 0, 0) !important;

	background: rgba(0, 0, 0, 0) !important;

}

	html {
		overflow-y: hidden;
		-webkit-app-region: drag;
	}

</style>
