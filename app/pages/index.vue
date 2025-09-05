<template>
	<view class="container">
		<SidebarVue class="sidebarVue" v-show="sidebarStatus" @item-click="onItemClick"></SidebarVue>
		<ContentVue class="contentVue" :fileItem="fileItem" @sidebarChange="sidebarStatus = !sidebarStatus">

		</ContentVue>
	</view>
</template>

<script>
	import SidebarVue from './sidebar.vue';
	import ContentVue from './content.vue';
	export default {
		components: {
			SidebarVue,
			ContentVue,
		},
		data() {
			return {
				fileItem: "",
				sidebarStatus: false,
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: "Ying's Noteblog"
			})
		},
		mounted() {
			this.fileItem = {
				fullPath: "README.md",
				index: 1,
				name: "",
				type: "file",
			}
		},
		methods: {

			onItemClick(item) {
				//console.log('父组件收到点击：', item.name, item.type, item.fullPath);

				if (item.type === 'file') {
					this.fileItem = item;
					uni.setNavigationBarTitle({
						title: this.fileItem.name
					})
				}
			}
		}
	}
</script>

<style scoped>
	page {
		height: 100%;
	}

	.container {
		width: 100%;
		height: 100%;
		background-color: #1e1e1e;
		color: #FFFFFF;
		display: flex;
	}

	.sidebarVue {
		width: 200px;
		position: absolute;
		z-index: 100;
	}

	.contentVue {
		flex: 1;
	}
</style>