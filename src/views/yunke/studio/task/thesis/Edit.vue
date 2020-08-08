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
            <!-- 论文类型 -->
            <el-form-item label="论文类型" prop="paper_type">
                <el-radio-group v-model="tasks.paper_type">
                    <el-radio label='1'>核心</el-radio>
                    <el-radio label='2'>普通</el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- 论文下载 -->
            <el-form-item label="论文下载" prop="url">
                <el-input v-model="tasks.url"  />
            </el-form-item>
            <!-- 花费 -->
            <el-form-item label="花费" prop="cost">
                <el-input v-model="tasks.cost"  />
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
            <el-form-item label="是否已报销" prop="reimbursement">
                <el-radio-group v-model="tasks.reimbursement">
                    <el-radio label='0'>否</el-radio>
                    <el-radio label='1'>是</el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- 成员 -->
            <el-form-item label="成员" prop="userId">
               <el-select v-model="tasks.userId" multiple value="" placeholder="例如:张三，李四" style="width:100%">
                <el-option
                    v-for="thesis in userRoles"
                    :key="thesis.userId"
                    :label="thesis.fullName"
                    :value="String(thesis.userId)"
                />
                </el-select>
            </el-form-item>
            <!-- 论文角色 -->
            <el-form-item label="论文角色" prop="m_state">
               <el-select v-model="tasks.m_state" multiple value="" placeholder="例如:负责人，成员" style="width:100%">
                 <el-option
                    v-for="thesis in tasksRoles"
                    :key="thesis.roleId"
                    :label="thesis.roleName"
                    :value="String(thesis.roleId)"
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
  name: 'ThesisEdit',
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
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
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
        paper_type: 2,
        url: '',
        cost: 0.0,
        state: 1,
        invoice: '',
        reimbursement: 0,
        userId: '',
        // time:'',
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
          console.log(this.tasks.thesisId)
          if (this.tasks.thesisId) {
            this.$put('studio/thesis', { ...this.tasks }).then((r) => {
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
            this.$post('studio/thesis', { ...this.tasks }).then((r) => {
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
