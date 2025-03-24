<template>
  <div class="pannellum-container">
    <div id="panorama" ref="panoramaContainer"></div>
  </div>
</template>

<script>
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'
// 确保全局pannellum对象可用
const pannellum = window.pannellum

export default {
  name: 'PannellumViewer',
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      viewer: null
    }
  },
  mounted () {
    this.initPannellum()
  },
  watch: {
    imageUrl() {
      // 当imageUrl变化时，重新初始化全景图
      if (this.viewer) {
        this.viewer.destroy()
      }
      this.$nextTick(() => {
        this.initPannellum()
      })
    }
  },
  beforeDestroy () {
    if (this.viewer) {
      this.viewer.destroy()
    }
  },
  methods: {
    initPannellum () {
      // 默认配置
      const defaultConfig = {
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        hfov: 100,
        compass: true
      }

      // 合并用户配置和默认配置
      const config = {
        ...defaultConfig,
        ...this.config,
        type: 'equirectangular',
        panorama: this.imageUrl,
        // 确保热点配置被正确传递
        hotSpots: this.config.hotSpots || []
      }

      // 初始化全景图查看器
      this.viewer = pannellum.viewer(this.$refs.panoramaContainer, config)

      // 监听事件
      this.viewer.on('load', () => {
        this.$emit('load')
      })

      this.viewer.on('error', (errorMsg) => {
        this.$emit('error', errorMsg)
      })
    }
  }
}
</script>

<style scoped>
.pannellum-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#panorama {
  width: 100%;
  height: 500px;
}
</style>