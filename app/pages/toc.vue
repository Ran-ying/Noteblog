<template>
	<view class="sidebar">
		<view class="title" @click="tocShow = ! tocShow"> {{title}} </view>
		<view class="toc" v-show="tocShow">

			<div v-for="(item, index) in fileTitle" :key="index" :style="{ paddingLeft: (item.level)*20+'px' }">
				<div @click="scrollTo(item.target)">{{ item.title }}</div>
			</div>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['fileTitle', 'title'],
		data() {
			return {
				toc: '',
				tocShow: true,
			};
		},
		watch: {
			fileTitle(newVal) {
				this.tocShow = true;
			}
		},
		methods: {
			scrollTo(target) {
			  const el = document.getElementById(target);
			  if (el) {
			    el.scrollIntoView({ behavior: "smooth" });
			  }
			}
		}
	}
</script>

<style scoped>
	.sidebar {
		width: 200px;
		height: 100%;
		display: flex;
		flex-direction: column;

	}

	.title {
		padding: 48px 16px 16px 16px;
		font-size: 20px;
		height: 24px;
		background-color: #323233;
	}


	.toc {
		padding: 16px;
		background-color: #252526;
		overflow-y: auto;
	}
</style>