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
      <el-form-item label="标题" prop="title">
        <el-input v-model="tasks.title"  />
      </el-form-item>
      <el-form-item label="摘要" prop="introduction">
        <el-input v-model="tasks.introduction"  />
      </el-form-item>
       <el-form-item label="开始时间">
        <el-col :span="15">
          <el-date-picker
      v-model="tasks.startTime"
      type="datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      class="filter-item search-item date-range-item"
      placeholder="选择日期时间">
    </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="结束时间">
        <el-col :span="15">
          <el-date-picker
      v-model="tasks.endTime"
      type="datetime"
      value-format="yyyy-MM-dd HH:mm:ss"
      class="filter-item search-item date-range-item"
      placeholder="选择日期时间">
    </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="花费" prop="cost">
        <el-input v-model.number="tasks.cost" />
      </el-form-item>
      <el-form-item label="发票" prop="invoice">
        <el-input v-model="tasks.invoice" />
      </el-form-item>
      <el-form-item label="项目说明书" prop="specification">
       <el-input type="textarea" v-model="tasks.specification"></el-input>
      </el-form-item>
      <el-form-item label="源文件" prop="url">
        <el-input v-model="tasks.url" />
      </el-form-item>
      <el-form-item :label="$t('table.user.status')" prop="state">
        <el-radio-group v-model="tasks.state">
          <el-radio label='1'>进行中</el-radio>
          <el-radio label='2'>已完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="报销" prop="reimbursement">
        <el-radio-group v-model="tasks.reimbursement">
          <el-radio label='0'>否</el-radio>
          <el-radio label='1'>是</el-radio>
        </el-radio-group>
      </el-form-item>
     <el-form-item label="项目成员" prop="userId">
        <el-select :disabled="tasks.itemsId === '' ? false : true" v-model="tasks.userId" multiple value="" placeholder="例如:张三，李四" style="width:100%">
          <el-option
            v-for="item in userRoles"
            :key="item.userId"
            :label="item.fullName"
            :value="String(item.userId)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目角色" prop="m_state">
        <el-select :disabled="tasks.itemsId === '' ? false : true" v-model="tasks.m_state" multiple value="" placeholder="例如:负责人，成员" style="width:100%">
          <el-option
            v-for="item in tasksRoles"
            :key="item.roleId"
            :label="item.roleName"
            :value="String(item.roleId)"
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

export default {
  name: 'ItemsEdit',
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
        itemsId: '',
        title: '',
        introduction: '',
        startTime: '',
        endTime: '',
        cost: 0.0,
        invoice: '',
        specification: '',
        url: '',
        state: '2',
        reimbursement: '0',
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
      this.tasks.state = '2'
      this.tasks.reimbursement = '0'
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.tasks.itemsId) {
            // create
            this.tasks.userId = this.tasks.userId.join(',')
            this.tasks.m_state = this.tasks.m_state.join(',')
            this.$post('studio/items', { ...this.tasks }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          } else {
            // update
            this.$put('studio/items', { ...this.tasks }).then((r) => {
              console.log(r)
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          }
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
