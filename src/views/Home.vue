<template>
  <div class="home">
    <h1>Pannellum全景图示例</h1>
    <div class="panorama-wrapper">
      <PannellumViewer 
        :imageUrl="imageUrl"
        :config="pannellumConfig"
        @load="onPanoramaLoad"
        @error="onPanoramaError"
      />
    </div>
    <div class="controls">
      <h3>控制面板</h3>
      <div class="image-selector">
        <label>选择全景图：</label>
        <select v-model="selectedImage" @change="changeImage">
          <option value="bedroom">卧室</option>
          <option value="kitchen">厨房</option>
          <option value="livingroom">客厅</option>
        </select>
      </div>
      <button @click="toggleCompass">{{ showCompass ? '隐藏' : '显示' }}指南针</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      
      <div class="hotspot-controls">
        <h4>热点管理</h4>
        <div v-if="pannellumConfig.hotSpots.length > 0" class="hotspot-list">
          <div v-for="(hotspot, index) in pannellumConfig.hotSpots" :key="hotspot.id || index" class="hotspot-item">
            <span>{{ hotspot.text || '热点' + (index + 1) }}</span>
            <button @click="removeHotspot(index)" class="remove-btn">删除</button>
          </div>
        </div>
        <div v-else class="no-hotspots">当前场景没有热点</div>
        <button @click="addCurrentPositionHotspot">在当前视角添加热点</button>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import PannellumViewer from '@/components/PannellumViewer.vue'

export default {
  name: 'Home',
  components: {
    PannellumViewer
  },
  data() {
    return {
      selectedImage: 'bedroom',
      imageUrl: require('@/assets/img/bedroom.jpg'),
      pannellumConfig: {
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        hfov: 100,
        compass: true,
        hotSpots: []
      },
      // 为每个场景定义热点数据
      hotSpotsData: {
        bedroom: [
          {
            pitch: 0,
            yaw: 10,
            text: "床",
            id: "bed-hotspot"
          },
          {
            pitch: -10,
            yaw: -30,
            text: "衣柜",
            id: "wardrobe-hotspot"
          }
        ],
        kitchen: [
          {
            pitch: 5,
            yaw: 110,
            text: "冰箱",
            id: "fridge-hotspot"
          },
          {
            pitch: -5,
            yaw: -100,
            text: "灶台",
            id: "stove-hotspot"
          }
        ],
        livingroom: [
          {
            pitch: 0,
            yaw: 70,
            text: "沙发",
            id: "sofa-hotspot"
          },
          {
            pitch: -15,
            yaw: -50,
            text: "电视",
            id: "tv-hotspot"
          }
        ]
      },
      showCompass: true,
      viewer: null
    }
  },
  mounted() {
    // 初始化热点数据
    this.pannellumConfig.hotSpots = this.hotSpotsData[this.selectedImage] || []
  },
  methods: {
    onPanoramaLoad() {
      console.log('全景图加载完成')
      // 获取PannellumViewer组件中的viewer实例
      this.viewer = this.$children[0].viewer
    },
    onPanoramaError(errorMsg) {
      console.error('全景图加载错误:', errorMsg)
    },
    toggleCompass() {
      this.showCompass = !this.showCompass
      if (this.viewer) {
        this.pannellumConfig.compass = this.showCompass
        this.viewer.setConfig(this.pannellumConfig)
      }
    },
    zoomIn() {
      if (this.viewer) {
        const currentHfov = this.viewer.getHfov()
        this.viewer.setHfov(currentHfov - 10)
      }
    },
    zoomOut() {
      if (this.viewer) {
        const currentHfov = this.viewer.getHfov()
        this.viewer.setHfov(currentHfov + 10)
      }
    },
    // 添加热点到当前视角位置
    addCurrentPositionHotspot() {
      if (this.viewer) {
        // 获取当前视角位置
        const pitch = this.viewer.getPitch()
        const yaw = this.viewer.getYaw()
        
        // 创建新热点
        const newHotspot = {
          pitch: pitch,
          yaw: yaw,
          text: prompt('请输入热点描述', '新热点'),
          id: 'hotspot-' + Date.now()
        }
        
        if (newHotspot.text) {
          // 添加到当前场景的热点数据中
          this.hotSpotsData[this.selectedImage].push(newHotspot)
          
          // 更新配置
          this.pannellumConfig.hotSpots = [...this.hotSpotsData[this.selectedImage]]
          
          // 添加热点到查看器
          this.viewer.addHotSpot(newHotspot)
        }
      }
    },
    // 删除热点
    removeHotspot(index) {
      if (this.viewer && this.pannellumConfig.hotSpots[index]) {
        const hotspotId = this.pannellumConfig.hotSpots[index].id
        
        // 从数据中移除
        this.hotSpotsData[this.selectedImage].splice(index, 1)
        
        // 更新配置
        this.pannellumConfig.hotSpots = [...this.hotSpotsData[this.selectedImage]]
        
        // 从查看器中移除
        if (hotspotId) {
          this.viewer.removeHotSpot(hotspotId)
        }
      }
    },
    changeImage() {
      this.imageUrl = require(`@/assets/img/${this.selectedImage}.jpg`)
      // 更新热点数据
      this.pannellumConfig.hotSpots = this.hotSpotsData[this.selectedImage] || []
      // 不需要手动销毁和重新初始化，PannellumViewer组件会监听imageUrl变化并自行处理
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.panorama-wrapper {
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.controls {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.image-selector {
  margin-bottom: 15px;
}

select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-left: 10px;
}

button {
  margin: 0 10px;
  padding: 8px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3aa876;
}

.hotspot-controls {
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.hotspot-list {
  margin: 10px 0;
  max-height: 200px;
  overflow-y: auto;
}

.hotspot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.remove-btn {
  padding: 3px 8px;
  background-color: #ff6b6b;
  margin: 0;
}

.remove-btn:hover {
  background-color: #ff5252;
}

.no-hotspots {
  color: #999;
  font-style: italic;
  margin: 10px 0;
}
</style>
