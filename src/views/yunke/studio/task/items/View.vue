<template>
  <el-dialog
    :title="$t('common.view')"
    :width="width"
    :visible.sync="isVisible"
    class="user-view"
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="img-wrapper">
          <img :src="avatar">
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-minus" /> <span>标题：</span> {{ tasks.title }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-suitcase" /> <span>摘要：</span> {{ tasks.introduction }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-reading" /> <span>项目说明书：</span> {{ tasks.specification }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-folder" /> <span>源文件：</span>
          {{ tasks.url }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-aim" /> <span>是否已报销：</span> {{ tasks.reimbursement === 1 ? '是' : '否' }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-bangzhu" /> <span>{{ $t('table.user.status') +'：' }}</span> {{ tasks.state === 1 ? '进行中' : '已完成' }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-time" /> <span>开始时间：</span> {{ tasks.start_time | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-time" /> <span>结束时间：</span> {{ tasks.end_time | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-money" /> <span>花费：</span> {{ tasks.cost }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-circle-check" /> <span>发票：</span>
          {{ tasks.invoice }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-user" /> <span>成员：</span> {{ tasks.userId }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-user" /> <span>角色：</span> {{ tasks.user_state }}
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
export default {
  name: 'TasksView',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenWidth: 0,
      width: this.initWidth(),
      tasks: {}
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
      }
    },
    avatar() {
      if (this.tasks.avatar) {
        return require(`@/assets/avatar/${this.tasks.avatar}`)
      } else {
        return require('@/assets/avatar/default.jpg')
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 550) {
        return '95%'
      } else if (this.screenWidth < 990) {
        return '580px'
      } else if (this.screenWidth < 1400) {
        return '600px'
      } else {
        return '650px'
      }
    },
    setTasks(val) {
      this.tasks = { ...val }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-view {
    .img-wrapper {
      text-align: center;
      margin-top: -1.5rem;
      margin-bottom: 10px;
      img {
        width: 4rem;
        border-radius: 50%;
      }
    }
    .view-item {
      margin: 7px;
      i {
        font-size: .97rem;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
