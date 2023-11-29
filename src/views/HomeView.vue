<!--
 * @Author: 杨道博
 * @Date: 2023-07-13 10:59:29
 * @LastEditors: 陈巧龙
 * @LastEditTime: 2023-09-18 09:59:27
 * @FilePath: \ys.skxlsyb\src\views\HomeView.vue
 * @Descripttion: 主页面
-->
<template>
  <div class="home">
    <!-- 系统头部 -->
    <header>
      <HeaderView></HeaderView>
    </header>

    <!-- 系统主体 -->
    <main>
      <!-- cesium球 -->
      <CesiumView></CesiumView>

      <!-- 预报设置 -->
      <YbszView v-if="showComponents"></YbszView>

      <!-- 动画方案设置 -->
      <DhfaszView></DhfaszView>

      <!-- 水位纳雨量弹窗框 -->
      <SwnylView v-if="showNYLPage"></SwnylView>

      <!-- 历史经验预报 -->
      <LsjyybView v-if="showComponents"></LsjyybView>
    </main>
  </div>
</template>

<script>
import bus from '@/utils/bus'
import { Message } from 'element-ui';
import YbszView from '@/components/ybsz/YbszView.vue';
import SwnylView from '@/components/swnyl/SwnylView.vue'
import CesiumView from '@/components/cesium/CesiumView.vue';
import LsjyybView from '@/components/lsjyyb/LsjyybView.vue';
import HeaderView from '@/components/header/HeaderView.vue';
import DhfaszView from '@/components/dhfasz/DhfaszView.vue'
import { getResWaterNYL, getCurrentWL, getYjq } from "@/api/home"

export default {
  name: 'HomeView',
  data() {
    return {
      //控制预报页面和历史经验预报页面的显示
      showComponents: false,
      //控制纳雨量与水水位页面的显示
      showNYLPage: false,
      //再次存储纳雨量数据，以便于图表的绘制
      nylData: [],
      //保存城市编码
      resCode: null,
      //保存当前水位
      currentLevel: null,
    }
  },
  components: {
    CesiumView,
    LsjyybView,
    YbszView,
    DhfaszView,
    HeaderView,
    SwnylView,
  },
  created() {
    // 添加事件监听
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  mounted() {
    //接受headerView传来的水库编码，随后将三个页面进行打开
    this.$bus.$on("rc", (value) => {
      if (value) {
        //相应组件进行展示
        this.showComponents = true;
      }
    });

    //接受headerView传来的纳雨量与水位的数据，并且将其进行保存
    this.$bus.$on("fn", (value) => {
      this.nylData = value
    });

    //接受CesiumEvent.js传来的所选择的水库名字
    bus.$on('resName', value => {
      if (value === '杨树堰水库' || value === '金盆水库') {
        this.toggleNYLPage()
        setTimeout(() => {
          this.$bus.$emit("showCurrentData", this.nylData);
        }, 1500);
      } else if (Number(value[3])) {
        this.toggleNYLPage()
        //发送水库编码获取水库的各水位信息
        this.acceptWaterNYL([value[2]])
          .then(() => {
            this.$bus.$emit("showNYLData", this.nylData[value[2]]);
          })
        //发送水库编码获取水库的当前水位
        this.acceptCurrentWL([value[2]]).then(() => {
          this.$bus.$emit("showCurrentData", this.currentLevel[value[2]]);
        })
      }
    })

    //接受SwnylView传来的关闭的命令
    this.$bus.$on("closeNYLPage", (value) => {
      if (!value) {
        this.toggleNYLPage()
      }
    });

    this.resCode = this.getUrlKey("id");
    this.$bus.$emit("resCode", this.resCode);

    //获得遇见期信息
    this.reciveYjp()
  },
  methods: {
    //控制打开与关闭水位纳雨量窗口
    toggleNYLPage() {
      this.showNYLPage = !this.showNYLPage
    },
    getUrlKey(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [null, ""])[1].replace(/\+/g, '%20')) || null
    },
    //监听键盘的enter事件
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        this.resCode = this.getUrlKey("id");
        if (this.resCode) {
          this.$bus.$emit("resCode", this.resCode);
        }
      }
    },
    //获取各个水库的水位纳雨量数据
    acceptWaterNYL(param) {
      return getResWaterNYL(param).then(res => {
        this.nylData = []
        this.nylData = res.data

        return true
      })
        .catch(error => {
          this.nylData = []
          console.log(error);
          Message.error('数据获取失败！');
        });
    },
    //向后端传递水库编码，获取当前水位
    acceptCurrentWL(param) {
      return getCurrentWL(param).then(res => {
        this.currentLevel = res.data
        return true
      })
        .catch(error => {
          console.log(error);
          this.currentLevel = null;
          Message.error('当前水位数据获取失败！');
        });
    },
    //获得后台已存在的遇见期
    reciveYjp() {
      getYjq('yes').then(res => {
        //将堰顶高程数据进行储存
        this.$store.commit('updateYjq', res.data)
      })
        .catch(error => {
          console.log(error);
        });
    },
  }
}
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;

  header {
    position: absolute;
    height: 72px;
    top: 0;
    left: 0;
    width: 1000px;
    z-index: 1;
  }

  main {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 0;
  }
}
</style>
