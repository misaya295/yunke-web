<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="tasks" :rules="rules" label-position="right" label-width="100px">
      <!-- 标题 -->
      <el-form-item label="标题" prop="title">
        <el-input v-model="tasks.title"  />
      </el-form-item>
      <!-- 摘要 -->
      <el-form-item label="摘要" prop="introduction">
        <el-input v-model="tasks.introduction"  />
      </el-form-item>
      <!-- 比赛类型 -->
      <el-form-item label="比赛类型" prop="type">
        <el-radio-group v-model="tasks.type">
          <el-radio label='0'>个人</el-radio>
          <el-radio label='1'>团队</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛等级 -->
      <el-form-item label="比赛等级" prop="level">
        <el-radio-group v-model="tasks.level">
          <el-radio label='0'>国家级</el-radio>
          <el-radio label='1'>省级</el-radio>
          <el-radio label='2'>校级</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 申请书 -->
      <el-form-item label="申请书" prop="application_form">
        <el-input v-model.number="tasks.application_formt" />
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="tasks.state">
          <el-radio label='1'>进行中</el-radio>
          <el-radio label='2'>已完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 发票 -->
      <el-form-item label="发票" prop="invoice">
        <el-input v-model="tasks.invoice" />
      </el-form-item>
      <!-- 是否已报销 -->
      <el-form-item label="报销" prop="reimbursement">
        <el-radio-group v-model="tasks.reimbursement">
          <el-radio label='0'>未报销</el-radio>
          <el-radio label='1'>已报销</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛时间 -->
      <el-form-item label="比赛时间" prop="time">
        <el-input v-model="tasks.time"></el-input>
      </el-form-item>
      <!-- 花费 -->
      <el-form-item label="花费" prop="cost">
        <el-input v-model.number="tasks.cost" />
      </el-form-item>
      <!-- 证书 -->
      <el-form-item label="证书" prop="certificate">
        <el-input v-model="tasks.certificate" />
      </el-form-item>
      <!-- 成员 -->
      <el-form-item label="成员" prop="userId">
        <el-select v-model="tasks.userId" multiple value="" placeholder="例如:张三，李四" style="width:100%">
          <el-option
            v-for="match in userRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 对应id状态 -->
      <el-form-item label="比赛角色" prop="m_state">
        <el-select v-model="tasks.m_state" multiple value="" placeholder="例如:负责人，成员" style="width:100%">
          <el-option
            v-for="match in tasksRoles"
            :key="match.roleId"
            :label="match.roleName"
            :value="String(match.roleId)"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
// import { validMobile } from '@/utils/my-validate'
// import Treeselect from '@riophae/vue-treeselect'
export default {
  name: 'MatchEdit',
  // components: { Treeselect },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      initFlag: false,
      tasks: this.initTasks(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      userRoles: [],
      tasksRoles: [{
        roleId: 1,
        roleName: '负责人'
      },
      {
        roleId: 2,
        roleName: '成员'
      },
      {
        roleId: 3,
        roleName: '指导老师'
      }
      ],
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20', trigger: 'blur' }],
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        level: { required: true, message: this.$t('rules.require'), trigger: 'change' }
      }
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
      }
    }
  },
  mounted() {
    this.initUserRoles()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initTasks() {
      return {
        title: '',
        introduction: '',
        type: 0,
        level: 1,
        application_form: '',
        state: 1,
        invoice: '',
        reimbursement: 0,
        time: '',
        cost: 0.0,
        certificate: '',
        userId: '',
        m_state: []
      }
    },
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '800px'
      }
    },
    initUserRoles() {
      this.$get('system/user').then((r) => {
        const userRoles = []
        const rows = r.data.data.rows
        rows.forEach((v, i) => {
          const obj = {
            userId: v.userId,
            fullName: v.fullName
          }
          userRoles.push(obj)
        })
        this.userRoles = userRoles
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    setTasks(val) {
      this.tasks = { ...val }
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          console.log(this.tasks.matchId)
          if (this.tasks.matchId) {
            this.$put('studio/match', { ...this.tasks }).then((r) => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          } else {
            this.tasks.userId = this.tasks.userId.join(',')
            this.tasks.m_state = this.tasks.m_state.join(',')
            this.$post('studio/match', { ...this.tasks }).then((r) => {
              // console.log(r)
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          }
          // if (!this.tasks.thesisId) {
          // create
          // } else {
          // update
          // }
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.tasks = this.initTasks()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
