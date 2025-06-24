import App from './App'
let apiAddress = `http://127.0.0.1:14000`;

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$apiAddress = apiAddress;
	app.config.globalProperties.$apiPost = (api, data = {}) => {
		let headers = {
			'Content-Type': 'application/json;charset=utf-8'
		};
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${apiAddress}${api}?userid=${uni.getStorageSync('userid')}`, // 服务器接口地址
				method: 'POST',
				header: headers, // 注意这里是 header 不是 headers
				data: JSON.stringify(data), // 请求的参数
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.data); // 成功的响应数据
					} else {
						reject(res); // 处理返回的错误状态
					}
				},
				fail: (err) => {
					reject(err); // 处理请求失败的情况
				}
			});
		});
	};
	return {
		app
	}
}
// #endif