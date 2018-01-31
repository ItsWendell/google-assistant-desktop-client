<template>
	<div id="mini">
		<assistant />
	</div>
</template>

<script>
import Assistant from '@/components/Assistant';

export default {
	name: 'Home',
	components: { Assistant },
};
</script>

<style scoped>

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


</style>
