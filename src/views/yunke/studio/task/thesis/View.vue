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
          <i class="el-icon-user" /> <span>{{ '任务Id' +'：' }}</span> {{ thesis.thesis_id }}
        </div>
      </el-col>
      <!-- 任务标题 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-suitcase" /> <span>{{ '任务标题' +'：' }}</span> {{ thesis.title }}
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <!-- 摘要 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-bangzhu" /> <span>{{ '摘要' +'：' }}</span> {{ thesis.introduction}}
        </div>
      </el-col>
       <!-- 论文类型 -->
       <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-phone-outline" /> <span>{{ '论文类型' +'：' }}</span> {{ thesis.paper_type | paper_typeFilter }}
        </div>
       </el-col>
     </el-row>
     <el-row :gutter="10">
      <!-- 更新时间 -->
      <el-col :xs="24" :sm="12"> 
        <div class="view-item">
          <i class="el-icon-bell" /> <span>{{ '更新时间' +'：' }}</span> {{ thesis.time }}
        </div>
      </el-col>
      <!-- 论文下载 -->
       <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-suitcase" /> <span>{{ '论文下载' +'：' }}</span> {{ thesis.url }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 花费 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-time" /> <span>{{ '花费' +'：' }}</span> {{ thesis.cost }}
        </div>
      </el-col>
       <!-- 发票 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-bell" /> <span>{{ '发票' +'：' }}</span>
          {{ thesis.invoice }}
        </div>
      </el-col>
    </el-row>
   
    <el-row :gutter="10">
      <!-- 状态 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-document" /> <span>{{ '状态' +'：' }}</span> {{ thesis.state | stateFilter }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <!-- 报销 -->
        <div class="view-item">
          <i class="el-icon-news" /> <span>{{ '报销' +'：' }}</span>
          {{ thesis.reimbursement | reimbursementFilter }}
        </div>
      </el-col>
    </el-row>
     <el-row :gutter="10">
      <!-- 比赛角色 -->
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-document" /> <span>{{ '比赛角色' +'：' }}</span> {{ thesis.user_state | userStateFilter}}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <!-- 成员 -->
        <div class="view-item">
          <i class="el-icon-news" /> <span>{{ '成员' +'：' }}</span>
          {{ getName(thesis.thesis_id) }} {{ users }}
        </div>
      </el-col>
    </el-row>
  </el-dialog>
  <!-- 负责人 -->
            <!-- <el-form-item label="负责人" >
              <el-select :disabled="tasks.thesisId === '' ? false : true" v-model="team.reliable"  value="" placeholder="负责人" style="width:100%">
                <el-option
                  v-for="thesis in userRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item> -->
            <!-- 成员 -->
            <!-- <el-form-item label="成员" >
              <el-select :disabled="tasks.thesisId === '' ? false : true" v-model="team.member" multiple value="" placeholder="成员" style="width:100%">
                <el-option
                  v-for="thesis in userRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item> -->
            <!-- 指导老师 -->
            <!-- <el-form-item label="指导老师" >
              <el-select :disabled="tasks.thesisId === '' ? false : true" v-model="team.teacher" multiple value="" placeholder="指导老师" style="width:100%">
                <el-option
                  v-for="thesis in teacherRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item> -->
</template>
<script>
import Index from "./Index.vue";
export default {
  
  name: 'ThesisView',
  props: {
    taskId: Number,
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  filters: {
    // 论文类型
    paper_typeFilter(paper_type) {
      const map = {
        1: '核心',
        2: '普通'
      }
      return map[paper_type]
    },
    // 状态
    stateFilter(state){
        const map = {
            1: '进行中',
            2: '已完成'
        }
         return map[state]
    },
    // 是否已报销
    reimbursementFilter(reimbursement){
      const map={
        0:'未报销',
        1:'已报销'
      }
      return map[reimbursement]
    },
    userStateFilter(thesis_state){
       const map = {
        1: '负责人',
        2: '成员',
        3: '指导老师',
      }
      return map[thesis_state]
    }
  },
  data() {
    return {
      user: {},
      users: {},
      screenWidth: 0,
      width: this.initWidth(),
      thesis: {}
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
    // 获取成员
    getName(i){
        let nameArr = new Array();
        this.$get(`studio/members/${i}`).then((r) => {
          let tmp=r.data.data.rows;
          for(i=0; i<tmp.length; i++){
            nameArr.push(tmp[i].full_name)  
          }
          this.users = nameArr.join("、");
        })
    },
    reInitTask(t){
      this.$get(`studio/thesis/${t.thesisId}`).then((r) => {
        this.thesis = r.data.data;
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
    setThesis(val) {
     this.reInitTask(val);
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
