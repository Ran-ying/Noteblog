<template>
	<view class="sidebar">
		<view class="title" @click="useridInput"> Ying's Noteblog</view>
		<view class="files">
			<FileTree :items="fileData" @item-click="onItemClick" />
		</view>
	</view>
</template>

<script>
	import FileTree from './FileTree.vue';
	export default {
		emits: ['item-click'],
		data() {
			return {
				fileData: [],
			}
		},
		components: {
			FileTree
		},
		mounted() {
			this.getFileList();
		},
		methods: {
			getFileList() {
				this.$apiPost(`/config/getFileList`, {})
					.then(data => {
						// console.log(JSON.stringify(data));
						this.fileData = data;
					})
			},
			onItemClick(item) {
				this.$emit('item-click', item);
			},
			useridInput(){
				uni.showModal({
					title: 'userid',
					content: uni.getStorageSync('userid'),
					editable: true,
					confirmText: 'OK',
					cancelText: 'No',
					success: (res)=>{
						if(res.confirm){
							uni.setStorageSync('userid', res.content);
							this.getFileList();
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.sidebar {
		width: 200px;
		height: 100%;
		background-color: #252526;
		display: flex;
		flex-direction: column;
	}

	.title {
		padding: 48px 16px 4px 16px;
		font-size: 20px;
		height: 24px;
		background-color: #323233;
	}
</style>