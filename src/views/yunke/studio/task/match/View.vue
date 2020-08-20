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
      <!-- 任务Id -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-user" /> <span>{{ '任务Id' +'：' }}</span> {{ match.match_id }}
        </div>
      </el-col>
      <!-- 任务标题 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-suitcase" /> <span>{{ '任务标题' +'：' }}</span> {{ match.title }}
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="10">

      <!-- 比赛等级 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-trophy" /> <span>{{ '比赛等级' +'：' }}</span> {{ match.level | levelFilter }}
        </div>
      </el-col>

      <!-- 比赛类型 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-phone-outline" /> <span>{{ '比赛类型' +'：' }}</span> {{ match.type | typeFilter }}
        </div>
      </el-col>
    </el-row>
    <!-- 申请书 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-off" /> <span>{{ '申请书' +'：' }}</span> {{ match.application_form }}
        </div>
      </el-col>
      <!-- 比赛时间 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-bangzhu" /> <span>{{ '比赛时间' +'：' }}</span> {{ match.time }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 花费 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-time" /> <span>{{ '花费' +'：' }}</span> {{ match.cost }}
        </div>
      </el-col>
      <!-- 发票 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-bell" /> <span>{{ '发票' +'：' }}</span>
          {{ match.invoice }}
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <!-- 状态 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-document" /> <span>{{ '状态' +'：' }}</span> {{ match.state | stateFilter }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <!-- 报销 -->
        <div class="view-item">
          <i class="el-icon-news" /> <span>{{ '报销' +'：' }}</span>
          {{ match.reimbursement | reimbursementFilter }}
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <!-- 比赛角色 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-document" /> <span>{{ '比赛角色' +'：' }}</span> {{ match.user_state | userStateFilter }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <!-- 成员 -->
        <div class="view-item">
          <i class="el-icon-news" /> <span>{{ '成员' +'：' }}</span>
          {{ getName(match.match_id) }} {{ users }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 证书 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-magic-stick" /> <span>{{ '证书' +'：' }}</span> {{ match.certificate }}
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import Index from './Index.vue'
export default {

  name: 'MatchView',
  filters: {
    // 比赛等级
    levelFilter(level) {
      const map = {
        0: '国家级',
        1: '省级',
        2: '校级'
      }
      return map[level]
    },
    // 比赛类型
    typeFilter(type) {
      const map = {
        0: '个人',
        1: '团队'
      }
      return map[type]
    },

    usersFilter(userIds) {
      // let u = [];

      // if(typeof userIds == "string"){
      //   this.get(`${userIds}`).then((r) => {
      //     u = r.data.data.name
      //   })
      // }else if(typeof userIds == "object"){
      // }
      // u = [1,2,3];
      // u.forEach(function (item){
      //   console.log(item)
      // })

      // return u;
    },
    userStateFilter(userState) {
      const map = {
        1: '负责人',
        2: '成员',
        3: '指导老师'
      }
      return map[userState]
    },
    // 状态
    stateFilter(state) {
      const map = {
        1: '进行中',
        2: '已完成'
      }
      return map[state]
    },
    // 是否已报销
    reimbursementFilter(reimbursement) {
      const map = {
        0: '未报销',
        1: '已报销'
      }
      return map[reimbursement]
    }
  },
  props: {
    taskId: Number,
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  props: {
    taskId: Number,
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      user: {},
      users: [],
      screenWidth: 0,
      width: this.initWidth(),
      match: {}
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
      if (this.user.avatar) {
        return require(`@/assets/avatar/${this.user.avatar}`)
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
    getName(i) {
      const nameArr = new Array()
      this.$get(`studio/members/${i}`).then((r) => {
        const tmp = r.data.data.rows
        for (i = 0; i < tmp.length; i++) {
          nameArr.push(tmp[i].full_name)
        }
        this.users = nameArr.join('、')
      })
    },
    reInitTask(t) {
      this.$get(`studio/match/${t.matchId}`).then((r) => {
        this.match = r.data.data
      })
    },
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
    setUser(val) {
      this.user = { ...val }
    },
    setMatch(val) {
      this.reInitTask(val)
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
