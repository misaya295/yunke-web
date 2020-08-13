<template>
  <el-dialog
    :title="title"
    :width="width"
    top="30px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="tasks" :rules="rules" label-position="right" label-width="100px">
      <!-- 比赛名称 -->
      <el-form-item label="比赛名称" prop="title">
        <el-input v-model="tasks.title"  />
      </el-form-item>
      <!-- 比赛类型 -->
      <el-form-item label="比赛类型" prop="type">
        <el-radio-group v-model="tasks.type">
          <el-radio :label='0'>个人</el-radio>
          <el-radio :label='1'>团队</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛等级 -->
      <el-form-item label="比赛等级" prop="level">
        <el-radio-group v-model="tasks.level">
          <el-radio :label='0'>国家级</el-radio>
          <el-radio :label='1'>省级</el-radio>
          <el-radio :label='2'>校级</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛名次 -->
      <el-form-item label="比赛名次" prop="rankCode">
        <el-radio-group v-model="tasks.rankCode">
          <el-radio :label='1'>一等奖</el-radio>
          <el-radio :label='2'>二等奖</el-radio>
          <el-radio :label='3'>三等奖</el-radio><br/>
          <el-radio :label='4'>特等奖</el-radio>
          <el-radio :label='5'>优胜奖</el-radio>
          <el-radio :label='6'>无</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 负责人 -->
      <el-form-item label="负责人" >
        <el-select v-model="team.reliable"  value="" placeholder="负责人" style="width:100%">
          <el-option
            v-for="match in userRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 成员 -->
      <el-form-item label="成员" >
        <el-select v-model="team.member" multiple value="" placeholder="成员(不包含负责人)" style="width:100%">
          <el-option
            v-for="match in userRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 指导老师 -->
      <el-form-item label="指导老师" >
        <el-select v-model="team.teacher" multiple value="" placeholder="指导老师" style="width:100%">
          <el-option
            v-for="match in teacherRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 比赛时间 -->
      <el-form-item label="比赛时间" prop="time">
        <el-date-picker
          v-model="tasks.time"
          type="date"
          placeholder="选择日期"
          align="right"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 申请书 -->
      <el-form-item label="申请书" prop="applicationForm">
        <el-upload
          :before-upload="handleBeforeUpload"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessApply"
          :file-list="fileList"
          :action="uploadUrl"
          class="upload-demo"
          :headers="headers"
          multiple
          :limit="1"
          :disabled="files.length===1?true:false"
          drag
        >
          <i class="el-icon-upload" />
          <i v-if="files.length<1" class="el-icon-plus" />
          <i v-else class="el-icon-close" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，<b>可同时上传1个附件</b>，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="tasks.state">
          <el-radio :label='1'>进行中</el-radio>
          <el-radio :label='2'>已完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 花费 -->
      <el-form-item label="花费" prop="cost">
        <el-input v-model.number="tasks.cost" />
      </el-form-item>
      <!-- 发票 -->
      <el-form-item label="发票" prop="invoice">
        <el-upload
          :before-upload="handleBeforeUpload"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccess"
          :file-list="fileList"
          :action="uploadUrl"
          class="upload-demo"
          :headers="headers"
          multiple
          :limit="3"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 是否已报销 -->
      <el-form-item label="报销" prop="reimbursement">
        <el-radio-group v-model="tasks.reimbursement">
          <el-radio :label='0'>未报销</el-radio>
          <el-radio :label='1'>已报销</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 证书 -->
      <el-form-item label="证书" prop="certificate">
        <!-- <el-input v-model="tasks.certificate" /> -->
        <el-upload
          :before-upload="handleBeforeUpload"
          :before-remove="handleBeforeRemove"
          :on-success="certificateHandleSuccess"
          :file-list="fileList"
          :action="uploadUrl"
          class="upload-demo"
          :headers="headers"
          multiple
          :limit="3"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
        </el-upload>
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
import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validateFileExt } from '@/utils/my-validate'
export default {
  name: 'MatchEdit',
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
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      uploadUrl: qiNiuUrl,
      fileList: [],
      files: [],
      fileUrlList: [],
      matchId: '',
      initFlag: false,
      tasks: this.initTasks(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      userRoles: [],
      teacherRoles: [],
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20', trigger: 'blur' }],
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
      },
      team: {
        reliable: [],
        member: [],
        teacher: []
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
        matchId: '',
        title: '',
        type: 1,
        level: 1,
        applicationForm: '',
        state: 1,
        invoice: '',
        reimbursement: 0,
        time: '',
        cost: 0.0,
        certificate: '',
        rankCode: 6,
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
        const teacherRoles = []
        const rows = r.data.data.rows
        rows.forEach((v, i) => {
          const obj = {
            userId: v.userId,
            fullName: v.fullName
          }
          if (v.noteId === '1') teacherRoles.push(obj)
          else userRoles.push(obj)
        })
        this.userRoles = userRoles
        this.teacherRoles = teacherRoles
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    setTasks(val) {
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.tasks = Object.assign({}, val)
      this.team.reliable = val.reliable
      this.team.member = val.member
      this.team.teacher = val.teacher
      if (this.tasks.invoice.length > 1) {
        this.fileUrlList = this.tasks.invoice.split(',')
      } else {
        this.fileUrlList = this.tasks.invoice
      }
      for (var i = 0; i < this.fileUrlList.length; i++) {
        var fileurl = this.fileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.fileList.push({
            name: fileurl.substring(28),
            url: fileurl
          })
        }
      }
    },
    close() {
      this.team = {
        reliable: '',
        member: [],
        teacher: []
      }
      this.doSubmit()
      this.$emit('close')
    },
    handleSuccessApply(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.applicationForm === '' || this.tasks.applicationForm === null) {
        this.tasks.applicationForm = response.data.url
      } else {
        this.tasks.applicationForm = this.tasks.applicationForm + ',' + response.data.url
      }
    },
    certificateHandleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.certificate === '' || this.tasks.certificate === null) {
        this.tasks.certificate = response.data.url
      } else {
        this.tasks.certificate = this.tasks.certificate + ',' + response.data.url
      }
    },
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.invoice === '' || this.tasks.invoice === null) {
        this.tasks.invoice = response.data.url
      } else {
        this.tasks.invoice = this.tasks.invoice + ',' + response.data.url
      }
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          this.$delete(`oss/content/${this.files[i].id}`).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          return true
        }
      }
    },
    handleBeforeUpload(file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: '上传文件大小不能超过5MB!',
          type: 'error'
        })
        return false
      } else {
        const ext = file.name.replace(/.+\./, '')
        if (!validateFileExt(ext)) {
          this.$message({
            type: 'error',
            message: '禁止上传' + ext + '类型的附件'
          })
          return false
        }
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.tasks.matchId) {
            // create
            // 调用getDge
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            this.doSubmit()
            this.tasks.userId = a
            this.tasks.m_state = b
            this.$post('studio/match', { ...this.tasks }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
              this.team = {
                reliable: '',
                member: [],
                teacher: []
              }
            })
          } else {
            // update
            // 调用getDge
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            this.tasks.userId = a
            this.tasks.m_state = b
            this.$put('studio/match', { ...this.tasks }).then((r) => {
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
    getDge(reliable, member, teacher) {
      const reliableArr = []
      const memberArr = []
      const teacherArr = []
      // 负责人
      if (reliable.length > 0) {
        reliableArr.push('1')
      }
      // 成员
      member.forEach((v, i) => {
        memberArr.push('2')
      })
      // 指导老师
      teacher.forEach((v, i) => {
        teacherArr.push('3')
      })
      let a = [...reliable, ...member, ...teacher]
      const b = [...reliableArr, ...memberArr, ...teacherArr].join(',')
      // 进行判断是否多次选择同一个人
      let flag = false
      var obj = {}
      for (var i = 0; i < a.length; i++) {
        if (obj[a[i]]) flag = true
        obj[a[i]] = true
      }
      a = a.join(',')
      return {
        a,
        b,
        flag
      }
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.tasks = this.initTasks()
    },
    // 刷新上传列表
    doSubmit() {
      this.fileList = []
      this.fileUrlList = []
      this.dialogImageUrl = ''
      this.dialog = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
